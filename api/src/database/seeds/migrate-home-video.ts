import { existsSync } from 'fs';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { AppDataSource } from '../data-source';
import { buildPublicUploadUrl } from '../../modules/upload/upload-path';

const HOME_MEDIA = [
  {
    source: 'video/guangzhou-skyline.mp4',
    filename: 'home/guangzhou-skyline.mp4',
    mimeType: 'video/mp4',
  },
  {
    source: 'editorial/guangzhou-river-night.jpg',
    filename: 'home/guangzhou-skyline-poster.jpg',
    mimeType: 'image/jpeg',
  },
] as const;

async function trackFile(
  filename: string,
  originalName: string,
  mimeType: string,
  sizeBytes: number,
) {
  await AppDataSource.query(
    `INSERT INTO media_files
      (filename, original_name, mime_type, size_bytes, module, uploaded_by, entity_type, entity_id, url)
     VALUES ($1, $2, $3, $4, 'home', 'home-video-migration', 'home', NULL, $5)
     ON CONFLICT (filename) DO UPDATE SET
       original_name = EXCLUDED.original_name,
       mime_type = EXCLUDED.mime_type,
       size_bytes = EXCLUDED.size_bytes,
       module = EXCLUDED.module,
       uploaded_by = EXCLUDED.uploaded_by,
       entity_type = EXCLUDED.entity_type,
       url = EXCLUDED.url`,
    [
      filename,
      originalName,
      mimeType,
      sizeBytes,
      buildPublicUploadUrl(filename),
    ],
  );
}

async function main() {
  const apply = process.argv.includes('--apply');
  const uploadRoot = resolve(
    process.cwd(),
    process.env.UPLOAD_DIR ?? './uploads',
  );
  const sitePublicRoot = resolve(
    process.cwd(),
    process.env.SITE_PUBLIC_DIR ?? '../site/public',
  );

  await AppDataSource.initialize();

  try {
    if (apply) {
      for (const media of HOME_MEDIA) {
        const sourcePath = join(sitePublicRoot, ...media.source.split('/'));
        const targetPath = join(uploadRoot, ...media.filename.split('/'));
        const bytes = await readFile(sourcePath);
        await mkdir(dirname(targetPath), { recursive: true });
        if (!existsSync(targetPath)) {
          await writeFile(targetPath, bytes);
        }
        const fileStat = await stat(targetPath);
        await trackFile(
          media.filename,
          media.source.split('/').pop() ?? media.filename,
          media.mimeType,
          fileStat.size,
        );
      }
    }

    const rows = await AppDataSource.query(
      `SELECT id, hero FROM home_configs ORDER BY created_at ASC LIMIT 1`,
    );
    if (!rows.length) {
      throw new Error('Home configuration does not exist');
    }

    const hero =
      rows[0].hero && typeof rows[0].hero === 'object' ? rows[0].hero : {};
    const currentVideo =
      hero.video && typeof hero.video === 'object' ? hero.video : {};
    const nextHero = {
      ...hero,
      video: {
        ...currentVideo,
        url: buildPublicUploadUrl(HOME_MEDIA[0].filename),
        poster: buildPublicUploadUrl(HOME_MEDIA[1].filename),
        title: currentVideo.title ?? {
          en: 'Guangzhou after dusk',
          zh: '入夜后的广州',
        },
        description: currentVideo.description ?? {
          en: 'A short skyline study from the Pearl River edge.',
          zh: '从珠江岸边观看广州天际线的短片。',
        },
        duration: currentVideo.duration || '12 sec',
        resolution: currentVideo.resolution || '1600 × 900',
      },
    };

    if (apply) {
      await AppDataSource.query(
        `UPDATE home_configs SET hero = $1::jsonb, updated_at = now() WHERE id = $2`,
        [JSON.stringify(nextHero), rows[0].id],
      );
    }

    console.log(
      JSON.stringify(
        {
          mode: apply ? 'apply' : 'dry-run',
          video: nextHero.video.url,
          poster: nextHero.video.poster,
          files: HOME_MEDIA.length,
        },
        null,
        2,
      ),
    );
  } finally {
    await AppDataSource.destroy();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
