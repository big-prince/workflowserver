import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import Redis from 'ioredis';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('redis-health')
  async redisHealth() {
    console.log('Redis Health Check');
    const status = await this.redis.ping();
    return { status };
  }
}
