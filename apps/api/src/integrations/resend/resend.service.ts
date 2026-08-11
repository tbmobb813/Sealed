import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

export interface SendProposalLinkOptions {
  toEmail: string;
  toName: string;
  proposalTitle: string;
  tenantName: string;
  publicToken: string;
}

export interface SendInvoiceLinkOptions {
  toEmail: string;
  toName: string;
  invoiceNumber: string;
  tenantName: string;
  totalAmount: string;
  paymentUrl: string;
}

/** Masks an email for logs: "jane.doe@example.com" → "j***@example.com". */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

/** Escapes tenant/contact-controlled values before HTML interpolation. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly client: Resend | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  get fromEmail(): string {
    return (
      this.config.get<string>("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev"
    );
  }

  get appUrl(): string {
    return (
      this.config.get<string>("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000"
    );
  }

  async sendProposalLink(options: SendProposalLinkOptions): Promise<void> {
    if (!this.client) {
      this.logger.warn(
        `Resend not configured — skipping proposal email to ${maskEmail(options.toEmail)}`,
      );
      return;
    }

    const proposalUrl = `${this.appUrl}/p/${encodeURIComponent(options.publicToken)}`;
    const poweredByUrl = `${this.appUrl}/?ref=powered-by`;
    const tenantName = escapeHtml(options.tenantName);
    const proposalTitle = escapeHtml(options.proposalTitle);

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111;">
    <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">You have a new proposal</h1>
    <p style="color: #555; margin-bottom: 32px;">
      ${tenantName} has sent you a proposal: <strong>${proposalTitle}</strong>
    </p>
    <a href="${proposalUrl}"
       style="display: inline-block; background: #0ea5e9; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">
      View Proposal
    </a>
    <p style="color: #888; font-size: 13px; margin-top: 32px;">
      Or copy this link into your browser:<br />
      <a href="${proposalUrl}" style="color: #0ea5e9;">${proposalUrl}</a>
    </p>
    <p style="color: #aaa; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
      Powered by <a href="${poweredByUrl}" style="color: #aaa;">Sealed</a>
    </p>
  </body>
</html>`;

    // Plain-text alternative — HTML-only email scores worse with spam filters.
    const text = `You have a new proposal

${options.tenantName} has sent you a proposal: ${options.proposalTitle}

View it here: ${proposalUrl}

---
Powered by Sealed — ${poweredByUrl}
`;

    try {
      // The Resend SDK does not throw on API errors — it returns { data, error }.
      const { error } = await this.client.emails.send({
        from: this.fromEmail,
        to: options.toEmail,
        subject: `New proposal: ${options.proposalTitle}`,
        html,
        text,
      });
      if (error) {
        this.logger.warn(
          `Resend rejected proposal email to ${maskEmail(options.toEmail)}: ${error.name}: ${error.message}`,
        );
        return;
      }
      this.logger.log(
        `Proposal email sent to ${maskEmail(options.toEmail)} for proposal ${options.publicToken}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to send proposal email to ${maskEmail(options.toEmail)}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async sendInvoiceLink(options: SendInvoiceLinkOptions): Promise<void> {
    if (!this.client) {
      this.logger.warn(
        `Resend not configured — skipping invoice email to ${maskEmail(options.toEmail)}`,
      );
      return;
    }

    const tenantName = escapeHtml(options.tenantName);
    const invoiceNumber = escapeHtml(options.invoiceNumber);
    const totalAmount = escapeHtml(options.totalAmount);
    const paymentUrl = escapeHtml(options.paymentUrl);
    const poweredByUrl = `${this.appUrl}/?ref=powered-by`;
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111;">
    <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Invoice ${invoiceNumber}</h1>
    <p style="color: #555; margin-bottom: 8px;">
      ${tenantName} has sent you an invoice for <strong>${totalAmount}</strong>.
    </p>
    <p style="color: #555; margin-bottom: 32px;">
      Please use the link below to complete your payment.
    </p>
    <a href="${paymentUrl}"
       style="display: inline-block; background: #0ea5e9; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">
      Pay Invoice
    </a>
    <p style="color: #888; font-size: 13px; margin-top: 32px;">
      Or copy this link into your browser:<br />
      <a href="${paymentUrl}" style="color: #0ea5e9;">${paymentUrl}</a>
    </p>
    <p style="color: #aaa; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
      Powered by <a href="${poweredByUrl}" style="color: #aaa;">Sealed</a>
    </p>
  </body>
</html>`;

    // Plain-text alternative — HTML-only email scores worse with spam filters.
    const text = `Invoice ${options.invoiceNumber}

${options.tenantName} has sent you an invoice for ${options.totalAmount}.

Pay here: ${options.paymentUrl}

---
Powered by Sealed — ${poweredByUrl}
`;

    try {
      // The Resend SDK does not throw on API errors — it returns { data, error }.
      const { error } = await this.client.emails.send({
        from: this.fromEmail,
        to: options.toEmail,
        subject: `Invoice ${options.invoiceNumber} from ${options.tenantName}`,
        html,
        text,
      });
      if (error) {
        this.logger.warn(
          `Resend rejected invoice email to ${maskEmail(options.toEmail)}: ${error.name}: ${error.message}`,
        );
        return;
      }
      this.logger.log(
        `Invoice email sent to ${maskEmail(options.toEmail)} for invoice ${options.invoiceNumber}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to send invoice email to ${maskEmail(options.toEmail)}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
