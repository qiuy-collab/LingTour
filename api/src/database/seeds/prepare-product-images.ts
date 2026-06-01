import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { mkdir, stat, writeFile } from 'fs/promises';
import { dirname, extname, join } from 'path';
import { AppDataSource } from '../data-source';
import {
  buildPublicUploadUrl,
  buildStoredUploadPath,
  normalizeStoredRelativePath,
  sanitizeUploadModule,
} from '../../modules/upload/upload-path';

type ProductImagePlan = {
  slug: string;
  image?: string;
  gallery?: string[];
};

type Context = {
  apply: boolean;
  uploadRoot: string;
  downloads: number;
  reused: number;
  cache: Map<string, string>;
};

const PRODUCT_IMAGE_PLANS: ProductImagePlan[] = [
  {
    slug: 'volcanic-soil-bowl',
    image:
      'https://images.pexels.com/photos/18253121/pexels-photo-18253121.jpeg',
    gallery: [
      'https://images.pexels.com/photos/20362428/pexels-photo-20362428.jpeg',
      'https://images.pexels.com/photos/14380628/pexels-photo-14380628.jpeg',
      'https://images.pexels.com/photos/18659843/pexels-photo-18659843.jpeg',
    ],
  },
  {
    slug: 'canton-porcelain-cup',
    image:
      'https://images.pexels.com/photos/33489600/pexels-photo-33489600.jpeg',
    gallery: [
      'https://images.pexels.com/photos/10780753/pexels-photo-10780753.jpeg',
      'https://images.pexels.com/photos/11048257/pexels-photo-11048257.jpeg',
      'https://images.pexels.com/photos/36463150/pexels-photo-36463150.jpeg',
    ],
  },
];

function isRemoteUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
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
     VALUES ($1, $2, $3, $4, $5, 'product-image-prep', 'store_product', NULL, $6)
     ON CONFLICT (filename) DO UPDATE SET
       original_name = EXCLUDED.original_name,
       mime_type = EXCLUDED.mime_type,
       size_bytes = EXCLUDED.size_bytes,
       module = EXCLUDED.module,
       uploaded_by = EXCLUDED.uploaded_by,
       entity_type = EXCLUDED.entity_type,
       url = EXCLUDED.url`,
    [filename, originalName, mimeType, sizeBytes, module, buildPublicUploadUrl(filename)],
  );
}

async function trackExistingUpload(uploadUrl: string, module: string) {
  const filename = normalizeStoredRelativePath(uploadUrl.replace(/^\/uploads\//, ''));
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

async function importImage(url: string, module: string, hint: string, context: Context) {
  const safeModule = sanitizeUploadModule(module);
  if (!safeModule) {
    throw new Error(`Unsupported upload module: ${module}`);
  }

  if (!isRemoteUrl(url)) {
    return trackExistingUpload(url, safeModule);
  }

  const cacheKey = `${safeModule}|${url}`;
  const cached = context.cache.get(cacheKey);
  if (cached) {
    context.reused += 1;
    return buildPublicUploadUrl(cached);
  }

  const hash = createHash('sha1').update(url).digest('hex').slice(0, 12);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  const extension = inferExtension(url, contentType);
  const baseName = `${slugify(hint)}-${hash}${extension}`;
  const storedPath = buildStoredUploadPath(baseName, safeModule);
  const absolutePath = join(context.uploadRoot, ...storedPath.split('/'));
  const bytes = Buffer.from(await response.arrayBuffer());

  if (context.apply) {
    await mkdir(dirname(absolutePath), { recursive: true });
    if (!existsSync(absolutePath)) {
      await writeFile(absolutePath, bytes);
      context.downloads += 1;
    }

    const fileStat = await stat(absolutePath);
    await ensureMediaTracked(
      storedPath,
      safeModule,
      fileStat.size,
      contentType,
      baseName,
    );
  }

  context.cache.set(cacheKey, storedPath);
  return buildPublicUploadUrl(storedPath);
}

async function resolveImageSet(
  slug: string,
  plan: ProductImagePlan,
  currentImage: string,
  currentGallery: string[],
  context: Context,
) {
  const imageSource = plan.image ?? currentImage;
  const gallerySources = plan.gallery?.length ? plan.gallery : currentGallery;
  const nextImage = await importImage(imageSource, 'shop', `${slug}-cover`, context);

  const resolvedGallery: string[] = [];
  for (let index = 0; index < gallerySources.length; index += 1) {
    const resolved = await importImage(
      gallerySources[index],
      'shop',
      `${slug}-gallery-${index + 1}`,
      context,
    );
    if (!resolvedGallery.includes(resolved)) {
      resolvedGallery.push(resolved);
    }
  }

  return {
    nextImage,
    nextGallery: resolvedGallery.filter((entry) => entry !== nextImage),
  };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const uploadRoot = join(process.cwd(), process.env.UPLOAD_DIR ?? './uploads');
  const context: Context = {
    apply,
    uploadRoot,
    downloads: 0,
    reused: 0,
    cache: new Map(),
  };

  await AppDataSource.initialize();

  try {
    for (const plan of PRODUCT_IMAGE_PLANS) {
      const rows = (await AppDataSource.query(
        `SELECT id, slug, image, gallery
           FROM store_products
          WHERE slug = $1
            AND deleted_at IS NULL
          LIMIT 1`,
        [plan.slug],
      )) as Array<{
        id: string;
        slug: string;
        image: string;
        gallery: string[] | null;
      }>;

      const product = rows[0];
      if (!product) {
        console.warn(`[skip] Product not found: ${plan.slug}`);
        continue;
      }

      const currentGallery = Array.isArray(product.gallery) ? product.gallery : [];
      const { nextImage, nextGallery } = await resolveImageSet(
        product.slug,
        plan,
        product.image,
        currentGallery,
        context,
      );

      console.log(`\n[product] ${product.slug}`);
      console.log(`  image   -> ${nextImage}`);
      console.log(`  gallery -> ${JSON.stringify(nextGallery)}`);

      if (apply) {
        await AppDataSource.query(
          `UPDATE store_products
              SET image = $1,
                  gallery = $2::jsonb,
                  updated_at = now()
            WHERE id = $3`,
          [nextImage, JSON.stringify(nextGallery), product.id],
        );
      }
    }

    console.log(`\napply=${apply} downloads=${context.downloads} reused=${context.reused}`);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
