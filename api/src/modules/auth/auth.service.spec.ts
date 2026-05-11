import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  const mockUser = {
    id: 'uuid-test',
    email: 'admin@lingtour.cn',
    passwordHash: '',
    role: 'admin' as const,
    name: 'Test Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    mockUser.passwordHash = await bcrypt.hash('LingTour2026!', 4);
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      const result = await authService.validateUser(
        'admin@lingtour.cn',
        'LingTour2026!',
      );
      expect(result).toBeDefined();
      expect(result.email).toBe('admin@lingtour.cn');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        authService.validateUser('unknown@test.com', 'any'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      await expect(
        authService.validateUser('admin@lingtour.cn', 'WrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access_token on successful login', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      const result = await authService.login(
        'admin@lingtour.cn',
        'LingTour2026!',
      );

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.expires_in).toBe('24h');
      expect(result.user.email).toBe('admin@lingtour.cn');
      expect(result.user.role).toBe('admin');
    });

    it('should not expose passwordHash in response', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      const result = await authService.login(
        'admin@lingtour.cn',
        'LingTour2026!',
      );

      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('should sign JWT with correct payload', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      await authService.login('admin@lingtour.cn', 'LingTour2026!');

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });
});
