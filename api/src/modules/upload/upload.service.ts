import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Process uploaded file and return public URL.
   * Mock OSS: file is already saved to disk by multer.
   * Replace with OSS SDK upload when real credentials are available.
   */
  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  /**
   * Generate a structured file path for OSS.
   * Currently returns just the flat filename.
   */
  getStructuredPath(
    filename: string,
    module?: string,
  ): { url: string; filename: string } {
    const structuredFilename = module ? `${module}/${filename}` : filename;

    return {
      url: `/uploads/${structuredFilename}`,
      filename: structuredFilename,
    };
  }
}
