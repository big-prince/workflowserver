import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';
import { CacheService } from 'src/redis/cache.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    RedisModule,
    AuthModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService, JwtService, CacheService],
  exports: [ProjectService],
})
export class ProjectModule {}
