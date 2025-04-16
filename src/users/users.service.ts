/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CustomError } from 'src/common/exceptions/customError';
import {
  getUser,
  userWithoutPassword,
} from 'src/configs/interfaces/user.interface';
import { CacheService } from 'src/redis/cache.service';
import { cacheKeys } from 'src/redis/redis.keys';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  //get user
  async getUser(data: getUser): Promise<userWithoutPassword | null> {
    let query: any = {};
    if (data.id) {
      query = { id: data.id };
    } else if (data.email) {
      query = { email: data.email };
    } else if (data.username) {
      query = { username: data.username };
    } else {
      throw new CustomError('Credentials not Provided', 400);
    }

    //check for user
    const user = await this.prisma.user.findUnique({
      where: query,
    });
    if (!user) {
      throw new CustomError('User Not Found', 404);
    }
    if (!user.password) {
      throw new CustomError('User Password invalid', 404);
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  //find existing user
  async getUserByEmail(email: string): Promise<User | null> {
    //check for user
    const user = await this.prisma.user
      .findUnique({
        where: { email },
      })
      .catch((e) => {
        console.log(e);
        if (e instanceof CustomError) {
          throw e;
        }
        throw new CustomError(`${e}`, 500);
      });

    return user;
  }

  //find user byusername
  async getUserByUsername(username: string): Promise<User | null> {
    //check for user
    const user = await this.prisma.user
      .findUnique({
        where: { username },
      })
      .catch((e) => {
        console.log(e);
        if (e instanceof CustomError) {
          throw e;
        }
        throw new CustomError(`${e}`, 500);
      });

    return user;
  }

  //find user by id
  async getUserById(id: string): Promise<User | null> {
    //check for user
    const user = await this.prisma.user
      .findUnique({
        where: { id },
      })
      .catch((e) => {
        console.log(e);
        if (e instanceof CustomError) {
          throw e;
        }
        throw new CustomError(`${e}`, 500);
      });

    return user;
  }
}
