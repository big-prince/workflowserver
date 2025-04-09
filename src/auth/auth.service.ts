/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { CustomError } from 'src/common/exceptions/customError';
// import { TokenPayloadDto, TokenModelDto } from './dto/auth.dto';
import {
  TokenPayloadInterface,
  TokenModelInterface,
  SaveTokenInterface,
} from 'src/configs/interfaces/auth.interface';
//config file
import { allEnv } from 'src/configs/env.config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  //generate Token
  generateToken(payload: TokenPayloadInterface): string {
    const secret = allEnv.jwtSecret || process.env.JWT_SECRET;
    if (!secret) {
      throw new CustomError('JWT secret not found', 500);
    }
    console.log('🚀 ~ AuthService ~ generateToken ~ secret:', secret);
    return jwt.sign(payload, secret);
  }

  //generate Refresh Token
  generateRefreshToken(payload: TokenPayloadInterface): string {
    const secret = allEnv.jwtSecret || process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new CustomError('JWT refresh secret not found', 500);
    }
    console.log('🚀 ~ AuthService ~ generateRefreshToken ~ secret:', secret);
    return jwt.sign(payload, secret);
  }

  //save Token in DB
  async saveToken(payload: SaveTokenInterface): Promise<TokenModelInterface> {
    const tokenDetails: TokenModelInterface = {
      userId: payload.userId,
      token: payload.token,
      expiresAt: new Date(Date.now() + 60 * 120 * 1000), // 2 hours
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    //check if token already exists
    const existingToken = await this.prisma.token
      .findUnique({
        where: { id: payload.userId },
      })
      .catch((e) => {
        console.log(e);
        if (e instanceof CustomError) {
          throw e;
        }
        throw new CustomError(`${e}`, 500);
      });
    if (existingToken) {
      //update token if it exists
      await this.prisma.token
        .update({
          where: { id: payload.userId },
          data: {
            userId: tokenDetails.userId,
            token: tokenDetails.token,
            expiresAt: tokenDetails.expiresAt,
            createdAt: tokenDetails.createdAt,
            updatedAt: new Date(),
          },
        })
        .catch((e) => {
          console.log(e);
          if (e instanceof CustomError) {
            throw e;
          }
          throw new CustomError(`${e}`, 500);
        });
    }

    //create new token
    await this.prisma.token
      .create({
        data: { ...tokenDetails },
      })
      .catch((e) => {
        console.log(e);
        if (e instanceof CustomError) {
          throw e;
        }
        throw new CustomError(`${e}`, 500);
      });

    //return token details
    return tokenDetails;
  }

  verifyToken(token: string): any {
    try {
      const secret = allEnv.jwtSecret || process.env.JWT_SECRET;
      if (!secret) {
        throw new CustomError('JWT secret not found', 500);
      }
      return jwt.verify(token, secret);
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid token', 401);
      } else if (err instanceof jwt.TokenExpiredError) {
        throw new CustomError('Token expired', 401);
      } else {
        throw new CustomError('Token verification failed', 500);
      }
    }
  }

  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
