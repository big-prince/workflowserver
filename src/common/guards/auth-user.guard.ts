/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/redis/cache.service';

import { CustomError } from '../exceptions/customError';

@Injectable()
export class AuthUserGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user.id;

    if (!user) {
      throw new CustomError('Unauthorized', 401);
    }

    const cacheKey = `user-exists:${user.id}`;
    const cachedUser = await this.cacheService.get(cacheKey);

    if (!cachedUser) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user },
      });

      if (!dbUser) {
        throw new CustomError(
          'Unauthorized: User not in Database Records!',
          401,
        );
      }

      await this.cacheService.set(cacheKey, dbUser, 60 * 10); // Cache for 10min
      request.userDetails = dbUser;
    } else {
      request.userDetails = cachedUser;
    }

    return true;
  }
}
