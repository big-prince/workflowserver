/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { allEnv } from 'src/configs/env.config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || allEnv.githubClientId,
      clientSecret:
        process.env.GITHUB_CLIENT_SECRET || allEnv.githubClientSecret,
      callbackURL: process.env.GITHUB_CALLBACK_URL || allEnv.githubCallbackUrl,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Here you can handle the user profile and access token as needed
    return { profile, accessToken, refreshToken };
  }
}
