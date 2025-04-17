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
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/auth-guard';
import { userWithoutPassword } from 'src/configs/interfaces/user.interface';
import { CustomError } from 'src/common/exceptions/customError';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //getUser
  @UseGuards(JwtAuthGuard)
  @Get('get-user')
  async getUser(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<userWithoutPassword | null> {
    const user = req['user'].id;
    console.log('🚀 ~ UsersController ~ user:', user);
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
