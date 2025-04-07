/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/user.dto';
import { CustomError } from 'src/common/exceptions/customError';
import { User } from '@prisma/client';

const mockUsersService = {
  registerUser: jest.fn().mockResolvedValue({}),
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  remove: jest.fn().mockResolvedValue({}),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('POST /users/create-user', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        username: 'Testuser',
      };

      const expectedResult: User = {
        id: 'clxyz123456789abcdefghij',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        username: 'Testuser',
      };

      mockUsersService.registerUser.mockResolvedValue(expectedResult);

      const result = await controller.createUser(registerDto);

      expect(usersService.registerUser).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the service layer', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        username: 'Testuser',
      };

      const error = new Error('Registration failed');
      mockUsersService.registerUser.mockRejectedValue(error);

      await expect(controller.createUser(registerDto)).rejects.toThrow(error);
      expect(usersService.registerUser).toHaveBeenCalledWith(registerDto);
    });
  });
});
