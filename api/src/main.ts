import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // P2-O: baseline security headers (nosniff, HSTS, frameguard, referrer
  // policy, ...). Tuned for an API that also serves /uploads/ media:
  // - CSP off: Swagger is the only HTML surface and a restrictive default
  //   would break it; browser-facing pages get headers at the nginx layer.
  // - CORP cross-origin: site and admin embed /uploads/ media from this
  //   origin; helmet's same-origin default would block those images.
  // - Frameguard deny: API responses must never be framed.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: { action: 'deny' },
    }),
  );

  const trustProxyHops = Number.parseInt(
    configService.get<string>('TRUST_PROXY_HOPS', '2'),
    10,
  );
  app.getHttpAdapter().getInstance().set(
    'trust proxy',
    Number.isFinite(trustProxyHops) && trustProxyHops >= 0
      ? trustProxyHops
      : 2,
  );

  // Defense in depth: match routes case-sensitively so that a capitalized
  // path (/ADMIN/...) can never reach a lowercase handler. Route matching
  // and role fallbacks then agree on one canonical casing.
  app.set('case sensitive routing', true);

  // Process-level safety net for unhandled errors
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
  const configuredFrontendUrl = configService.get<string>('frontendUrl');
  const adminFrontendUrl = configService.get<string>('ADMIN_FRONTEND_URL');
  const allowedOrigins = new Set<string>();

  if (configuredFrontendUrl) {
    try {
      allowedOrigins.add(new URL(configuredFrontendUrl).origin);
    } catch {
      logger.warn(`Invalid FRONTEND_URL ignored: ${configuredFrontendUrl}`);
    }
  }

  if (adminFrontendUrl) {
    try {
      allowedOrigins.add(new URL(adminFrontendUrl).origin);
    } catch {
      logger.warn(`Invalid ADMIN_FRONTEND_URL ignored: ${adminFrontendUrl}`);
    }
  }

  // CORS: allow local development hosts plus the configured frontend origin.
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const normalizedOrigin = origin ?? '';
      const isLocalDevOrigin =
        /^https?:\/\/localhost(:\d+)?$/.test(normalizedOrigin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(normalizedOrigin) ||
        /^https?:\/\/\[::1\](:\d+)?$/.test(normalizedOrigin);

      if (!origin || isLocalDevOrigin || allowedOrigins.has(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Only expose Swagger in non-production environments
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Culvoy API')
      .setDescription('Culvoy - Headless CMS + commerce API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT from POST /api/v1/auth/login',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
    logger.log(
      `Swagger docs at http://localhost:${configService.get<number>('PORT', 3001)}/api/docs`,
    );
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        // Keep request types strict. Content fields are English strings and
        // must not coerce legacy objects or numbers into text.
        enableImplicitConversion: false,
      },
    }),
  );

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  logger.log(`Culvoy API running on http://localhost:${port}`);
  logger.log(`Static uploads at http://localhost:${port}/uploads`);
}

bootstrap();
