import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './cache.constants';

@Injectable()
export class CacheService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async ping(): Promise<string> {
    return this.redisClient.ping();
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
  }
}
