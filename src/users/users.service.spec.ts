/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CustomError } from 'src/common/exceptions/customError';

// Create a mock for PrismaService
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      // Mock data
      const userData = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        username: 'testuser',
      };

      const expectedUser: Partial<User> = {
        id: 'clxyz123456789abcdefghij',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'hashedpassword',
        username: 'testuser',
      };

      // Mock methods
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      // Call the service method
      const result = await service.registerUser(userData);

      // Assertions
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw conflict error if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        username: 'testuser',
      };

      const existingUser: Partial<User> = {
        id: 'clxyz123456789abcdefghij',
        email: 'test@example.com',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.registerUser(userData)).rejects.toThrow(
        new CustomError('User Already Exists', 409),
      );
    });

    it('should handle prisma errors during registration', async () => {
      const userData = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        username: 'testuser',
      };

      const prismaError = new Error('Prisma error');
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(service.registerUser(userData)).rejects.toThrow(
        new CustomError(prismaError.message, 500),
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return user if found', async () => {
      const email = 'test@example.com';
      const expectedUser: Partial<User> = {
        id: 'clxyz123456789abcdefghij',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.getUserByEmail(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw error if user not found', async () => {
      const email = 'nonexistent@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserByEmail(email)).rejects.toThrow(
        new CustomError('NO user Record', 409),
      );
    });
  });
});
