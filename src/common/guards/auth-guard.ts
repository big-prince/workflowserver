/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// auth/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CustomError } from '../exceptions/customError';
import { allEnv } from 'src/configs/env.config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return false;

    try {
      const secret = allEnv.jwtSecret || process.env.JWT_SECRET;
      if (!secret) throw new CustomError('JWT secret not found', 500);

      const decoded = await this.jwtService.verifyAsync(token, { secret });

      req.user = {
        id: decoded.sub,
        ...decoded,
      };

      return true;
    } catch (err) {
      console.log(err);
      throw new CustomError('Invalid token', 401);
    }
  }
}
