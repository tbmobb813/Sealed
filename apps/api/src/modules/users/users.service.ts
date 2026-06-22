import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createClerkClient } from "@clerk/backend";
import { PrismaService } from "../../prisma/prisma.service";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import {
  slugifyFromEmail,
  uniqueTenantSlug,
} from "../../common/helpers/slugify";

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

  async provisionFromClerk(input: ProvisionClerkUserInput) {
    const existing = await this.prisma.user.findUnique({
      where: { clerkUserId: input.clerkUserId },
      include: { tenant: true },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.$transaction(async (tx) => {
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
    });
  }

  async syncFromClerk(input: ProvisionClerkUserInput) {
    const existing = await this.prisma.user.findUnique({
      where: { clerkUserId: input.clerkUserId },
    });

    if (!existing) {
      return this.provisionFromClerk(input);
    }

    return this.prisma.user.update({
      where: { id: existing.id },
      data: {
        email: input.email,
        name: input.name,
        status: "ACTIVE",
      },
    });
  }

  async deactivateByClerkId(clerkUserId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!existing) {
      return null;
    }

    return this.prisma.user.update({
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
