import { IsEmail, IsNotEmpty, IsString, IsDate } from 'class-validator';
import {
  TokenPayloadInterface,
  TokenModelInterface,
} from 'src/configs/interfaces/auth.interface';

export class TokenPayloadDto implements TokenPayloadInterface {
  @IsString()
  @IsNotEmpty()
  sub: string;

  @IsEmail()
  email: string;
}

export class TokenModelDto implements TokenModelInterface {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsDate()
  @IsNotEmpty()
  expiresAt: Date;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
