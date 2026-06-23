import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    database: 'ok' | 'error';
  };
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthResponse> {
    let databaseStatus: 'ok' | 'error' = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = 'error';
    }

    const overall = databaseStatus === 'ok' ? 'ok' : 'degraded';

    return {
      status: overall,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.0.0',
      checks: {
        database: databaseStatus,
      },
    };
  }
}