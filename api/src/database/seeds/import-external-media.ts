import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { mkdir, stat, writeFile } from 'fs/promises';
import { dirname, extname, join, resolve } from 'path';
import { AppDataSource } from '../data-source';
import {
  buildPublicUploadUrl,
  buildStoredUploadPath,
  normalizeStoredRelativePath,
  sanitizeUploadModule,
} from '../../modules/upload/upload-path';

type JsonArray = string[] | null | undefined;

type ImportContext = {
  apply: boolean;
  uploadRoot: string;
  cache: Map<string, string>;
  downloads: number;
  reused: number;
};

const STATIC_FALLBACK_UPLOADS: Record<string, string> = {
  'https://images.unsplash.com/photo-1594910413523-d2391693c004?auto=format&fit=crop&w=1200&q=82':
    '/uploads/shop/volcanic-soil-bowl-gallery-1-f2c4ab6f052f.jpg',
};

function isRemoteUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'asset';
}

function inferExtension(url: string, contentType: string | null): string {
  const loweredType = (contentType ?? '').toLowerCase();
  if (loweredType.includes('png')) return '.png';
  if (loweredType.includes('webp')) return '.webp';
  if (loweredType.includes('gif')) return '.gif';
  if (loweredType.includes('svg')) return '.svg';
  if (loweredType.includes('avif')) return '.avif';
  if (loweredType.includes('jpeg') || loweredType.includes('jpg')) return '.jpg';

  try {
    const pathname = new URL(url).pathname;
    const ext = extname(pathname);
    if (ext && ext.length <= 5) {
      return ext.toLowerCase();
    }
  } catch {
    // Fall back to jpg below.
  }

  return '.jpg';
}

async function ensureMediaTracked(
  filename: string,
  module: string,
  sizeBytes: number,
  mimeType: string | null,
  originalName: string,
) {
  await AppDataSource.query(
    `INSERT INTO media_files
      (filename, original_name, mime_type, size_bytes, module, uploaded_by, entity_type, entity_id, url)
     VALUES ($1, $2, $3, $4, $5, 'external-media-import', 'external_asset', NULL, $6)
     ON CONFLICT (filename) DO UPDATE SET
       original_name = EXCLUDED.original_name,
       mime_type = EXCLUDED.mime_type,
       size_bytes = EXCLUDED.size_bytes,
       module = EXCLUDED.module,
       uploaded_by = EXCLUDED.uploaded_by,
       entity_type = EXCLUDED.entity_type,
       entity_id = EXCLUDED.entity_id,
       url = EXCLUDED.url`,
    [filename, originalName, mimeType, sizeBytes, module, buildPublicUploadUrl(filename)],
  );
}

async function trackExistingUpload(uploadUrl: string, module: string) {
  const filename = normalizeStoredRelativePath(uploadUrl.replace(/^\/uploads\//, ''));
  const absolutePath = join(process.cwd(), process.env.UPLOAD_DIR ?? './uploads', ...filename.split('/'));
  const fileStat = await stat(absolutePath);
  const originalName = filename.split('/').pop() ?? filename;

  await ensureMediaTracked(filename, module, fileStat.size, null, originalName);
  return buildPublicUploadUrl(filename);
}

async function importRemoteImage(
  url: string,
  module: string,
  hint: string,
  context: ImportContext,
) {
  const safeModule = sanitizeUploadModule(module);
  if (!safeModule) {
    throw new Error(`Unsupported upload module: ${module}`);
  }

  const cacheKey = `${safeModule}|${url}`;
  const cached = context.cache.get(cacheKey);
  if (cached) {
    context.reused += 1;
    return buildPublicUploadUrl(cached);
  }

  const staticFallback = STATIC_FALLBACK_UPLOADS[url];
  if (staticFallback) {
    const fallbackUrl = buildPublicUploadUrl(
      normalizeStoredRelativePath(staticFallback.replace(/^\/uploads\//, '')),
    );
    if (context.apply) {
      await trackExistingUpload(fallbackUrl, safeModule);
    }
    context.cache.set(
      cacheKey,
      normalizeStoredRelativePath(fallbackUrl.replace(/^\/uploads\//, '')),
    );
    context.reused += 1;
    return fallbackUrl;
  }

  const hash = createHash('sha1').update(url).digest('hex').slice(0, 12);

  let contentType: string | null = null;
  let bytes: Buffer | null = null;
  let extension = '.jpg';

  const baseName = `${slugify(hint)}-${hash}`;

  if (context.apply) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
    }

    contentType = response.headers.get('content-type');
    extension = inferExtension(url, contentType);
    bytes = Buffer.from(await response.arrayBuffer());
  }

  const storedPath = buildStoredUploadPath(`${baseName}${extension}`, safeModule);
  const absolutePath = join(context.uploadRoot, ...storedPath.split('/'));
  const originalName = `${baseName}${extension}`;

  if (context.apply) {
    await mkdir(dirname(absolutePath), { recursive: true });

    if (!existsSync(absolutePath) && bytes) {
      await writeFile(absolutePath, bytes);
      context.downloads += 1;
    }

    const fileStat = await stat(absolutePath);
    await ensureMediaTracked(
      storedPath,
      safeModule,
      fileStat.size,
      contentType,
      originalName,
    );
  }

  context.cache.set(cacheKey, storedPath);
  return buildPublicUploadUrl(storedPath);
}

async function convertImageArray(
  values: JsonArray,
  module: string,
  hintPrefix: string,
  context: ImportContext,
) {
  const source = Array.isArray(values) ? values : [];
  let changed = false;
  const nextValues: string[] = [];

  for (let index = 0; index < source.length; index += 1) {
    const value = source[index];
    if (isRemoteUrl(value)) {
      nextValues.push(
        await importRemoteImage(value, module, `${hintPrefix}-${index + 1}`, context),
      );
      changed = true;
    } else {
      nextValues.push(value);
    }
  }

  return { changed, nextValues };
}

async function processCities(context: ImportContext) {
  const rows = (await AppDataSource.query(
    `SELECT id, slug, hero_image, gallery_images, food_images
       FROM cities
      WHERE deleted_at IS NULL`,
  )) as Array<{
    id: string;
    slug: string;
    hero_image: string;
    gallery_images: string[];
    food_images: string[];
  }>;

  let updated = 0;

  for (const row of rows) {
    let changed = false;
    let nextHero = row.hero_image;
    let nextGallery = row.gallery_images;
    let nextFood = row.food_images;

    if (isRemoteUrl(row.hero_image)) {
      nextHero = await importRemoteImage(row.hero_image, 'cities', `${row.slug}-hero`, context);
      changed = true;
    }

    const galleryResult = await convertImageArray(
      row.gallery_images,
      'cities',
      `${row.slug}-gallery`,
      context,
    );
    if (galleryResult.changed) {
      nextGallery = galleryResult.nextValues;
      changed = true;
    }

    const foodResult = await convertImageArray(
      row.food_images,
      'cities',
      `${row.slug}-food`,
      context,
    );
    if (foodResult.changed) {
      nextFood = foodResult.nextValues;
      changed = true;
    }

    if (!changed) {
      continue;
    }

    updated += 1;
    if (context.apply) {
      await AppDataSource.query(
        `UPDATE cities
            SET hero_image = $1,
                gallery_images = $2::jsonb,
                food_images = $3::jsonb,
                updated_at = now()
          WHERE id = $4`,
        [nextHero, JSON.stringify(nextGallery), JSON.stringify(nextFood), row.id],
      );
    }
  }

  return updated;
}

async function processCitySections(context: ImportContext) {
  const rows = (await AppDataSource.query(
    `SELECT s.id, c.slug AS city_slug, s.sort_order, s.image, s.images, s.breath_image
       FROM city_culture_sections s
       JOIN cities c ON c.id = s.city_id`,
  )) as Array<{
    id: string;
    city_slug: string;
    sort_order: number;
    image: string;
    images: string[];
    breath_image: string | null;
  }>;

  let updated = 0;

  for (const row of rows) {
    let changed = false;
    let nextImage = row.image;
    let nextImages = row.images;
    let nextBreathImage = row.breath_image;
    const hintBase = `${row.city_slug}-section-${row.sort_order + 1}`;

    if (isRemoteUrl(row.image)) {
      nextImage = await importRemoteImage(row.image, 'cities', `${hintBase}-image`, context);
      changed = true;
    }

    const imagesResult = await convertImageArray(
      row.images,
      'cities',
      `${hintBase}-gallery`,
      context,
    );
    if (imagesResult.changed) {
      nextImages = imagesResult.nextValues;
      changed = true;
    }

    if (isRemoteUrl(row.breath_image)) {
      nextBreathImage = await importRemoteImage(
        row.breath_image,
        'cities',
        `${hintBase}-breath`,
        context,
      );
      changed = true;
    }

    if (!changed) {
      continue;
    }

    updated += 1;
    if (context.apply) {
      await AppDataSource.query(
        `UPDATE city_culture_sections
            SET image = $1,
                images = $2::jsonb,
                breath_image = $3,
                updated_at = now()
          WHERE id = $4`,
        [nextImage, JSON.stringify(nextImages ?? []), nextBreathImage, row.id],
      );
    }
  }

  return updated;
}

async function processStoryRoutes(context: ImportContext) {
  const rows = (await AppDataSource.query(
    `SELECT id, slug, cover_image FROM story_routes WHERE deleted_at IS NULL`,
  )) as Array<{ id: string; slug: string; cover_image: string }>;

  let updated = 0;

  for (const row of rows) {
    if (!isRemoteUrl(row.cover_image)) {
      continue;
    }

    updated += 1;
    const nextCover = await importRemoteImage(
      row.cover_image,
      'routes',
      `${row.slug}-cover`,
      context,
    );

    if (context.apply) {
      await AppDataSource.query(
        `UPDATE story_routes
            SET cover_image = $1,
                updated_at = now()
          WHERE id = $2`,
        [nextCover, row.id],
      );
    }
  }

  return updated;
}

async function processRouteStops(context: ImportContext) {
  const rows = (await AppDataSource.query(
    `SELECT s.id, r.slug AS route_slug, s.sort_order, s.image, s.images
       FROM route_stops s
       JOIN story_routes r ON r.id = s.route_id`,
  )) as Array<{
    id: string;
    route_slug: string;
    sort_order: number;
    image: string;
    images: string[];
  }>;

  let updated = 0;

  for (const row of rows) {
    let changed = false;
    let nextImage = row.image;
    let nextImages = row.images;
    const hintBase = `${row.route_slug}-stop-${row.sort_order + 1}`;

    if (isRemoteUrl(row.image)) {
      nextImage = await importRemoteImage(row.image, 'routes', `${hintBase}-image`, context);
      changed = true;
    }

    const imagesResult = await convertImageArray(
      row.images,
      'routes',
      `${hintBase}-gallery`,
      context,
    );
    if (imagesResult.changed) {
      nextImages = imagesResult.nextValues;
      changed = true;
    }

    if (!changed) {
      continue;
    }

    updated += 1;
    if (context.apply) {
      await AppDataSource.query(
        `UPDATE route_stops
            SET image = $1,
                images = $2::jsonb
          WHERE id = $3`,
        [nextImage, JSON.stringify(nextImages ?? []), row.id],
      );
    }
  }

  return updated;
}

async function processStoreCollections(context: ImportContext) {
  const rows = (await AppDataSource.query(
    `SELECT id, slug, image FROM store_collections`,
  )) as Array<{ id: string; slug: string; image: string }>;

  let updated = 0;

  for (const row of rows) {
    if (!isRemoteUrl(row.image)) {
      continue;
    }

    updated += 1;
    const nextImage = await importRemoteImage(row.image, 'shop', `${row.slug}-cover`, context);

    if (context.apply) {
      await AppDataSource.query(
        `UPDATE store_collections
            SET image = $1,
                updated_at = now()
          WHERE id = $2`,
        [nextImage, row.id],
      );
    }
  }

  return updated;
}

async function processStoreProducts(context: ImportContext) {
  const rows = (await AppDataSource.query(
    `SELECT id, slug, image, gallery
       FROM store_products
      WHERE deleted_at IS NULL`,
  )) as Array<{
    id: string;
    slug: string;
    image: string;
    gallery: string[];
  }>;

  let updated = 0;

  for (const row of rows) {
    let changed = false;
    let nextImage = row.image;
    let nextGallery = row.gallery;

    if (isRemoteUrl(row.image)) {
      nextImage = await importRemoteImage(row.image, 'shop', `${row.slug}-main`, context);
      changed = true;
    }

    const galleryResult = await convertImageArray(
      row.gallery,
      'shop',
      `${row.slug}-gallery`,
      context,
    );
    if (galleryResult.changed) {
      nextGallery = galleryResult.nextValues;
      changed = true;
    }

    if (!changed) {
      continue;
    }

    updated += 1;
    if (context.apply) {
      await AppDataSource.query(
        `UPDATE store_products
            SET image = $1,
                gallery = $2::jsonb,
                updated_at = now()
          WHERE id = $3`,
        [nextImage, JSON.stringify(nextGallery ?? []), row.id],
      );
    }
  }

  return updated;
}

async function processEvents(context: ImportContext) {
  const rows = (await AppDataSource.query(
    `SELECT id, slug, image FROM events`,
  )) as Array<{ id: string; slug: string; image: string | null }>;

  let updated = 0;

  for (const row of rows) {
    if (!isRemoteUrl(row.image)) {
      continue;
    }

    updated += 1;
    const nextImage = await importRemoteImage(row.image, 'events', `${row.slug}-cover`, context);

    if (context.apply) {
      await AppDataSource.query(
        `UPDATE events
            SET image = $1,
                updated_at = now()
          WHERE id = $2`,
        [nextImage, row.id],
      );
    }
  }

  return updated;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const uploadRoot = resolve(process.cwd(), process.env.UPLOAD_DIR ?? './uploads');

  await AppDataSource.initialize();

  try {
    const context: ImportContext = {
      apply,
      uploadRoot,
      cache: new Map(),
      downloads: 0,
      reused: 0,
    };

    const summary = {
      cities: await processCities(context),
      citySections: await processCitySections(context),
      storyRoutes: await processStoryRoutes(context),
      routeStops: await processRouteStops(context),
      storeCollections: await processStoreCollections(context),
      storeProducts: await processStoreProducts(context),
      events: await processEvents(context),
      downloads: context.downloads,
      reused: context.reused,
      trackedFiles: context.cache.size,
      mode: apply ? 'apply' : 'dry-run',
    };

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await AppDataSource.destroy();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
