import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser, LoginDto, RegisterDto } from './dto/user.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/auth-guard';
import { userWithoutPassword } from 'src/configs/interfaces/user.interface';

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

    delete result.accessToken;
    delete result.refreshToken;

    console.log(result);

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

    delete result.accessToken;
    delete result.refreshToken;

    console.log(result);

    return result;
  }

  //getUser
  @UseGuards(JwtAuthGuard)
  @Post('get-user')
  async getUser(
    @Body() body: GetUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<userWithoutPassword | null> {
    const result = await this.usersService.getUser(body).catch((e) => {
      console.log(e);
      throw e;
    });

    if (!result) {
      res.status(404).send('User not found');
    }

    return result;
  }
}
