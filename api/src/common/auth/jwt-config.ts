import type { JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export function resolveJwtSecret(configService: ConfigService): string {
  const configuredSecret =
    configService.get<string>('jwt.secret')?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    '';

  if (process.env.NODE_ENV === 'production') {
    if (!configuredSecret) {
      throw new Error('JWT_SECRET must be configured in production');
    }
    if (configuredSecret === 'dev-secret') {
      throw new Error('Refusing to use the development JWT secret in production');
    }
  }

  return configuredSecret || 'dev-secret';
}

export function resolveJwtExpiration(
  configService: ConfigService,
): JwtSignOptions['expiresIn'] {
  return (
    configService.get<string>('jwt.expiration')?.trim() ||
    process.env.JWT_EXPIRATION?.trim() ||
    '24h'
  ) as JwtSignOptions['expiresIn'];
}
