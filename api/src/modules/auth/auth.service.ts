import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private formatAccountId(userId: string): string {
    const compact = userId.replace(/-/g, '').slice(0, 8).toUpperCase();
    return `LT-${compact}`;
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    role: 'admin' | 'editor';
    name: string | null;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      expires_in: '24h',
      user: {
        id: user.id,
        accountId: this.formatAccountId(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.buildAuthResponse(user);
  }

  async register(name: string, email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('This email is already in use');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.usersService.create(email, passwordHash, 'editor', name);
    return this.buildAuthResponse(user);
  }

  async loginWithGoogle(email: string, name?: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      return this.buildAuthResponse(existing);
    }

    const generatedPassword = await bcrypt.hash(
      `google:${email}:${Date.now()}`,
      8,
    );
    const user = await this.usersService.create(
      email,
      generatedPassword,
      'editor',
      name ?? 'Google Traveler',
    );
    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.usersService.findByIdOrFail(userId);
    return {
      id: user.id,
      accountId: this.formatAccountId(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.email.endsWith('@lingtour.local') ? 'Google' : undefined,
    };
  }
}
