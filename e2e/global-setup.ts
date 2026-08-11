import { PrismaClient } from "@sealed/database";
import { PrismaPg } from "@prisma/adapter-pg";

const DEMO_CLERK_USER_ID = "user_demo_001";

async function resetDatabase(prisma: PrismaClient) {
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

async function seedFixtures(prisma: PrismaClient) {
  const tenant = await prisma.tenant.create({
    data: {
      name: "Test Company",
      slug: "test",
      brandColor: "#000000",
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      clerkUserId: DEMO_CLERK_USER_ID,
      email: "test@sealed.app",
      name: "Test User",
      role: "OWNER",
    },
  });

  await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      name: "Jane Client",
      email: "jane@example.com",
      companyName: "Client Corp",
    },
  });
}

export default async function globalSetup() {
  process.env.DATABASE_URL ??=
    "postgresql://sealed:sealed_dev@localhost:5432/sealed";

  const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
  });
  try {
    await resetDatabase(prisma);
    await seedFixtures(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
