import { Module } from "@nestjs/common";
import { DocuSealModule } from "../docuseal/docuseal.module";
import { SignatureProviderService } from "./signature-provider.service";

@Module({
  imports: [DocuSealModule],
  providers: [SignatureProviderService],
  exports: [SignatureProviderService],
})
export class SignatureModule {}
