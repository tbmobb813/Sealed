import { expect, test } from "@playwright/test";

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const AUTH_HEADER = { Authorization: "Bearer demo" };

test.describe("Proposal to agreement flow", () => {
  test("create proposal, send, accept publicly, and create agreement", async ({
    page,
    request,
  }) => {
    const proposalTitle = `E2E Proposal ${Date.now()}`;
    const agreementBody =
      "These are the terms and conditions for the agreed services.";

    await test.step("Create a proposal", async () => {
      await page.goto("/proposals/new");
      await page.getByLabel("Title").fill(proposalTitle);
      await page.getByLabel("Contact").selectOption({ index: 1 });
      await page
        .locator('input[placeholder="Design and development"]')
        .fill("Consulting services");
      await page.getByLabel("Tax Amount").fill("100");
      await page.getByRole("button", { name: "Create Proposal" }).click();
      await page.waitForURL(/\/proposals\/[0-9a-f-]+$/);
    });

    const proposalId = page.url().split("/").pop()!;
    expect(proposalId).toBeTruthy();

    await test.step("Send the proposal to the client", async () => {
      await expect(
        page.getByRole("button", { name: "Send to Client" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Send to Client" }).click();
      await expect(
        page.getByRole("button", { name: "Send to Client" }),
      ).toHaveCount(0);
    });

    const proposalResponse = await request.get(
      `${API_URL}/api/v1/proposals/${proposalId}`,
      { headers: AUTH_HEADER },
    );
    expect(proposalResponse.ok()).toBeTruthy();
    const { data: proposal } = await proposalResponse.json();
    const publicToken = proposal.publicToken as string;
    expect(publicToken).toBeTruthy();

    await test.step("Open the public proposal page", async () => {
      await page.goto(`/p/${publicToken}`);
      await expect(
        page.getByRole("button", { name: "Accept Proposal" }),
      ).toBeVisible();
      await expect(page.getByText("VIEWED", { exact: true })).toBeVisible();
    });

    await test.step("Accept the proposal", async () => {
      await page.getByRole("button", { name: "Accept Proposal" }).click();
      await page.getByLabel("Type your full name to accept this proposal").fill(
        "Test Client",
      );
      await page.getByRole("button", { name: "Confirm Acceptance" }).click();
      await expect(
        page.getByText("You have accepted this proposal."),
      ).toBeVisible();
      await expect(page.getByText("ACCEPTED", { exact: true })).toBeVisible();
    });

    await test.step("Confirm dashboard proposal actions updated", async () => {
      await page.goto(`/proposals/${proposalId}`);
      await expect(
        page.getByRole("link", { name: "Create Agreement" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Send to Client" }),
      ).toHaveCount(0);
    });

    const expectedAgreementTitle = `Agreement — ${proposalTitle}`;

    await test.step("Create an agreement from the accepted proposal", async () => {
      await page.getByRole("link", { name: "Create Agreement" }).click();
      await page.waitForURL(
        new RegExp(`/agreements/new\\?proposalId=${proposalId}`),
      );

      await expect(page.getByLabel("Title")).toHaveValue(expectedAgreementTitle);
      await page.getByLabel("Agreement Terms").fill(agreementBody);
      await page.getByRole("button", { name: "Create Agreement" }).click();
      await page.waitForURL(/\/agreements\/[0-9a-f-]+$/);
    });

    await test.step("Confirm agreement detail shows DRAFT status", async () => {
      await expect(
        page.getByRole("heading", { name: expectedAgreementTitle }),
      ).toBeVisible();
      await expect(page.locator("dd.capitalize")).toHaveText("DRAFT");
      await expect(
        page.getByRole("button", { name: "Send for Signature" }),
      ).toBeVisible();
    });

    await test.step("Send agreement for signature", async () => {
      await page.getByRole("button", { name: "Send for Signature" }).click();
      await expect(page.locator("dd.capitalize")).toHaveText("SENT");
      await expect(
        page.getByRole("button", { name: "Mark as Signed" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Send for Signature" }),
      ).toHaveCount(0);
    });

    await test.step("Mark agreement as signed", async () => {
      await page.getByRole("button", { name: "Mark as Signed" }).click();
      await expect(page.locator("dd.capitalize")).toHaveText("SIGNED");
      await expect(
        page.getByRole("link", { name: "Create Invoice" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Mark as Signed" }),
      ).toHaveCount(0);
    });

    const acceptedProposalResponse = await request.get(
      `${API_URL}/api/v1/proposals/${proposalId}`,
      { headers: AUTH_HEADER },
    );
    const { data: acceptedProposal } = await acceptedProposalResponse.json();
    const expectedSubtotal = Number(acceptedProposal.totalAmount).toFixed(2);
    const expectedTax = Number(acceptedProposal.taxAmount).toFixed(2);

    await test.step("Create invoice with pre-filled amounts from proposal", async () => {
      await page.getByRole("link", { name: "Create Invoice" }).click();
      await page.waitForURL(/\/invoices\/new\?agreementId=/);
      await expect(page.getByLabel("Subtotal")).toHaveValue(expectedSubtotal);
      await expect(page.getByLabel("Tax Amount")).toHaveValue(expectedTax);
      await page.getByRole("button", { name: "Create Invoice" }).click();
      await page.waitForURL(/\/invoices\/[0-9a-f-]+$/);
    });

    await test.step("Confirm invoice detail shows generated number", async () => {
      await expect(page.getByRole("heading", { name: /^INV-/ })).toBeVisible();
      await expect(page.getByText("DRAFT", { exact: true }).first()).toBeVisible();
    });

    await test.step("Confirm activity log events", async () => {
      await page.goto("/dashboard");
      await expect(
        page.getByRole("heading", { name: "Recent Activity" }),
      ).toBeVisible();

      const acceptedEvent = page
        .locator("li")
        .filter({ hasText: "Proposal Accepted" })
        .first();
      await expect(acceptedEvent).toBeVisible();
      await expect(acceptedEvent.getByRole("link", { name: proposalTitle })).toBeVisible();

      const createdEvent = page
        .locator("li")
        .filter({ hasText: "Agreement Created" })
        .first();
      await expect(createdEvent).toBeVisible();
      await expect(createdEvent.getByText(expectedAgreementTitle)).toBeVisible();

      const sentEvent = page
        .locator("li")
        .filter({ hasText: "Agreement Sent" })
        .first();
      await expect(sentEvent).toBeVisible();

      const signedEvent = page
        .locator("li")
        .filter({ hasText: "Agreement Signed" })
        .first();
      await expect(signedEvent).toBeVisible();

      const invoiceEvent = page
        .locator("li")
        .filter({ hasText: "Invoice Created" })
        .first();
      await expect(invoiceEvent).toBeVisible();
    });
  });
});
