import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';
import { CacheService } from 'src/redis/cache.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, CacheService],
  exports: [UsersService],
})
export class UsersModule {}
