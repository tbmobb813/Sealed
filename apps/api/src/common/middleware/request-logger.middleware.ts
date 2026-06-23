import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const requestId = (req as Request & { requestId?: string }).requestId ?? 'unknown';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      // Extract tenant/user from the request if auth has already populated it.
      // These will be undefined for unauthenticated routes (health, auth endpoints).
      const user = (req as Request & { user?: { id?: string; tenantId?: string } })
        .user;

      const logPayload = {
        requestId,
        method,
        path: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        tenantId: user?.tenantId ?? null,
        userId: user?.id ?? null,
      };

      // Use warn for 4xx, error for 5xx, log for 2xx/3xx
      if (statusCode >= 500) {
        this.logger.error(JSON.stringify(logPayload));
      } else if (statusCode >= 400) {
        this.logger.warn(JSON.stringify(logPayload));
      } else {
        this.logger.log(JSON.stringify(logPayload));
      }
    });

    next();
  }
}