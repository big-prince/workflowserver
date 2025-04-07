/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
});

export default registerAs('app', () => ({
  env: process.env.NODE_ENV as 'development' | 'production' | 'test',
  port: parseInt(process.env.PORT!, 10),
  dbUrl: process.env.DATABASE_URL,
  dbHost: process.env.DATABASE_HOST,
}));
