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
          host: process.env.REDIS_HOST || 'localhost', // Default to localhost if not set
          port: parseInt(process.env.REDIS_PORT || '6379'), // Default to 6379
          password: process.env.REDIS_PASSWORD || null, // Optional, only used if set
          db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0, // Default to 0
        };

        // Enable TLS if REDIS_TLS is explicitly set to 'true' (for production)
        if (process.env.REDIS_TLS === 'true') {
          redisOptions.tls = {};
        }

        return new Redis(redisOptions);
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
