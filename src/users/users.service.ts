/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { hashPassword } from 'src/common/utils/hashpassword';
import { RegisterDto } from './dto/user.dto';
import { CustomError } from 'src/common/exceptions/customError';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  //register a new user
  async registerUser(data: RegisterDto): Promise<User> {
    //check for user by email
    const userExist = await this.getUserByEmail(data.email);
    if (userExist) {
      throw new CustomError('User Already Exists', 409);
    }
    //check for user by username
    const userExistByUsername = await this.getUserByUsername(data.username);
    if (userExistByUsername) {
      throw new CustomError('Username Already Exists', 409);
    }
    //hash password
    const hashedPassword = await hashPassword(data.password);
    const createData = {
      ...data,
      password: hashedPassword,
    };
    const user: User = await this.prisma.user
      .create({
        data: createData,
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
