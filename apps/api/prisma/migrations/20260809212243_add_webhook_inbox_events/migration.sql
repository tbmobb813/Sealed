-- CreateEnum
CREATE TYPE "WebhookProvider" AS ENUM ('STRIPE', 'DOCUSEAL', 'CLERK');

-- CreateTable
CREATE TABLE "webhook_inbox_events" (
    "id" TEXT NOT NULL,
    "provider" "WebhookProvider" NOT NULL,
    "external_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "tenant_id" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "webhook_inbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_inbox_events_tenant_id_idx" ON "webhook_inbox_events"("tenant_id");

-- CreateIndex
CREATE INDEX "webhook_inbox_events_provider_received_at_idx" ON "webhook_inbox_events"("provider", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_inbox_events_provider_external_event_id_key" ON "webhook_inbox_events"("provider", "external_event_id");
