/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/redis/cache.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async set(key: string, value: unknown, ttl: number) {
    const val = JSON.stringify(value);
    await this.redis.set(key, val, 'EX', ttl); // TTL in seconds
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string) {
    await this.redis.del(key);
  }
}
