import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
} from "@nestjs/common";
import { Response } from "express";

@Catch(ConflictException)
export class StateTransitionFilter implements ExceptionFilter {
  catch(exception: ConflictException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (
      typeof exceptionResponse === "object" &&
      exceptionResponse !== null &&
      "code" in exceptionResponse
    ) {
      response.status(status).json({
        statusCode: status,
        ...exceptionResponse,
      });
      return;
    }

    response.status(status).json({
      statusCode: status,
      message:
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : ((exceptionResponse as { message?: string }).message ??
            "Invalid state transition"),
      error: "StateTransitionError",
    });
  }
}
