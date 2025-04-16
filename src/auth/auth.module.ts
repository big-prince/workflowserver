import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { GithubStrategy } from './strategies/github.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from 'src/redis/cache.service';

@Module({
  imports: [
    RedisModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GithubStrategy, PrismaService, CacheService],
  exports: [AuthService],
})
export class AuthModule {}
