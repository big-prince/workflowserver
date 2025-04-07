/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { hash, compare } from 'bcryptjs';
import { CustomError } from '../exceptions/customError';
import { HttpStatus } from '@nestjs/common';

//hash password function
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt: number = 10;
    const hashedPassword: string = await hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new CustomError(
      'Error hashing password',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

//compare password function
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    const isMatch: boolean = await compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new CustomError(
      'Error comparing password',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
