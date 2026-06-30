import { ResendService } from "../../src/integrations/resend/resend.service";

export const resendMock = {
  sendProposalLink: jest.fn().mockResolvedValue(undefined),
  sendInvoiceLink: jest.fn().mockResolvedValue(undefined),
};

export function resetResendMock(): void {
  resendMock.sendProposalLink.mockClear();
  resendMock.sendInvoiceLink.mockClear();
}

export function createResendMockProvider() {
  return {
    provide: ResendService,
    useValue: resendMock,
  };
}

/** Wait for fire-and-forget Resend calls triggered inside transactions. */
export async function waitForResendMock(
  predicate: () => boolean,
  timeoutMs = 2000,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("Timed out waiting for Resend mock to be called");
}
