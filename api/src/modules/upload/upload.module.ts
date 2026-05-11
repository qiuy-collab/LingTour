import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: join(
            process.cwd(),
            configService.get<string>('UPLOAD_DIR', './uploads'),
          ),
          filename: (_req, file, callback) => {
            const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
            callback(null, uniqueName);
          },
        }),
        limits: {
          fileSize: configService.get<number>(
            'MAX_FILE_SIZE',
            10 * 1024 * 1024,
          ),
        },
        fileFilter: (_req, file, callback) => {
          const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
          if (!allowedMimes.includes(file.mimetype)) {
            return callback(
              new Error('Unsupported file type. Allowed: jpg, png, webp'),
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
