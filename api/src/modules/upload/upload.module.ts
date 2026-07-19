import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { mkdir } from 'fs/promises';
import { sanitizeUploadModule } from './upload-path';
import { isAllowedImageUpload, MAX_IMAGE_FILE_SIZE } from './upload-policy';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: (req, _file, callback) => {
            void (async () => {
              const uploadRoot = join(
                process.cwd(),
                configService.get<string>('UPLOAD_DIR', './uploads'),
              );
              const moduleFromBody =
                typeof req?.body?.module === 'string'
                  ? req.body.module
                  : undefined;
              const moduleFromRoute = (() => {
                const url = String(req?.originalUrl ?? '');
                if (url.includes('/public/community/upload'))
                  return 'community';
                if (url.includes('/auth/me/avatar')) return 'avatars';
                return undefined;
              })();
              const module = sanitizeUploadModule(
                moduleFromBody ?? moduleFromRoute,
              );
              const destination = module
                ? join(uploadRoot, module)
                : uploadRoot;
              await mkdir(destination, { recursive: true });
              callback(null, destination);
            })().catch((error: unknown) => {
              callback(
                error instanceof Error
                  ? error
                  : new Error('Failed to create upload directory'),
                '',
              );
            });
          },
          filename: (_req, file, callback) => {
            const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
            callback(null, uniqueName);
          },
        }),
        limits: {
          fileSize: configService.get<number>(
            'MAX_FILE_SIZE',
            MAX_IMAGE_FILE_SIZE,
          ),
        },
        fileFilter: (_req, file, callback) => {
          if (!isAllowedImageUpload(file)) {
            return callback(
              new Error('Unsupported file type. Allowed: jpg, png, webp, gif'),
              false,
            );
          }
          callback(null, true);
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
