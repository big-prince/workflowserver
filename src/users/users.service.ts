/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from '@prisma/client';
import { hashPassword, comparePassword } from 'src/common/utils/hashpassword';
import { LoginDto, RegisterDto } from './dto/user.dto';
import { CustomError } from 'src/common/exceptions/customError';
import {
  SaveTokenInterface,
  TokenPayloadInterface,
} from 'src/configs/interfaces/auth.interface';
import {
  getUser,
  userWithoutPassword,
} from 'src/configs/interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  //register a new user
  async registerUser(data: RegisterDto): Promise<Record<string, any>> {
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

    console.log('🚀 ~ UsersService ~ registerUser ~ user:', user);

    //generate token
    if (!user) {
      throw new CustomError('User Not Created', 500);
    }
    const tokenPayload: TokenPayloadInterface = {
      sub: user.id,
      email: data.email,
    };
    const token = this.authService.generateToken(tokenPayload);
    const refreshToken = this.authService.generateRefreshToken(tokenPayload);
    if (!token || !refreshToken) {
      throw new CustomError('Tokens Not Created', 500);
    }
    //save token in db
    const savePayload: SaveTokenInterface = {
      userId: user.id,
      token: refreshToken,
    };
    const saveToken = await this.authService.saveToken(savePayload);
    if (!saveToken) {
      throw new CustomError('Token Not Saved', 500);
    }

    const responseModule: Record<string, any> = {
      message: 'User Created Successfully',
      accessToken: token,
      refreshToken: refreshToken,
      userID: user.id,
    };

    return responseModule;
  }

  //login user
  async loginUser(data: LoginDto): Promise<Record<string, any>> {
    //check for user by email
    const user = await this.getUserByEmail(data.email);
    if (!user) {
      throw new CustomError('User Not Found', 404);
    }
    if (!user.password) {
      throw new CustomError('User Password invalid', 404);
    }
    //check password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid Password', 401);
    }
    //generate token
    const tokenPayload: TokenPayloadInterface = {
      sub: user.id,
      email: data.email,
    };
    const token = this.authService.generateToken(tokenPayload);
    const refreshToken = this.authService.generateRefreshToken(tokenPayload);
    if (!token || !refreshToken) {
      throw new CustomError('Tokens Not Created', 500);
    }
    //save token in db
    const savePayload: SaveTokenInterface = {
      userId: user.id,
      token: refreshToken,
    };
    const saveToken = await this.authService.saveToken(savePayload);
    if (!saveToken) {
      throw new CustomError('Token Not Saved', 500);
    }

    const responseModule: Record<string, any> = {
      message: 'Login Successful',
      accessToken: token,
      refreshToken: refreshToken,
      userID: user.id,
    };

    return responseModule;
  }

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
