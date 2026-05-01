import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '../cache/cache.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, CacheModule],
  controllers: [HealthController],
})
export class HealthModule {}
