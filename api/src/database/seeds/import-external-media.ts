import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const STATIC_FALLBACK_UPLOADS: Record<string, string> = {
  'https://images.unsplash.com/photo-1594910413523-d2391693c004?auto=format&fit=crop&w=1200&q=82':
    '/uploads/shop/volcanic-soil-bowl-gallery-1-f2c4ab6f052f.jpg',
};

function isRemoteUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

function isSiteMediaPath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\/(?:editorial|video)\/[A-Za-z0-9._/-]+$/i.test(value.trim())
  );
}

function shouldImport(value: unknown): value is string {
  return isRemoteUrl(value) || isSiteMediaPath(value);
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'asset'
  );
}

function inferExtension(url: string, contentType: string | null): string {
  const loweredType = (contentType ?? '').toLowerCase();
  if (loweredType.includes('png')) return '.png';
  if (loweredType.includes('webp')) return '.webp';
  if (loweredType.includes('gif')) return '.gif';
  if (loweredType.includes('svg')) return '.svg';
  if (loweredType.includes('avif')) return '.avif';
  if (loweredType.includes('jpeg') || loweredType.includes('jpg'))
    return '.jpg';

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

function buildDownloadCandidates(url: string): string[] {
  const candidates = [url];
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === 'upload.wikimedia.org' ||
      parsed.hostname === 'commons.wikimedia.org'
    ) {
      const source = `${parsed.host}${parsed.pathname}${parsed.search}`;
      candidates.push(
        `https://wsrv.nl/?url=${encodeURIComponent(source)}&w=2200&output=jpg`,
      );
    }
  } catch {
    // The original URL will produce the actionable error below.
  }
  return candidates;
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
    [
      filename,
      originalName,
      mimeType,
      sizeBytes,
      module,
      buildPublicUploadUrl(filename),
    ],
  );
}

async function trackExistingUpload(uploadUrl: string, module: string) {
  const filename = normalizeStoredRelativePath(
    uploadUrl.replace(/^\/uploads\//, ''),
  );
  const absolutePath = join(
    process.cwd(),
    process.env.UPLOAD_DIR ?? './uploads',
    ...filename.split('/'),
  );
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
    let response: Response | null = null;

    download: for (const candidate of buildDownloadCandidates(url)) {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        response = await fetch(candidate, {
          headers: {
            Accept: 'image/*,*/*;q=0.8',
            'User-Agent': 'LingTour media importer/1.0',
          },
        });

        if (response.ok) {
          break download;
        }

        const shouldRetry =
          response.status === 429 ||
          response.status >= 500 ||
          response.status === 403;
        if (!shouldRetry) break;
        if (attempt < 3) await sleep((attempt + 1) * 1500);
      }
    }

    if (!response || !response.ok) {
      throw new Error(
        `Failed to download ${url}: ${response?.status ?? 'no response'} ${response?.statusText ?? ''}`,
      );
    }

    contentType = response.headers.get('content-type');
    extension = inferExtension(url, contentType);
    bytes = Buffer.from(await response.arrayBuffer());
  }

  const storedPath = buildStoredUploadPath(
    `${baseName}${extension}`,
    safeModule,
  );
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

async function importSiteMedia(
  sourcePath: string,
  module: string,
  hint: string,
  context: ImportContext,
) {
  const safeModule = sanitizeUploadModule(module);
  if (!safeModule) {
    throw new Error(`Unsupported upload module: ${module}`);
  }

  const normalizedSource = sourcePath.replace(/^\//, '');
  const cacheKey = `${safeModule}|site:${normalizedSource}`;
  const cached = context.cache.get(cacheKey);
  if (cached) {
    context.reused += 1;
    return buildPublicUploadUrl(cached);
  }

  const extension = extname(normalizedSource).toLowerCase() || '.jpg';
  const hash = createHash('sha1')
    .update(normalizedSource)
    .digest('hex')
    .slice(0, 12);
  const storedPath = buildStoredUploadPath(
    `${slugify(hint)}-${hash}${extension}`,
    safeModule,
  );

  if (context.apply) {
    const sitePublicRoot = resolve(
      process.cwd(),
      process.env.SITE_PUBLIC_DIR ?? '../site/public',
    );
    const absoluteSource = resolve(sitePublicRoot, normalizedSource);
    const relativeSource = absoluteSource.slice(sitePublicRoot.length);
    if (!relativeSource || relativeSource.startsWith('..')) {
      throw new Error(`Invalid site media path: ${sourcePath}`);
    }

    const bytes = await readFile(absoluteSource);
    const absoluteTarget = join(context.uploadRoot, ...storedPath.split('/'));
    await mkdir(dirname(absoluteTarget), { recursive: true });
    if (!existsSync(absoluteTarget)) {
      await writeFile(absoluteTarget, bytes);
      context.downloads += 1;
    }

    const fileStat = await stat(absoluteTarget);
    await ensureMediaTracked(
      storedPath,
      safeModule,
      fileStat.size,
      null,
      normalizedSource.split('/').pop() ?? storedPath,
    );
  }

  context.cache.set(cacheKey, storedPath);
  return buildPublicUploadUrl(storedPath);
}

function importMediaReference(
  value: string,
  module: string,
  hint: string,
  context: ImportContext,
) {
  return isRemoteUrl(value)
    ? importRemoteImage(value, module, hint, context)
    : importSiteMedia(value, module, hint, context);
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
    if (shouldImport(value)) {
      nextValues.push(
        await importMediaReference(
          value,
          module,
          `${hintPrefix}-${index + 1}`,
          context,
        ),
      );
      changed = true;
    } else {
      nextValues.push(value);
    }
  }

  return { changed, nextValues };
}

async function processCities(context: ImportContext) {
  const rows = await AppDataSource.query(
    `SELECT id, slug, hero_image, gallery_images, food_images
       FROM cities
      WHERE deleted_at IS NULL`,
  );

  let updated = 0;

  for (const row of rows) {
    let changed = false;
    let nextHero = row.hero_image;
    let nextGallery = row.gallery_images;
    let nextFood = row.food_images;

    if (shouldImport(row.hero_image)) {
      nextHero = await importMediaReference(
        row.hero_image,
        'cities',
        `${row.slug}-hero`,
        context,
      );
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
        [
          nextHero,
          JSON.stringify(nextGallery),
          JSON.stringify(nextFood),
          row.id,
        ],
      );
    }
  }

  return updated;
}

async function processCitySections(context: ImportContext) {
  const rows = await AppDataSource.query(
    `SELECT s.id, c.slug AS city_slug, s.sort_order, s.image, s.images, s.breath_image
       FROM city_culture_sections s
       JOIN cities c ON c.id = s.city_id`,
  );

  let updated = 0;

  for (const row of rows) {
    let changed = false;
    let nextImage = row.image;
    let nextImages = row.images;
    let nextBreathImage = row.breath_image;
    const hintBase = `${row.city_slug}-section-${row.sort_order + 1}`;

    if (shouldImport(row.image)) {
      nextImage = await importMediaReference(
        row.image,
        'cities',
        `${hintBase}-image`,
        context,
      );
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

    if (shouldImport(row.breath_image)) {
      nextBreathImage = await importMediaReference(
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
  const rows = await AppDataSource.query(
    `SELECT id, slug, cover_image FROM story_routes WHERE deleted_at IS NULL`,
  );

  let updated = 0;

  for (const row of rows) {
    if (!shouldImport(row.cover_image)) {
      continue;
    }

    updated += 1;
    const nextCover = await importMediaReference(
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
  const rows = await AppDataSource.query(
    `SELECT s.id, r.slug AS route_slug, s.sort_order, s.image, s.images
       FROM route_stops s
       JOIN story_routes r ON r.id = s.route_id`,
  );

  let updated = 0;

  for (const row of rows) {
    let changed = false;
    let nextImage = row.image;
    let nextImages = row.images;
    const hintBase = `${row.route_slug}-stop-${row.sort_order + 1}`;

    if (shouldImport(row.image)) {
      nextImage = await importMediaReference(
        row.image,
        'routes',
        `${hintBase}-image`,
        context,
      );
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
  const rows = await AppDataSource.query(
    `SELECT id, slug, image FROM store_collections`,
  );

  let updated = 0;

  for (const row of rows) {
    if (!shouldImport(row.image)) {
      continue;
    }

    updated += 1;
    const nextImage = await importMediaReference(
      row.image,
      'shop',
      `${row.slug}-cover`,
      context,
    );

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
  const rows = await AppDataSource.query(
    `SELECT id, slug, image, gallery
       FROM store_products
      WHERE deleted_at IS NULL`,
  );

  let updated = 0;

  for (const row of rows) {
    let changed = false;
    let nextImage = row.image;
    let nextGallery = row.gallery;

    if (shouldImport(row.image)) {
      nextImage = await importMediaReference(
        row.image,
        'shop',
        `${row.slug}-main`,
        context,
      );
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
  const rows = await AppDataSource.query(`SELECT id, slug, image FROM events`);

  let updated = 0;

  for (const row of rows) {
    if (!shouldImport(row.image)) {
      continue;
    }

    updated += 1;
    const nextImage = await importMediaReference(
      row.image,
      'events',
      `${row.slug}-cover`,
      context,
    );

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
  const uploadRoot = resolve(
    process.cwd(),
    process.env.UPLOAD_DIR ?? './uploads',
  );

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
