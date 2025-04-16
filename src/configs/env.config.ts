// src/configuration.ts
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const validationSchema: Joi.ObjectSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_URL: Joi.string(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1h'),
  REDIS_HOST: Joi.string(),
  GITHUB_CLIENT_ID: Joi.string(),
  GITHUB_CLIENT_SECRET: Joi.string(),
  GITHUB_CALLBACK_URL: Joi.string(),
});

export default registerAs('app', () => ({
  env: process.env.NODE_ENV as 'development' | 'production' | 'test',
  port: parseInt(process.env.PORT!, 10),
  dbUrl: process.env.DATABASE_URL,
  dbHost: process.env.DATABASE_HOST,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
  redisHost: process.env.REDIS_HOST,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
}));

export const allEnv = {
  env: process.env.NODE_ENV as 'development' | 'production' | 'test',
  port: parseInt(process.env.PORT!, 10),
  dbUrl: process.env.DATABASE_URL,
  dbHost: process.env.DATABASE_HOST,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  redisHost: process.env.REDIS_HOST,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
};
