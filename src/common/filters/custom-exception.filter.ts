import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomError } from '../exceptions/customError';

@Catch(CustomError)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response
      .status(exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        statusCode: exception.statusCode,
        message: exception.message,
        error: 'CustomError',
      });
  }
}
