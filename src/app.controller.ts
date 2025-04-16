/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

  @Get('test-connectivity')
  async testConnectivity() {
    try {
      const net = require('net');
      const socket = new net.Socket();
      return new Promise((resolve) => {
        socket.setTimeout(5000);
        socket.on('connect', () => {
          socket.end();
          resolve({ status: 'Connection successful' });
        });
        socket.on('timeout', () => {
          socket.end();
          resolve({ status: 'Connection timed out' });
        });
        socket.on('error', (err) => {
          socket.end();
          resolve({ status: 'Connection failed', error: err.message });
        });
        socket.connect(54991, 'turntable.proxy.rlwy.net');
      });
    } catch (err) {
      return { status: 'Error', error: err.message };
    }
  }
}
