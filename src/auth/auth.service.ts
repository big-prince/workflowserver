/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { CustomError } from 'src/common/exceptions/customError';
import {
  TokenPayloadInterface,
  TokenModelInterface,
  SaveTokenInterface,
} from 'src/configs/interfaces/auth.interface';
//config file
import { allEnv } from 'src/configs/env.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/redis/cache.service';
import { cacheKeys } from 'src/redis/redis.keys';
import { hashPassword, comparePassword } from 'src/common/utils/hashpassword';
import { UsersService } from 'src/users/users.service';
import { RegisterDto, LoginDto } from 'src/users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: CacheService,
    private readonly userService: UsersService,
  ) {}

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  //generate Token
  generateToken(payload: TokenPayloadInterface): string {
    const secret = allEnv.jwtSecret || process.env.JWT_SECRET;
    if (!secret) {
      throw new CustomError('JWT secret not found', 500);
    }
    return jwt.sign(payload, secret);
  }

  //generate Refresh Token
  generateRefreshToken(payload: TokenPayloadInterface): string {
    const secret = allEnv.jwtSecret || process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new CustomError('JWT refresh secret not found', 500);
    }
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

  //validate github Auth
  async validateGithubAuth(profile: any, token: string) {
    const { username, displayName, emails } = profile;
    console.log('🚀 ~ AuthService ~ validateGithubAuth ~ profile:', profile);

    let email: string; // Will be set with unique value below
    if (emails && emails.length > 0) {
      email = emails[0].value;
    } else {
      // Try to get email from github api
      const githubEmail = await this.getGithubEmail(token);
      if (githubEmail) {
        email = githubEmail;
      } else {
        // Generate unique email using username or a random value
        const uniqueId = username || crypto.randomBytes(8).toString('hex');
        email = `github_${uniqueId}@placeholder.com`;
      }
    }

    // Safely extract the username part from email
    const emailUsername = email.includes('@') ? email.split('@')[0] : email;

    // Set display name with fallback to email username
    const displayNameValue = displayName || username || emailUsername;

    // Set username with fallback to email username
    const usernameValue = username || emailUsername;

    //check if user already exists
    const existingUser = await this.prisma.user
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
    if (existingUser) {
      console.log('⚠️ User Already in Database Records.');
      //update user if it exists
      await this.prisma.user
        .update({
          where: { id: existingUser.id },
          data: {
            username: usernameValue,
          },
        })
        .catch((e) => {
          console.log(e);
          if (e instanceof CustomError) {
            throw e;
          }
          throw new CustomError(`${e}`, 500);
        });

      if (existingUser.email == null) {
        throw new CustomError('Email not found', 500);
      }
      //generate tokens for user
      const accessToken = this.generateToken({
        sub: existingUser.id,
        email: existingUser.email,
      });
      const refreshToken = this.generateRefreshToken({
        sub: existingUser.id,
        email: existingUser.email,
      });

      if (!accessToken || !refreshToken) {
        throw new CustomError('Token generation failed', 500);
      }

      //save token in DB
      const savePayload: SaveTokenInterface = {
        userId: existingUser.id,
        token: refreshToken,
      };
      const saveToken = await this.saveToken(savePayload);
      if (!saveToken) {
        throw new CustomError('Token Not Saved to Dataase.', 500);
      }

      //save token in redis cache
      const cacheKey = `${cacheKeys.REFRESHTOKEN}:${existingUser.id}`;
      const cacheData = {
        userId: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        token: refreshToken,
      };
      const cacheTTL = 60 * 60 * 24; // 1 day
      await this.redis.set(cacheKey, cacheData, cacheTTL);

      //check if user is already cached
      const cachedUser = await this.redis.get(
        `${cacheKeys.USER_BY_EMAIL}:${existingUser.email}`,
      );
      if (!cachedUser) {
        const cacheKey = `${cacheKeys.USER_BY_EMAIL}:${existingUser.email}`;
        await this.redis.set(cacheKey, existingUser, 60 * 60 * 24); // Cache for 24 hours
      } else {
        //updates
        await this.redis.del(
          `${cacheKeys.USER_BY_EMAIL}:${existingUser.email}`,
        );
        await this.redis.set(
          `${cacheKeys.USER_BY_EMAIL}:${existingUser.email}`,
          existingUser,
          60 * 60 * 24,
        );
      }

      const responseModule: Record<string, any> = {
        message: 'User Found Successfully',
        accessToken,
        refreshToken,
        userID: existingUser.id,
      };

      return responseModule;
    }

    console.log('⚠️ User Not Found in Database Records, Creating New User.');
    console.log(
      '🚀 ~ AuthService ~ validateGithubAuth ~ email:',
      email,
      usernameValue,
      displayNameValue,
    );
    //Create new user if not exists
    const auxPassword = crypto.randomBytes(16).toString('hex');
    const userData: RegisterDto = {
      email,
      password: auxPassword,
      username: usernameValue,
      fullName: displayNameValue,
    };
    console.log('🚀 ~ AuthService ~ validateGithubAuth ~ userData:', userData);
    const user = await this.registerUser(userData).catch((e) => {
      console.log(e);
      if (e instanceof CustomError) {
        throw e;
      }
      throw new CustomError(`${e}`, 500);
    });

    if (!user) {
      throw new CustomError('User Not Created from Github Validation', 500);
    }

    return user;
  }

  async getGithubEmail(token: string) {
    try {
      const response = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (!response.ok) {
        console.error('Failed to fetch GitHub email:', response.status);
        return null;
      }
      const data = await response.json();
      return data[0].email; // Return the first email address
    } catch (e) {
      console.error('Error fetching GitHub email:', e);
      if (e instanceof CustomError) {
        throw e;
      }
      throw new CustomError('Failed to fetch GitHub email', 500);
    }
  }

  //Register User
  async registerUser(data: RegisterDto): Promise<Record<string, any>> {
    //check for user by email
    const userExist = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (userExist) {
      throw new CustomError('User Already Exists', 409);
    }
    //check for user by username
    const userExistByUsername = await this.prisma.user.findUnique({
      where: { username: data.username },
    });
    if (userExistByUsername) {
      throw new CustomError('Username Already Exists', 409);
    }
    //hash password
    const hashedPassword = await hashPassword(data.password);
    const createData = {
      ...data,
      password: hashedPassword,
    };
    const user = await this.prisma.user
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
    const token = this.generateToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);
    if (!token || !refreshToken) {
      throw new CustomError('Tokens Not Created', 500);
    }
    //save token in db
    const savePayload: SaveTokenInterface = {
      userId: user.id,
      token: refreshToken,
    };
    const saveToken = await this.saveToken(savePayload);
    if (!saveToken) {
      throw new CustomError('Token Not Saved', 500);
    }

    //save token in redis cache
    const cacheKey = `${cacheKeys.USER}:${user.id}`;
    const cacheData = {
      userId: user.id,
      email: data.email,
      username: data.username,
      token: refreshToken,
    };
    const cacheTTL = 60 * 60 * 24; // 1 day
    await this.redis.set(cacheKey, cacheData, cacheTTL);

    const responseModule: Record<string, any> = {
      message: 'User Created Successfully',
      accessToken: token,
      refreshToken: refreshToken,
      userID: user.id,
    };

    return responseModule;
  }

  //Login User
  async loginUser(data: LoginDto): Promise<Record<string, any>> {
    //check for user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
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
    const token = this.generateToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);
    if (!token || !refreshToken) {
      throw new CustomError('Tokens Not Created', 500);
    }
    //save token in db
    const savePayload: SaveTokenInterface = {
      userId: user.id,
      token: refreshToken,
    };
    const saveToken = await this.saveToken(savePayload);
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

  async logoutUser(userId: string): Promise<boolean> {
    //delete token from db
    const deleteToken = await this.prisma.token
      .deleteMany({
        where: { userId },
      })
      .catch((e) => {
        console.log(e);
        if (e instanceof CustomError) {
          throw e;
        }
        throw new CustomError(`${e}`, 500);
      });
    if (!deleteToken) {
      throw new CustomError('Token Not Deleted', 500);
    }

    //delete token from redis cache
    const cacheKey = `${cacheKeys.USER}:${userId}`;
    await this.redis.del(cacheKey);

    return true;
  }
}
