import { DataSource } from 'typeorm';
import { stat } from 'fs/promises';
import { join } from 'path';
import {
  buildPublicUploadUrl,
  normalizeStoredRelativePath,
} from '../../modules/upload/upload-path';

const MEDIA_REFERENCE_QUERIES = [
  `SELECT hero_image, gallery_images, food_images FROM cities WHERE deleted_at IS NULL`,
  `SELECT image, images, breath_image FROM city_culture_sections`,
  `SELECT cover_image FROM story_routes WHERE deleted_at IS NULL`,
  `SELECT image, images FROM route_stops`,
  `SELECT image FROM store_collections`,
  `SELECT image, gallery FROM store_products WHERE deleted_at IS NULL`,
  `SELECT avatar FROM interpreter_profiles`,
  `SELECT image FROM events`,
  `SELECT image FROM community_posts WHERE deleted_at IS NULL`,
];

function visitValue(value: unknown, collector: Set<string>) {
  if (!value) return;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('/uploads/')) {
      collector.add(trimmed.replace(/^\/uploads\//, ''));
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      visitValue(entry, collector);
    }
    return;
  }

  if (typeof value === 'object') {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      visitValue(entry, collector);
    }
  }
}

export function extractUploadReferences(payload: unknown): string[] {
  const collector = new Set<string>();
  visitValue(payload, collector);
  return [...collector];
}

export async function collectReferencedMediaFilenames(
  dataSource: DataSource,
): Promise<string[]> {
  const collector = new Set<string>();

  for (const query of MEDIA_REFERENCE_QUERIES) {
    const rows = (await dataSource.query(query)) as Array<Record<string, unknown>>;
    for (const row of rows) {
      for (const value of Object.values(row)) {
        for (const filename of extractUploadReferences(value)) {
          collector.add(normalizeStoredRelativePath(filename));
        }
      }
    }
  }

  return [...collector].sort();
}

export async function syncMediaLibraryRecords(
  dataSource: DataSource,
  filenames: string[],
  uploadRoot: string,
) {
  const normalized = [...new Set(filenames.map((name) => normalizeStoredRelativePath(name)))];

  await dataSource.query(`DELETE FROM media_files WHERE module = 'seed'`);

  const inserted: string[] = [];

  for (const filename of normalized) {
    const diskPath = join(uploadRoot, filename.replace(/\//g, '\\'));
    const fileStat = await stat(diskPath).catch(() => null);
    if (!fileStat?.isFile()) {
      continue;
    }

    const module = filename.includes('/') ? filename.split('/')[0] : null;
    const originalName = filename.split('/').pop() ?? filename;
    const url = buildPublicUploadUrl(filename);

    await dataSource.query(
      `INSERT INTO media_files
        (filename, original_name, mime_type, size_bytes, module, uploaded_by, entity_type, entity_id, url)
       VALUES ($1, $2, NULL, $3, $4, 'judge-demo-script', 'demo_asset', NULL, $5)
       ON CONFLICT (filename) DO UPDATE SET
         original_name = EXCLUDED.original_name,
         size_bytes = EXCLUDED.size_bytes,
         module = EXCLUDED.module,
         uploaded_by = EXCLUDED.uploaded_by,
         entity_type = EXCLUDED.entity_type,
         url = EXCLUDED.url`,
      [filename, originalName, fileStat.size, module, url],
    );

    inserted.push(filename);
  }

  return inserted;
}
