import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Augments every incoming request with a unique requestId.
 *
 * - If the client sends an `X-Request-Id` header, we honor it (useful for
 *   tracing across systems where the client already has a correlation ID).
 * - Otherwise we generate a fresh UUID.
 *
 * The ID is:
 *   - Attached to `req.requestId` for downstream consumers (logger, filter)
 *   - Returned in the `X-Request-Id` response header so clients can include
 *     it in bug reports
 *   - Included in every error response body
 *   - Included in every structured log line (Piece 4)
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incomingId = req.header("X-Request-Id");
    const requestId =
      incomingId && this.isValidRequestId(incomingId)
        ? incomingId
        : `req_${randomUUID()}`;

    // Attach to request for downstream access
    (req as Request & { requestId: string }).requestId = requestId;

    // Echo back in response header
    res.setHeader("X-Request-Id", requestId);

    next();
  }

  /**
   * Reject pathological client-provided IDs.
   * UUIDs, hex strings, and our own `req_` prefix are allowed.
   * Max 128 chars to prevent log abuse.
   */
  private isValidRequestId(id: string): boolean {
    return id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(id);
  }
}
