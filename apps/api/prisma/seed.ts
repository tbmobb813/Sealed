import { PrismaClient } from "@sealed/database";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Company",
      slug: "demo",
      brandColor: "#1a1a2e",
    },
  });

  const user = await prisma.user.upsert({
    where: { clerkUserId: "user_demo_001" },
    update: {},
    create: {
      tenantId: tenant.id,
      clerkUserId: "user_demo_001",
      email: "demo@sealed.app",
      name: "Demo User",
      role: "OWNER",
    },
  });

  const contact = await prisma.contact.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: "jane@example.com",
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Jane Client",
      email: "jane@example.com",
      companyName: "Client Corp",
    },
  });

  const proposal = await prisma.proposal.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      tenantId: tenant.id,
      contactId: contact.id,
      title: "Website Redesign Proposal",
      description: "Full website redesign and development",
      status: "DRAFT",
      lineItems: [
        {
          description: "Discovery & Strategy",
          quantity: 1,
          unitPrice: 3000,
          total: 3000,
        },
        {
          description: "UI/UX Design",
          quantity: 1,
          unitPrice: 5000,
          total: 5000,
        },
        {
          description: "Development",
          quantity: 1,
          unitPrice: 7000,
          total: 7000,
        },
      ],
      subtotal: 15000,
      taxAmount: 0,
      totalAmount: 15000,
      createdByUserId: user.id,
    },
  });

  console.log("Seed complete:", {
    tenant: tenant.slug,
    user: user.email,
    contact: contact.email,
    proposal: proposal.title,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
