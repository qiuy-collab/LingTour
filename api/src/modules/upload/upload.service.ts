import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Dirent } from 'fs';
import { readdir, stat, unlink } from 'fs/promises';
import {
  buildPublicUploadUrl,
  buildStoredUploadPath,
  resolveStoredUploadPath,
  sanitizeUploadModule,
} from './upload-path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly configService: ConfigService) {}

  private get uploadDir(): string {
    return join(
      process.cwd(),
      this.configService.get<string>('UPLOAD_DIR', './uploads'),
    );
  }

  /**
   * Process uploaded file and return public URL.
   * Mock OSS: file is already saved to disk by multer.
   * Replace with OSS SDK upload when real credentials are available.
   */
  getFileUrl(filename: string): string {
    return buildPublicUploadUrl(filename);
  }

  /**
   * Generate a structured file path for OSS.
   * Currently returns just the flat filename.
   */
  getStructuredPath(
    filename: string,
    module?: string,
  ): { url: string; filename: string } {
    const structuredFilename = buildStoredUploadPath(filename, module);

    return {
      url: buildPublicUploadUrl(filename, module),
      filename: structuredFilename,
    };
  }

  /**
   * List uploaded files from the uploads directory.
   * Returns paginated results with file metadata.
   */
  async listFiles(page = 1, limit = 30, module?: string) {
    try {
      const safeModule = sanitizeUploadModule(module);
      const directories = safeModule ? [safeModule] : [''];
      const files: Array<{ name: string; absolutePath: string }> = [];

      for (const directory of directories) {
        const dir = directory ? join(this.uploadDir, directory) : this.uploadDir;
        const entries = (await readdir(dir, { withFileTypes: true }).catch(
          () => [],
        )) as Dirent[];

        for (const entry of entries) {
          if (entry.isFile()) {
            files.push({
              name: directory ? `${directory}/${entry.name}` : entry.name,
              absolutePath: join(dir, entry.name),
            });
          }
        }

        if (!safeModule) {
          const subdirs = entries.filter((entry) => entry.isDirectory());
          for (const subdir of subdirs) {
            let safeSubdir: string | undefined;
            try {
              safeSubdir = sanitizeUploadModule(subdir.name);
            } catch {
              continue;
            }
            if (!safeSubdir) {
              continue;
            }
            const subdirPath = join(dir, safeSubdir);
            const subEntries = await readdir(subdirPath, {
              withFileTypes: true,
            }).catch(() => []);
            for (const subEntry of subEntries) {
              if (subEntry.isFile()) {
                files.push({
                  name: `${safeSubdir}/${subEntry.name}`,
                  absolutePath: join(subdirPath, subEntry.name),
                });
              }
            }
          }
        }
      }

      const fileInfos = await Promise.all(
        files.map(async (f) => {
          try {
            const s = await stat(f.absolutePath);
            return {
              filename: f.name,
              url: buildPublicUploadUrl(f.name),
              size: s.size,
              createdAt: s.birthtime.toISOString(),
              modifiedAt: s.mtime.toISOString(),
            };
          } catch {
            return null;
          }
        }),
      );

      const validFiles = fileInfos
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(b!.createdAt).getTime() -
            new Date(a!.createdAt).getTime(),
        ) as NonNullable<(typeof fileInfos)[number]>[];

      const total = validFiles.length;
      const items = validFiles.slice((page - 1) * limit, page * limit);

      return { items, total, page, limit };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to list files: ${message}`);
      return { items: [], total: 0, page, limit };
    }
  }

  /**
   * Delete a file from the uploads directory.
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = resolveStoredUploadPath(this.uploadDir, filename);
      await unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
