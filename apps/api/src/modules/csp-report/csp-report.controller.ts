import { Body, Controller, HttpCode, Logger, Post } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";

@Controller("csp-report")
export class CspReportController {
  private readonly logger = new Logger(CspReportController.name);

  // Browsers POST here for both `report-uri` (application/csp-report) and
  // `report-to` (application/reports+json) — diagnostic-only, no DB write,
  // so a payload shape mismatch between the two just logs oddly rather than
  // failing. Used to confirm the Report-Only CSP is violation-free before
  // promoting it to enforcing (see apps/web/next.config.mjs).
  @Public()
  @Post()
  @HttpCode(204)
  report(@Body() body: unknown) {
    this.logger.warn({ cspReport: body }, "CSP violation report received");
  }
}
