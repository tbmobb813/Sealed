import { PrismaClient } from "@sealed/database";
import { DEMO_CLERK_USER_ID } from "../../src/common/constants/demo";

export async function cleanDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.activityEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.agreement.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.proposalTemplate.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
}

export async function seedTestFixtures(prisma: PrismaClient) {
  const tenant = await prisma.tenant.create({
    data: {
      name: "Test Company",
      slug: "test",
      brandColor: "#000000",
    },
  });

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      clerkUserId: DEMO_CLERK_USER_ID,
      email: "test@sealed.app",
      name: "Test User",
      role: "OWNER",
    },
  });

  const contact = await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      name: "Jane Client",
      email: "jane@example.com",
      companyName: "Client Corp",
    },
  });

  return { tenant, user, contact };
}
