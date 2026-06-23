import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
  } from "@nestjs/common";
  import { Request, Response } from "express";
  import { Prisma } from "@sealed/database";
  import { ErrorCodes, ErrorCode } from "../constants/error-codes";
  
  interface NormalizedError {
    status: number;
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  }
  
  interface ErrorResponseBody {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    path: string;
    requestId: string;
  }
  
  /**
   * Global exception filter that normalizes ALL error responses to a
   * single shape regardless of source.
   *
   * Sources handled:
   *   1. HttpException (and subclasses) thrown by our services — already
   *      shaped if we used { code, message, details }, otherwise inferred
   *   2. Class-validator validation errors (BadRequestException with array msg)
   *   3. Prisma errors (P2002 unique violation, P2025 not found, etc.)
   *   4. Anything else (logged as INTERNAL_ERROR, full stack in logs only)
   *
   * NEVER leaks:
   *   - Stack traces in response body
   *   - Prisma SQL or schema details
   *   - Internal error messages from unhandled exceptions
   *
   * ALWAYS includes:
   *   - code (from ErrorCodes)
   *   - message (safe for end users)
   *   - timestamp, path, requestId
   */
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request & { requestId?: string }>();
  
      const normalized = this.normalize(exception);
  
      // Log the original exception with full context for ops debugging.
      // 5xx errors get error-level logging, 4xx get warn-level.
      this.logException(exception, normalized, request);
  
      const body: ErrorResponseBody = {
        code: normalized.code,
        message: normalized.message,
        ...(normalized.details ? { details: normalized.details } : {}),
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.requestId ?? "unknown",
      };
  
      response.status(normalized.status).json(body);
    }
  
    // ============================================================
    // Normalization — converts any exception to NormalizedError
    // ============================================================
  
    private normalize(exception: unknown): NormalizedError {
      // 1. HttpException — most common case (our services throw these)
      if (exception instanceof HttpException) {
        return this.normalizeHttpException(exception);
      }
  
      // 2. Prisma known request errors (e.g., P2002 unique constraint)
      if (exception instanceof Prisma.PrismaClientKnownRequestError) {
        return this.normalizePrismaError(exception);
      }
  
      // 3. Prisma validation errors (invalid query, bad data shape)
      if (exception instanceof Prisma.PrismaClientValidationError) {
        return {
          status: HttpStatus.BAD_REQUEST,
          code: ErrorCodes.VALIDATION_ERROR,
          message: "Database query validation failed",
          // Don't leak Prisma's internal message — it includes schema details
        };
      }
  
      // 4. Anything else — unknown territory, log full details, return generic
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCodes.INTERNAL_ERROR,
        message: "An unexpected error occurred",
      };
    }
  
    private normalizeHttpException(exception: HttpException): NormalizedError {
      const status = exception.getStatus();
      const response = exception.getResponse();
  
      // Case A: response is a plain string (e.g., `throw new NotFoundException("foo")`)
      if (typeof response === "string") {
        return {
          status,
          code: this.inferCodeFromStatus(status),
          message: response,
        };
      }
  
      // Case B: response is an object
      if (typeof response === "object" && response !== null) {
        const responseObj = response as Record<string, unknown>;
  
        // B1: Our structured exceptions ({ code, message, details })
        if (typeof responseObj.code === "string") {
          return {
            status,
            code: responseObj.code as ErrorCode,
            message: typeof responseObj.message === "string" ? responseObj.message : "Error",
            details: this.extractDetails(responseObj),
          };
        }
  
        // B2: class-validator failures (BadRequestException with array message)
        if (Array.isArray(responseObj.message)) {
          return {
            status,
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Request validation failed",
            details: { errors: responseObj.message },
          };
        }
  
        // B3: Default NestJS exception shape ({ statusCode, message, error })
        const message =
          typeof responseObj.message === "string"
            ? responseObj.message
            : exception.message;
  
        return {
          status,
          code: this.inferCodeFromStatus(status),
          message,
        };
      }
  
      // Fallback
      return {
        status,
        code: this.inferCodeFromStatus(status),
        message: exception.message,
      };
    }
  
    private normalizePrismaError(
      exception: Prisma.PrismaClientKnownRequestError,
    ): NormalizedError {
      // Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
      switch (exception.code) {
        case "P2002": {
          // Unique constraint violation
          const target = (exception.meta?.target as string[]) ?? [];
          return {
            status: HttpStatus.CONFLICT,
            code: ErrorCodes.RESOURCE_CONFLICT,
            message: "A resource with these values already exists",
            details: target.length > 0 ? { conflictingFields: target } : undefined,
          };
        }
  
        case "P2025": {
          // Record not found
          return {
            status: HttpStatus.NOT_FOUND,
            code: ErrorCodes.RESOURCE_NOT_FOUND,
            message: "Resource not found",
          };
        }
  
        case "P2003": {
          // Foreign key constraint violation
          return {
            status: HttpStatus.BAD_REQUEST,
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Referenced resource does not exist",
            details: { field: exception.meta?.field_name },
          };
        }
  
        default: {
          // Other Prisma errors — log fully, return generic
          return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            code: ErrorCodes.INTERNAL_ERROR,
            message: "A database error occurred",
          };
        }
      }
    }
  
    // ============================================================
    // Helpers
    // ============================================================
  
    private inferCodeFromStatus(status: number): ErrorCode {
      switch (status) {
        case HttpStatus.NOT_FOUND:
          return ErrorCodes.RESOURCE_NOT_FOUND;
        case HttpStatus.UNAUTHORIZED:
          return ErrorCodes.UNAUTHENTICATED;
        case HttpStatus.FORBIDDEN:
          return ErrorCodes.FORBIDDEN;
        case HttpStatus.BAD_REQUEST:
          return ErrorCodes.VALIDATION_ERROR;
        case HttpStatus.CONFLICT:
          return ErrorCodes.RESOURCE_CONFLICT;
        case HttpStatus.UNPROCESSABLE_ENTITY:
          return ErrorCodes.PRECONDITION_NOT_MET;
        default:
          return ErrorCodes.INTERNAL_ERROR;
      }
    }
  
    private extractDetails(
      obj: Record<string, unknown>,
    ): Record<string, unknown> | undefined {
      if (obj.details && typeof obj.details === "object" && obj.details !== null) {
        return obj.details as Record<string, unknown>;
      }
      return undefined;
    }
  
    private logException(
      exception: unknown,
      normalized: NormalizedError,
      request: Request & { requestId?: string },
    ): void {
      const context = {
        requestId: request.requestId,
        method: request.method,
        path: request.url,
        code: normalized.code,
        status: normalized.status,
      };
  
      if (normalized.status >= 500) {
        // Server error — log with stack trace
        this.logger.error(
          `${normalized.code}: ${normalized.message}`,
          exception instanceof Error ? exception.stack : String(exception),
          JSON.stringify(context),
        );
      } else {
        // Client error — log without stack trace, just context
        this.logger.warn(
          `${normalized.code}: ${normalized.message} ${JSON.stringify(context)}`,
        );
      }
    }
  }