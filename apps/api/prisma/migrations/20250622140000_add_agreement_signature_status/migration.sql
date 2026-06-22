-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'DECLINED', 'CANCELED');

-- AlterTable
ALTER TABLE "agreements" ADD COLUMN "signature_status" "SignatureStatus" NOT NULL DEFAULT 'DRAFT';

-- Backfill from existing status column
UPDATE "agreements" SET "signature_status" = "status"::text::"SignatureStatus";

-- CreateIndex
CREATE INDEX "agreements_tenant_id_signature_status_idx" ON "agreements"("tenant_id", "signature_status");
