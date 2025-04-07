import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/user.dto';
import { User } from '@prisma/client';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //register user
  @Post('create-user')
  async createUser(@Body() body: RegisterDto): Promise<User> {
    return await this.usersService.registerUser(body).catch((e) => {
      console.log(e);
      throw e;
    });
  }
}
