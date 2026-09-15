import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { ConfigService } from '@nestjs/config';
import { resolveJwtExpiration } from '../../common/auth/jwt-config';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'crypto';
import { EmailVerificationService } from './email-verification.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  private formatAccountId(userId: string): string {
    const compact = userId.replace(/-/g, '').slice(0, 8).toUpperCase();
    return `LT-${compact}`;
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'traveler';
    name: string | null;
    avatarUrl?: string;
    country?: string;
    homeBase?: string;
    travelStyle?: string;
    provider?: string;
    memberSince?: string;
    bio?: string;
    profileVisibility?: 'public' | 'community' | 'private';
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = resolveJwtExpiration(this.configService);

    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
      expires_in: expiresIn,
      user: {
        id: user.id,
        accountId: this.formatAccountId(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl ?? '',
        country: user.country ?? '',
        homeBase: user.homeBase ?? '',
        travelStyle: user.travelStyle ?? '',
        provider: user.provider ?? '',
        memberSince: user.memberSince ?? '',
        bio: user.bio ?? '',
        profileVisibility: user.profileVisibility ?? 'public',
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('This account is disabled');
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
    const user = await this.usersService.create(
      email,
      passwordHash,
      'traveler',
      name,
      {
        provider: 'password',
        memberSince: new Date().toISOString().slice(0, 10),
      },
    );
    return this.buildAuthResponse(user);
  }

  async sendEmailCode(email: string, purpose: 'login' | 'signup') {
    return this.emailVerificationService.sendCode(email, purpose);
  }

  async verifyEmailCode(
    email: string,
    purpose: 'login' | 'signup',
    code: string,
    name?: string,
  ) {
    const verified = await this.emailVerificationService.consumeCode(
      email,
      purpose,
      code,
    );

    if (purpose === 'login') {
      const user = await this.usersService.findByEmail(verified.email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or verification code');
      }
      if (user.status !== 'active') {
        throw new UnauthorizedException('This account is disabled');
      }
      return this.buildAuthResponse(user);
    }

    const existing = await this.usersService.findByEmail(verified.email);
    if (existing) {
      throw new ConflictException('This email is already in use');
    }

    const passwordHash = await bcrypt.hash(`email-code:${verified.email}:${randomUUID()}`, 12);
    const user = await this.usersService.create(
      verified.email,
      passwordHash,
      'traveler',
      name?.trim() || verified.email.split('@')[0],
      {
        provider: 'email_code',
        memberSince: new Date().toISOString().slice(0, 10),
      },
    );
    return this.buildAuthResponse(user);
  }

  async loginWithGoogle(credential: string, nameOverride?: string) {
    // Verify the Google id_token cryptographically
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new UnauthorizedException(
        'Google login is not configured (missing GOOGLE_CLIENT_ID)',
      );
    }

    const client = new OAuth2Client(clientId);
    let payload: { email?: string; name?: string; email_verified?: boolean };

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload() as any;
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }

    if (!payload?.email) {
      throw new UnauthorizedException('Google token missing email claim');
    }
    if (!payload.email_verified) {
      throw new UnauthorizedException('Google email not verified');
    }

    const email = payload.email;
    const name = nameOverride ?? payload.name ?? 'Google Traveler';

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      if (!existing.provider || existing.provider !== 'Google') {
        await this.usersService.touchProvider(existing.id, 'Google');
        const refreshed = await this.usersService.findByIdOrFail(existing.id);
        return this.buildAuthResponse(refreshed);
      }
      return this.buildAuthResponse(existing);
    }

    const generatedPassword = await bcrypt.hash(
      `google:${email}:${Date.now()}`,
      8,
    );
    const user = await this.usersService.create(
      email,
      generatedPassword,
      'traveler',
      name,
      {
        provider: 'Google',
        memberSince: new Date().toISOString().slice(0, 10),
      },
    );
    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    return this.usersService.getProfileById(userId);
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    await this.usersService.updateProfile(userId, dto);
    return this.usersService.getProfileById(userId);
  }

  /**
   * Refresh an expired (or soon-to-expire) JWT.
   * Allows tokens up to 1 hour past their expiration as a grace period.
   */
  async refreshToken(rawToken: string) {
    // 1. Decode / verify the token, ignoring expiration so we can do our own check
    let decoded: {
      sub: string;
      email: string;
      role: string;
      exp?: number;
      iat?: number;
    };
    try {
      decoded = this.jwtService.verify(rawToken, { ignoreExpiration: true });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (!decoded?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 2. Enforce a 1-hour grace window after expiry
    const GRACE_PERIOD_SECONDS = 60 * 60; // 1 hour
    if (decoded.exp) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (nowSeconds - decoded.exp > GRACE_PERIOD_SECONDS) {
        throw new UnauthorizedException(
          'Token has expired beyond the refresh window',
        );
      }
    }

    // 3. Re-check account status before issuing a fresh token.
    const user = await this.usersService.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    if (user.status !== 'active') {
      throw new UnauthorizedException('This account is disabled');
    }

    // 4. Build a fresh auth response (new 24h token)
    return this.buildAuthResponse(user);
  }
}
