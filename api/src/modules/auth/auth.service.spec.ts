import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EmailVerificationService } from './email-verification.service';

describe('AuthService', () => {
  let authService: AuthService;
  type MockedMethods<T> = Partial<{
    [K in keyof T]: T[K] extends (...args: any[]) => any ? jest.Mock : T[K];
  }>;

  let usersService: MockedMethods<UsersService>;
  let jwtService: MockedMethods<JwtService>;
  let emailVerificationService: {
    sendCode: jest.Mock;
    consumeCode: jest.Mock;
  };

  const mockUser = {
    id: 'uuid-test',
    email: 'admin@culvoy.com',
    passwordHash: '',
    role: 'admin' as const,
    status: 'active' as const,
    name: 'Test Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    emailVerificationService = {
      sendCode: jest.fn(),
      consumeCode: jest.fn(),
    };

    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.expiration') return '24h';
        if (key === 'jwt.secret') return 'test-secret';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: EmailVerificationService, useValue: emailVerificationService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    mockUser.passwordHash = await bcrypt.hash('Culvoy2026!', 4);
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      const result = await authService.validateUser(
        'admin@culvoy.com',
        'Culvoy2026!',
      );
      expect(result).toBeDefined();
      expect(result.email).toBe('admin@culvoy.com');
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
        authService.validateUser('admin@culvoy.com', 'WrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject a disabled account even with the correct password', async () => {
      usersService.findByEmail!.mockResolvedValue({
        ...mockUser,
        status: 'banned',
      } as any);

      await expect(
        authService.validateUser('admin@culvoy.com', 'Culvoy2026!'),
      ).rejects.toThrow('This account is disabled');
    });
  });

  describe('login', () => {
    it('should return access_token on successful login', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      const result = await authService.login(
        'admin@culvoy.com',
        'Culvoy2026!',
      );

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.expires_in).toBe('24h');
      expect(result.user.email).toBe('admin@culvoy.com');
      expect(result.user.role).toBe('admin');
      expect(result.user.accountId).toBe('LT-UUIDTEST');
    });

    it('should not expose passwordHash in response', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      const result = await authService.login(
        'admin@culvoy.com',
        'Culvoy2026!',
      );

      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('should sign JWT with correct payload', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      await authService.login('admin@culvoy.com', 'Culvoy2026!');

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        { expiresIn: '24h' },
      );
    });
  });

  describe('refreshToken', () => {
    it('rejects a banned account even when its token is within the grace period', async () => {
      jwtService.verify!.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        exp: Math.floor(Date.now() / 1000) - 60,
      } as any);
      usersService.findById!.mockResolvedValue({
        ...mockUser,
        status: 'banned',
      } as any);

      await expect(authService.refreshToken('expired-token')).rejects.toThrow(
        'This account is disabled',
      );
    });
  });

  describe('email code authentication', () => {
    it('logs in an existing active account after code verification', async () => {
      emailVerificationService.consumeCode.mockResolvedValue({
        email: 'admin@culvoy.com',
        purpose: 'login',
      });
      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      const result = await authService.verifyEmailCode(
        'admin@culvoy.com',
        'login',
        '248613',
      );

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('admin@culvoy.com');
    });

    it('creates a traveler account after signup code verification', async () => {
      const created = {
        ...mockUser,
        id: 'traveler-id',
        email: 'traveler@example.com',
        role: 'traveler' as const,
        name: 'Maya Chen',
        provider: 'email_code',
      };
      emailVerificationService.consumeCode.mockResolvedValue({
        email: 'traveler@example.com',
        purpose: 'signup',
      });
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue(created as any);

      const result = await authService.verifyEmailCode(
        'traveler@example.com',
        'signup',
        '248613',
        'Maya Chen',
      );

      expect(usersService.create).toHaveBeenCalledWith(
        'traveler@example.com',
        expect.any(String),
        'traveler',
        'Maya Chen',
        expect.objectContaining({ provider: 'email_code' }),
      );
      expect(result.user.role).toBe('traveler');
      expect(result.user.email).toBe('traveler@example.com');
    });
  });
});
