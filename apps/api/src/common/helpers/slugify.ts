import { Prisma } from "@sealed/database";

export function slugifyFromEmail(email: string): string {
  const [local = email, domainPart = ""] = email.split("@");
  const domain = domainPart.split(".")[0] ?? "";
  const base = `${local}-${domain}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "workspace";
}

export async function uniqueTenantSlug(
  tx: Prisma.TransactionClient,
  base: string,
): Promise<string> {
  let slug = base;
  let suffix = 0;

  while (await tx.tenant.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}
