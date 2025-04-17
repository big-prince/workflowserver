/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        let redis: Redis;

        if (process.env.REDIS_URL) {
          // Production / Railway
          redis = new Redis(process.env.REDIS_URL);
          console.log('🌐 Connecting to Redis via REDIS_URL...');
        } else {
          // Local development
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

          redis = new Redis(redisOptions);
          console.log('🖥️ Connecting to Local Redis...');
        }

        redis.on('error', (err) => {
          console.error('❌ Redis connection error:', err);
        });

        redis.on('connect', () => {
          console.log('✅ Connected to Redis successfully');
        });

        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
