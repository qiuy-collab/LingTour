import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Process-level safety net for unhandled errors
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
  const configuredFrontendUrl = configService.get<string>('frontendUrl');
  const allowedOrigins = new Set<string>();

  if (configuredFrontendUrl) {
    try {
      allowedOrigins.add(new URL(configuredFrontendUrl).origin);
    } catch {
      logger.warn(`Invalid FRONTEND_URL ignored: ${configuredFrontendUrl}`);
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
      .setTitle('LingTour API')
      .setDescription('LingTour - Headless CMS + commerce API')
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
    logger.log(`Swagger docs at http://localhost:${configService.get<number>('PORT', 3001)}/api/docs`);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  logger.log(`LingTour API running on http://localhost:${port}`);
  logger.log(`Static uploads at http://localhost:${port}/uploads`);
}

bootstrap();
