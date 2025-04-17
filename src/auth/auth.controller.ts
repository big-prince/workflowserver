/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  Body,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guards/auth-guard';
import { Request, Response } from 'express';
import { RegisterDto, LoginDto } from 'src/users/dto/user.dto';
import { CustomError } from 'src/common/exceptions/customError';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //register user
  @Post('create-user')
  async createUser(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, any>> {
    const result = await this.authService.registerUser(body).catch((e) => {
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
    const result = await this.authService.loginUser(body).catch((e) => {
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

  //Github Auth
  @UseGuards(AuthGuard('github'))
  @Get('github')
  async githubAuth() {
    // Initiates the GitHub authentication process
  }

  //Github Auth Callback
  @UseGuards(AuthGuard('github'))
  @Get('github/callback')
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    // Handles the GitHub authentication callback
    const profile = req['user'].profile;
    const accessToken = req['user'].accessToken;
    const result = await this.authService
      .validateGithubAuth(profile, accessToken)
      .catch((e) => {
        console.log(e);
        throw e;
      });

    if (!result) {
      throw new CustomError('Unable to login with Github', 401);
    }

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

    return res.redirect(
      `https://work-i.netlify.app/dashboard.html?token=${result.accessToken}&userID=${result.userID}`,
    );
  }

  //Logout user
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logoutUser(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req['user'].id;
    console.log('🚀 ~ AuthController ~ user:', user);
    const result = await this.authService.logoutUser(user).catch((e) => {
      console.log(e);
      throw e;
    });
    if (!result) {
      throw new CustomError('Unable to logout', 401);
    }
    // Clear cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }
}
