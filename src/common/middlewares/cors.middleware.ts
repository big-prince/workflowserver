/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NestMiddleware } from '@nestjs/common';
import * as cors from 'cors'; // Changed import style
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../exceptions/customError';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Initialize CORS with options
    const corsHandler = cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
      ],
    });

    // Execute CORS middleware
    corsHandler(req, res, (err) => {
      if (err) {
        console.error('Error in CORS middleware:', err);
        throw new CustomError('CORS Error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      next();
    });
  }
}
