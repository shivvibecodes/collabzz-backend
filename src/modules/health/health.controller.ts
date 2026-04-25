import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { CacheService } from '../cache/cache.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly cacheService: CacheService,
  ) {}

  @Get('live')
  liveness(): Record<string, string> {
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      async () => this.mongoose.pingCheck('mongodb'),
      async () => {
        const ping = await this.cacheService.ping();

        return {
          redis: {
            status: ping === 'PONG' ? 'up' : 'down',
          },
        };
      },
    ]);
  }
}
