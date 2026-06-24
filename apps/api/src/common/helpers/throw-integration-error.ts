import { ServiceUnavailableException } from "@nestjs/common";
import { ErrorCodes } from "../constants/error-codes";

export function throwIntegrationError(
  provider: string,
  message: string,
): never {
  throw new ServiceUnavailableException({
    code: ErrorCodes.INTEGRATION_ERROR,
    message: `${provider}: ${message}`,
    details: { provider },
  });
}
