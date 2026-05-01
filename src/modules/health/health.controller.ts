import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
  ) {}

  @Get('live')
  liveness(): Record<string, string> {
    return { status: 'ok', message: 'Server is working' };
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      async () => this.mongoose.pingCheck('mongodb'),
    ]);
  }
}
