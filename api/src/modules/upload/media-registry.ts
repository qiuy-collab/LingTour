import { DataSource } from 'typeorm';
import { readdir, stat } from 'fs/promises';
import { Dirent } from 'fs';
import { extname, join } from 'path';
import { buildPublicUploadUrl } from './upload-path';

const MEDIA_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
};

export interface RegisterMediaFileParams {
  /** Stored path relative to the upload root, e.g. "cities/abc.jpg". */
  filename: string;
  originalName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  module?: string | null;
  uploadedBy?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  /** Public URL; defaults to the canonical /uploads/<filename> form. */
  url?: string | null;
}

export interface RegisteredMediaRecord {
  id: string;
  createdAt: string;
}

/**
 * Single source of truth for keeping the media_files index in sync with
 * stored files. Upload endpoints, seed scripts, and external importers all
 * register through this function so the media library never misses a file
 * that exists on disk.
 *
 * Ownership fields (uploaded_by / entity_type / entity_id) are only
 * overwritten when explicitly provided, so a re-register never erases who
 * uploaded a file originally.
 */
export async function registerMediaFile(
  dataSource: DataSource,
  params: RegisterMediaFileParams,
): Promise<RegisteredMediaRecord | null> {
  const url = params.url ?? buildPublicUploadUrl(params.filename);
  const rows: Array<{ id: string; created_at: string }> =
    await dataSource.query(
      `INSERT INTO media_files
        (filename, original_name, mime_type, size_bytes, module, uploaded_by, entity_type, entity_id, url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (filename) DO UPDATE SET
         original_name = EXCLUDED.original_name,
         mime_type = EXCLUDED.mime_type,
         size_bytes = EXCLUDED.size_bytes,
         module = EXCLUDED.module,
         uploaded_by = COALESCE(EXCLUDED.uploaded_by, media_files.uploaded_by),
         entity_type = COALESCE(EXCLUDED.entity_type, media_files.entity_type),
         entity_id = COALESCE(EXCLUDED.entity_id, media_files.entity_id),
         url = EXCLUDED.url
       RETURNING id, created_at`,
      [
        params.filename,
        params.originalName ?? null,
        params.mimeType ?? null,
        params.sizeBytes ?? null,
        params.module ?? null,
        params.uploadedBy ?? null,
        params.entityType ?? null,
        params.entityId ?? null,
        url,
      ],
    );

  const row = rows?.[0];
  return row ? { id: row.id, createdAt: row.created_at } : null;
}

export interface MediaReindexResult {
  /** Media files found on disk (non-media files excluded). */
  scanned: number;
  /** Rows newly inserted into media_files. */
  registered: number;
  /** Rows refreshed with new size/mime/module metadata. */
  updated: number;
}

function isMediaFile(name: string): boolean {
  return MEDIA_EXTENSIONS.has(extname(name).toLowerCase());
}

async function listMediaFilesRecursive(
  dir: string,
  prefix: string,
): Promise<string[]> {
  const entries = (await readdir(dir, {
    withFileTypes: true,
  }).catch(() => [])) as Dirent[];
  const files: string[] = [];

  for (const entry of entries) {
    const relativeName = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(
        ...(await listMediaFilesRecursive(join(dir, entry.name), relativeName)),
      );
    } else if (entry.isFile() && isMediaFile(entry.name)) {
      files.push(relativeName);
    }
  }

  return files;
}

/**
 * Rebuild the media_files index from the upload directory. Every media file
 * on disk gets a row; existing rows are refreshed with current file
 * metadata. Ownership fields are never touched, and rows whose files have
 * disappeared are left in place (use the delete endpoint for those).
 */
export async function reindexMediaFilesFromDisk(
  dataSource: DataSource,
  uploadRoot: string,
): Promise<MediaReindexResult> {
  const storedNames = await listMediaFilesRecursive(uploadRoot, '');
  const result: MediaReindexResult = {
    scanned: storedNames.length,
    registered: 0,
    updated: 0,
  };

  for (const storedName of storedNames) {
    const module = storedName.includes('/') ? storedName.split('/')[0] : null;
    const absolutePath = join(uploadRoot, ...storedName.split('/'));
    const fileStat = await stat(absolutePath).catch(() => null);
    if (!fileStat?.isFile()) {
      continue;
    }

    const mimeType = MIME_BY_EXTENSION[extname(storedName).toLowerCase()];
    const originalName = storedName.split('/').pop() ?? storedName;

    const trackedBefore = await dataSource.query(
      `SELECT 1 AS present FROM media_files WHERE filename = $1`,
      [storedName],
    );

    await registerMediaFile(dataSource, {
      filename: storedName,
      originalName,
      mimeType: mimeType ?? null,
      sizeBytes: fileStat.size,
      module,
    });

    if (trackedBefore?.length > 0) {
      result.updated += 1;
    } else {
      result.registered += 1;
    }
  }

  return result;
}
