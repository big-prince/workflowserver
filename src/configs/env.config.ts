/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/configuration.ts
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import * as jwt from 'jsonwebtoken';

export const validationSchema: Joi.ObjectSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_URL: Joi.string(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1h'),
});

export default registerAs('app', () => ({
  env: process.env.NODE_ENV as 'development' | 'production' | 'test',
  port: parseInt(process.env.PORT!, 10),
  dbUrl: process.env.DATABASE_URL,
  dbHost: process.env.DATABASE_HOST,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
}));

export const allEnv = {
  env: process.env.NODE_ENV as 'development' | 'production' | 'test',
  port: parseInt(process.env.PORT!, 10),
  dbUrl: process.env.DATABASE_URL,
  dbHost: process.env.DATABASE_HOST,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
};
