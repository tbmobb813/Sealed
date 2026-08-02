import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DropboxSignModule } from "../dropbox-sign/dropbox-sign.module";
import { DocuSealModule } from "../docuseal/docuseal.module";
import { SignatureProviderService } from "./signature-provider.service";

@Module({
  imports: [ConfigModule, DropboxSignModule, DocuSealModule],
  providers: [SignatureProviderService],
  exports: [SignatureProviderService],
})
export class SignatureModule {}
