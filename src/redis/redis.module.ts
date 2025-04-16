/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisOptions: any = {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
          connectTimeout: 10000,
          retryStrategy: (times) => Math.min(times * 3000, 30000),
        };

        if (process.env.REDIS_TLS === 'true') {
          redisOptions.tls = {};
        }

        const redis = new Redis(redisOptions);

        // Handle errors gracefully
        redis.on('error', (err) => {
          console.error('Redis connection error:', err);
        });

        redis.on('connect', () => {
          console.log('Connected to Redis successfully');
        });

        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
