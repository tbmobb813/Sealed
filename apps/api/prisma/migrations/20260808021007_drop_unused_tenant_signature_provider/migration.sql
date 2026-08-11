-- Drop unused column: Tenant.signatureProvider was never read by any code
-- path (the active provider is selected via the SIGNATURE_PROVIDER env var,
-- not per-tenant). Removed as part of retiring the Dropbox Sign integration,
-- since its default value ("dropbox_sign") no longer names a valid provider.
ALTER TABLE "tenants" DROP COLUMN "signature_provider";
