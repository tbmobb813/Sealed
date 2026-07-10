import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { MarketingService } from "./marketing.service";
import { SubscribeDto } from "./dto/subscribe.dto";

@Controller("marketing")
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  // Public landing-page email capture. Upsert keeps it idempotent and the
  // constant response shape avoids leaking whether an email already exists.
  @Public()
  @Post("subscribe")
  @HttpCode(200)
  subscribe(@Body() dto: SubscribeDto) {
    return this.marketingService.subscribe(dto.email, dto.source);
  }
}
