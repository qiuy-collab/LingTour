import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { extname, join } from 'path';
import { Dirent } from 'fs';
import { mkdir, readdir, stat, unlink, writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import {
  buildPublicUploadUrl,
  buildStoredUploadPath,
  normalizeUploadOriginalName,
  resolveStoredUploadPath,
  sanitizeUploadModule,
} from './upload-path';

export interface StoreFileOptions {
  module?: string;
  entityType?: string;
  entityId?: string;
  uploadedBy?: string;
}

export interface MediaFileRecord {
  id: string;
  filename: string;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  module: string | null;
  uploaded_by: string | null;
  entity_type: string | null;
  entity_id: string | null;
  url: string;
  created_at: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly defaultPageSize = 30;
  private readonly maxPageSize = 120;

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  private get uploadDir(): string {
    return join(
      process.cwd(),
      this.configService.get<string>('UPLOAD_DIR', './uploads'),
    );
  }

  private getUploadDestination(module?: string): string {
    const safeModule = sanitizeUploadModule(module);
    return safeModule ? join(this.uploadDir, safeModule) : this.uploadDir;
  }

  private normalizePage(page?: number): number {
    if (!Number.isFinite(page) || !page || page < 1) {
      return 1;
    }
    return Math.floor(page);
  }

  private normalizeLimit(limit?: number): number {
    if (!Number.isFinite(limit) || !limit || limit < 1) {
      return this.defaultPageSize;
    }
    return Math.min(Math.floor(limit), this.maxPageSize);
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

  async storeUploadedFile(
    file: Express.Multer.File,
    moduleOrOptions?: string | StoreFileOptions,
  ): Promise<{ url: string; filename: string; mediaFileId?: string }> {
    file.originalname = normalizeUploadOriginalName(file.originalname);

    const options: StoreFileOptions =
      typeof moduleOrOptions === 'string'
        ? { module: moduleOrOptions }
        : (moduleOrOptions ?? {});

    const safeModule = sanitizeUploadModule(options.module);

    let result: { url: string; filename: string; mediaFileId?: string };

    if (file.filename) {
      result = this.getStructuredPath(file.filename, safeModule);
    } else if (file.buffer) {
      const destination = this.getUploadDestination(safeModule);
      await mkdir(destination, { recursive: true });

      const ext = extname(file.originalname || '');
      const uniqueFilename = `${uuidv4()}${ext}`;
      const storedPath = buildStoredUploadPath(uniqueFilename, safeModule);
      await writeFile(join(destination, uniqueFilename), file.buffer);

      result = {
        url: buildPublicUploadUrl(storedPath),
        filename: storedPath,
      };
    } else {
      throw new BadRequestException('Uploaded file buffer is missing');
    }

    // Track the file in the media_files table
    try {
      const inserted = await this.dataSource.query(
        `INSERT INTO media_files (filename, original_name, mime_type, size_bytes, module, uploaded_by, entity_type, entity_id, url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (filename) DO UPDATE SET
           original_name = EXCLUDED.original_name,
           mime_type = EXCLUDED.mime_type,
           size_bytes = EXCLUDED.size_bytes,
           module = EXCLUDED.module,
           uploaded_by = EXCLUDED.uploaded_by,
           entity_type = EXCLUDED.entity_type,
           entity_id = EXCLUDED.entity_id,
           url = EXCLUDED.url
         RETURNING id, created_at`,
        [
          result.filename,
          file.originalname ?? null,
          file.mimetype ?? null,
          file.size ?? null,
          safeModule ?? null,
          options.uploadedBy ?? null,
          options.entityType ?? null,
          options.entityId ?? null,
          result.url,
        ],
      );
      if (inserted?.[0]?.id) {
        result = { ...result, mediaFileId: inserted[0].id };
      }
    } catch (err: unknown) {
      // Log but don't fail the upload if media tracking fails
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to track media file in database: ${message}`);
    }

    return result;
  }

  /**
   * List uploaded files from the uploads directory.
   * Returns paginated results with file metadata.
   */
  async listFiles(page = 1, limit = 30, module?: string) {
    try {
      const safeModule = sanitizeUploadModule(module);
      const safePage = this.normalizePage(page);
      const safeLimit = this.normalizeLimit(limit);
      const directories = safeModule ? [safeModule] : [''];
      const files: Array<{ name: string; absolutePath: string }> = [];

      for (const directory of directories) {
        const dir = directory
          ? join(this.uploadDir, directory)
          : this.uploadDir;
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
            new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime(),
        ) as NonNullable<(typeof fileInfos)[number]>[];

      const total = validFiles.length;
      const items = validFiles.slice(
        (safePage - 1) * safeLimit,
        safePage * safeLimit,
      );

      return { data: items, total, page: safePage, pageSize: safeLimit };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to list files: ${message}`);
      return {
        data: [],
        total: 0,
        page: this.normalizePage(page),
        pageSize: this.normalizeLimit(limit),
      };
    }
  }

  /**
   * Delete a file from the uploads directory and its media_files record.
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = resolveStoredUploadPath(this.uploadDir, filename);
      await unlink(filePath);

      // Also remove the tracking record
      try {
        await this.dataSource.query(
          `DELETE FROM media_files WHERE filename = $1`,
          [filename],
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed to remove media_files record: ${message}`);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Query media_files with optional filters.
   */
  async queryMediaFiles(params: {
    page?: number;
    limit?: number;
    module?: string;
    entityType?: string;
    entityId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    type?: 'image' | 'video';
  }): Promise<{
    data: MediaFileRecord[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = this.normalizePage(params.page);
    const limit = this.normalizeLimit(params.limit);
    const module = sanitizeUploadModule(params.module);
    const search = params.search?.trim();
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (module) {
      conditions.push(`module = $${paramIndex++}`);
      values.push(module);
    }
    if (params.entityType) {
      conditions.push(`entity_type = $${paramIndex++}`);
      values.push(params.entityType);
    }
    if (params.entityId) {
      conditions.push(`entity_id = $${paramIndex++}`);
      values.push(params.entityId);
    }
    if (search) {
      conditions.push(
        `(filename ILIKE $${paramIndex} OR original_name ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }
    if (params.dateFrom) {
      conditions.push(`created_at >= $${paramIndex++}`);
      values.push(params.dateFrom);
    }
    if (params.dateTo) {
      conditions.push(`created_at <= $${paramIndex++}`);
      values.push(params.dateTo);
    }
    if (params.type) {
      conditions.push(`mime_type LIKE $${paramIndex++}`);
      values.push(`${params.type}/%`);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      const countResult = await this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM media_files ${where}`,
        values,
      );
      const total = countResult[0]?.count ?? 0;

      const offset = (page - 1) * limit;
      const items = await this.dataSource.query(
        `SELECT id, filename, original_name, mime_type, size_bytes, module,
                uploaded_by, entity_type, entity_id, url, created_at
         FROM media_files ${where}
         ORDER BY created_at DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
        [...values, limit, offset],
      );

      return { data: items, total, page, pageSize: limit };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to query media_files: ${message}`);
      return { data: [], total: 0, page, pageSize: limit };
    }
  }

  /**
   * Find orphan files: files on disk that are NOT tracked in media_files.
   */
  async findOrphanFiles(): Promise<
    Array<{ filename: string; url: string; size: number; createdAt: string }>
  > {
    try {
      // Get all files from media_files table
      const trackedRows = await this.dataSource.query(
        `SELECT filename FROM media_files`,
      );
      const trackedSet = new Set<string>(
        trackedRows.map((r: { filename: string }) => r.filename),
      );

      // Scan disk for all files
      const allDiskFiles = await this.scanAllDiskFiles();

      // Filter to only those not in media_files
      const orphans: Array<{
        filename: string;
        url: string;
        size: number;
        createdAt: string;
      }> = [];

      for (const diskFile of allDiskFiles) {
        if (!trackedSet.has(diskFile.name)) {
          try {
            const s = await stat(diskFile.absolutePath);
            orphans.push({
              filename: diskFile.name,
              url: buildPublicUploadUrl(diskFile.name),
              size: s.size,
              createdAt: s.birthtime.toISOString(),
            });
          } catch {
            // skip files that can't be stat'd
          }
        }
      }

      return orphans.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to find orphan files: ${message}`);
      return [];
    }
  }

  /**
   * Internal helper to scan all files on disk under the upload directory.
   */
  private async scanAllDiskFiles(): Promise<
    Array<{ name: string; absolutePath: string }>
  > {
    const files: Array<{ name: string; absolutePath: string }> = [];
    const rootDir = this.uploadDir;

    const entries = (await readdir(rootDir, { withFileTypes: true }).catch(
      () => [],
    )) as Dirent[];

    for (const entry of entries) {
      if (entry.isFile()) {
        files.push({
          name: entry.name,
          absolutePath: join(rootDir, entry.name),
        });
      }
    }

    // Scan subdirectories (module folders)
    const subdirs = entries.filter((entry) => entry.isDirectory());
    for (const subdir of subdirs) {
      let safeSubdir: string | undefined;
      try {
        safeSubdir = sanitizeUploadModule(subdir.name);
      } catch {
        continue;
      }
      if (!safeSubdir) continue;

      const subdirPath = join(rootDir, safeSubdir);
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

    return files;
  }
}
