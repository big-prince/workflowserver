/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser, LoginDto, RegisterDto } from './dto/user.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/auth-guard';
import { userWithoutPassword } from 'src/configs/interfaces/user.interface';
import { CustomError } from 'src/common/exceptions/customError';
import { access } from 'fs';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //register user
  @Post('create-user')
  async createUser(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, any>> {
    const result = await this.usersService.registerUser(body).catch((e) => {
      console.log(e);
      throw e;
    });

    // Set tokens in cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
      sameSite: 'lax',
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    delete result.refreshToken;

    return result;
  }

  //login user
  @Post('login')
  async loginUser(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.usersService.loginUser(body).catch((e) => {
      console.log(e);
      throw e;
    });

    // Set tokens in cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
      sameSite: 'lax',
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    delete result.refreshToken;

    return result;
  }

  //getUser
  @UseGuards(JwtAuthGuard)
  @Get('get-user')
  async getUser(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<userWithoutPassword | null> {
    const user = req['user'];
    if (!user) {
      throw new CustomError('User not found from the Token', 409);
    }
    let result = await this.usersService.getUser(user).catch((e) => {
      console.log(e);
      throw e;
    });

    if (!result) {
      throw new CustomError('User not found', 404);
    }

    result = {
      ...result,
      createdAt: null,
      updatedAt: null,
    };

    return result;
  }
}
