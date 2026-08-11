import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createClerkClient } from "@clerk/backend";
import { Prisma } from "@sealed/database";
import { PrismaService } from "../../prisma/prisma.service";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import {
  slugifyFromEmail,
  uniqueTenantSlug,
} from "../../common/helpers/slugify";

type PrismaClientOrTx = PrismaService | Prisma.TransactionClient;

export type ProvisionClerkUserInput = {
  clerkUserId: string;
  email: string;
  name: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  findByTenant(tenantId: string) {
    return this.prisma.user.findMany({ where: { tenantId } });
  }

  async provisionFromClerk(
    input: ProvisionClerkUserInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client: PrismaClientOrTx = tx ?? this.prisma;

    const existing = await client.user.findUnique({
      where: { clerkUserId: input.clerkUserId },
      include: { tenant: true },
    });

    if (existing) {
      return existing;
    }

    try {
      return await this.createUserWithTenant(input, tx);
    } catch (error) {
      // Two concurrent first requests can both miss the existing-user check;
      // the loser hits the clerkUserId unique constraint — return the winner.
      if ((error as { code?: string }).code === "P2002") {
        const winner = await client.user.findUnique({
          where: { clerkUserId: input.clerkUserId },
          include: { tenant: true },
        });
        if (winner) {
          return winner;
        }
      }
      throw error;
    }
  }

  private createUserWithTenant(
    input: ProvisionClerkUserInput,
    tx?: Prisma.TransactionClient,
  ) {
    const run = async (tx: Prisma.TransactionClient) => {
      const tenant = await (async () => {
        while (true) {
          const slug = await uniqueTenantSlug(tx, slugifyFromEmail(input.email));

          try {
            return await tx.tenant.create({
              data: {
                name: input.name,
                slug,
              },
            });
          } catch (error: unknown) {
            const prismaError = error as { code?: string };
            // Tenant.slug is @unique; handle possible concurrent creates.
            if (prismaError.code === "P2002") continue;
            throw error;
          }
        }
      })();

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          clerkUserId: input.clerkUserId,
          email: input.email,
          name: input.name,
          role: "OWNER",
        },
      });

      await emitActivityEvent(tx, {
        tenantId: tenant.id,
        actorId: user.id,
        objectType: "tenant",
        objectId: tenant.id,
        eventType: "tenant.created",
        metadata: { slug: tenant.slug },
      });

      await emitActivityEvent(tx, {
        tenantId: tenant.id,
        actorId: user.id,
        objectType: "user",
        objectId: user.id,
        eventType: "user.created",
        metadata: { email: user.email },
      });

      return { ...user, tenant };
    };

    // When called from within an existing transaction (e.g. the Clerk
    // webhook inbox claim), reuse it — opening a second, nested
    // `$transaction` here would run on a different connection and break
    // atomicity with the caller's inbox claim.
    if (tx) {
      return run(tx);
    }
    return this.prisma.$transaction(run);
  }

  async syncFromClerk(
    input: ProvisionClerkUserInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client: PrismaClientOrTx = tx ?? this.prisma;

    const existing = await client.user.findUnique({
      where: { clerkUserId: input.clerkUserId },
    });

    if (!existing) {
      return this.provisionFromClerk(input, tx);
    }

    return client.user.update({
      where: { id: existing.id },
      data: {
        email: input.email,
        name: input.name,
        status: "ACTIVE",
      },
    });
  }

  async deactivateByClerkId(clerkUserId: string, tx?: Prisma.TransactionClient) {
    const client: PrismaClientOrTx = tx ?? this.prisma;

    const existing = await client.user.findUnique({
      where: { clerkUserId },
    });

    if (!existing) {
      return null;
    }

    return client.user.update({
      where: { id: existing.id },
      data: { status: "DISABLED" },
    });
  }

  async provisionFromClerkId(clerkUserId: string, secretKey: string) {
    const client = createClerkClient({ secretKey });
    const clerkUser = await client.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new BadRequestException("Clerk user has no email address");
    }

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      email;

    return this.provisionFromClerk({
      clerkUserId,
      email,
      name,
    });
  }
}
