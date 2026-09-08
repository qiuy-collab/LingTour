import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { resolveJwtSecret } from '../auth/jwt-config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { token, source } = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    if (source === 'cookie' && this.isUnsafeMethod(request.method)) {
      this.assertSameOrigin(request);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: resolveJwtSecret(this.configService),
      });
      // Set request.user so that subsequent guards (like RolesGuard) can access it
      (request as any).user = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): {
    token?: string;
    source?: 'bearer' | 'cookie';
  } {
    const [type, bearerToken] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && bearerToken) {
      return { token: bearerToken, source: 'bearer' };
    }

    const cookieHeader = request.headers.cookie ?? '';
    const cookieToken = cookieHeader
      .split(';')
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith('lingtour_session='))
      ?.slice('lingtour_session='.length);

    if (!cookieToken) return {};
    try {
      return { token: decodeURIComponent(cookieToken), source: 'cookie' };
    } catch {
      return {};
    }
  }

  private isUnsafeMethod(method?: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      (method ?? 'GET').toUpperCase(),
    );
  }

  private assertSameOrigin(request: Request): void {
    const origin = request.headers.origin;
    if (!origin) {
      throw new UnauthorizedException('Missing Origin for cookie-authenticated request');
    }

    const configured = this.configService.get<string>('frontendUrl')?.trim();
    const expectedOrigin = configured
      ? new URL(configured).origin
      : `${request.headers['x-forwarded-proto'] ?? request.protocol}://${request.headers['x-forwarded-host'] ?? request.headers.host}`;

    if (origin !== expectedOrigin) {
      throw new UnauthorizedException('Cross-origin cookie request rejected');
    }
  }
}
