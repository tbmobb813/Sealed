import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class ResendService {
  private readonly resend: Resend | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      console.warn("Resend not configured, skipping email to", to);
      return null;
    }

    return this.resend.emails.send({
      from: "Sealed <noreply@sealed.app>",
      to,
      subject,
      html,
    });
  }

  async sendProposalEmail(to: string, proposalTitle: string, publicUrl: string) {
    return this.sendEmail(
      to,
      `New proposal: ${proposalTitle}`,
      `<p>You have a new proposal: <strong>${proposalTitle}</strong></p>
       <p><a href="${publicUrl}">View proposal</a></p>`,
    );
  }
}
