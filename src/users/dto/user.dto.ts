import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { getUser, UserBase } from 'src/configs/interfaces/user.interface';

type RegisterUser = Required<
  Pick<UserBase, 'email' | 'password' | 'fullName'> & Pick<UserBase, 'username'>
>;
type loginUser = Required<Pick<UserBase, 'email' | 'password'>>;

export class RegisterDto implements RegisterUser {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  fullName: string;
}

export class GithubAuthUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  fullName: string;
}

export class GithubAuthDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

export class LoginDto implements loginUser {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class GetUser implements getUser {
  @IsString()
  id?: string;

  @IsEmail()
  email?: string;

  @IsString()
  username?: string;
}
