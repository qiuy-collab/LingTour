import { DataSource } from 'typeorm';
import { normalizeStoredRelativePath } from '../../modules/upload/upload-path';

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
    const rows = await dataSource.query(query);
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
