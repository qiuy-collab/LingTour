import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import {
  collectReferencedMediaFilenames,
  syncMediaLibraryRecords,
} from './media-library';

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const KEEP_LIMITS = {
  cities: 2,
  routes: 2,
  products: 2,
  communityPosts: 2,
  events: 2,
  briefs: 2,
  serviceModes: 2,
  profiles: 2,
  faqs: 3,
};

const TEST_PATTERNS = [
  /\btest\b/i,
  /\bdemo\b/i,
  /\be2e\b/i,
  /\bsample\b/i,
  /\bmock\b/i,
  /\bfake\b/i,
  /\btmp\b/i,
];

const DEMO_ADMIN_EMAIL = 'admin@lingtour.cn';
const DEMO_EDITOR_EMAIL = 'editor@lingtour.cn';
const DEMO_ADMIN_PASSWORD =
  process.env.DEMO_ADMIN_PASSWORD ??
  process.env.SEED_ADMIN_PASSWORD ??
  'LingTour2026!';
const DEMO_EDITOR_PASSWORD =
  process.env.DEMO_EDITOR_PASSWORD ??
  process.env.SEED_EDITOR_PASSWORD ??
  'LingTour2026!';

type CountRow = { count: number };
type CityRow = { id: string; slug: string; name: unknown };
type RouteRow = { id: string; slug: string; title: unknown };
type ProductRow = {
  id: string;
  slug: string;
  name: unknown;
  collection_id: string | null;
};
type EventRow = { id: string; slug: string; title: unknown };
type CommunityPostRow = { id: string; title: unknown; excerpt: unknown };
type CommunityBriefRow = {
  id: string;
  slug: string;
  title: unknown;
  prompt: unknown;
};
type RouteSlugRow = { slug: string };
type CityNameRow = { slug: string; name: unknown };
type ServiceModeRow = { id: string; title: unknown; best_for: unknown };
type InterpreterProfileRow = { id: string; name: unknown; focus: unknown };
type InterpretingFaqRow = { id: string; question: unknown; answer: unknown };
type HomeConfigRow = { id: string };

function looksLikeTest(value: string) {
  return TEST_PATTERNS.some((pattern) => pattern.test(value));
}

function asDisplayText(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value))
    return value.map((entry) => asDisplayText(entry)).join(' ');
  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    return [objectValue.en, objectValue.zh, ...Object.values(objectValue)]
      .map((entry) => asDisplayText(entry))
      .join(' ');
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return value.toString();
  }
  if (typeof value === 'symbol') {
    return value.description ?? '';
  }
  return '';
}

async function countRows(dataSource: DataSource, table: string) {
  const rows: CountRow[] = await dataSource.query(
    `SELECT COUNT(*)::int AS count FROM ${table}`,
  );
  return rows[0]?.count ?? 0;
}

async function deleteSoftDeletedRows(dataSource: DataSource) {
  const softDeleteTables = [
    'cities',
    'story_routes',
    'store_products',
    'community_posts',
  ];
  for (const table of softDeleteTables) {
    await dataSource.query(`DELETE FROM ${table} WHERE deleted_at IS NOT NULL`);
  }
}

async function trimCities(dataSource: DataSource) {
  const rows: CityRow[] = await dataSource.query(
    `SELECT id, slug, name, published, created_at
     FROM cities
     WHERE deleted_at IS NULL
     ORDER BY published DESC, created_at DESC`,
  );

  const keep = rows
    .filter((row) => !looksLikeTest(`${row.slug} ${asDisplayText(row.name)}`))
    .slice(0, KEEP_LIMITS.cities)
    .map((row) => row.id);

  if (!keep.length) return keep;

  await dataSource.query(
    `DELETE FROM city_culture_sections WHERE city_id <> ALL($1::uuid[])`,
    [keep],
  );
  await dataSource.query(
    `DELETE FROM route_city_links WHERE city_id <> ALL($1::uuid[])`,
    [keep],
  );
  await dataSource.query(`DELETE FROM cities WHERE id <> ALL($1::uuid[])`, [
    keep,
  ]);
  return keep;
}

async function trimRoutes(dataSource: DataSource) {
  const rows: RouteRow[] = await dataSource.query(
    `SELECT id, slug, title, published, created_at
     FROM story_routes
     WHERE deleted_at IS NULL
     ORDER BY published DESC, created_at DESC`,
  );

  const keep = rows
    .filter((row) => !looksLikeTest(`${row.slug} ${asDisplayText(row.title)}`))
    .slice(0, KEEP_LIMITS.routes)
    .map((row) => row.id);

  if (!keep.length) return keep;

  await dataSource.query(
    `DELETE FROM route_stops WHERE route_id <> ALL($1::uuid[])`,
    [keep],
  );
  await dataSource.query(
    `DELETE FROM route_city_links WHERE route_id <> ALL($1::uuid[])`,
    [keep],
  );
  await dataSource.query(
    `DELETE FROM story_routes WHERE id <> ALL($1::uuid[])`,
    [keep],
  );
  return keep;
}

async function trimProductsAndCollections(dataSource: DataSource) {
  const rows: ProductRow[] = await dataSource.query(
    `SELECT id, slug, name, collection_id, published, created_at
     FROM store_products
     WHERE deleted_at IS NULL
     ORDER BY published DESC, created_at DESC`,
  );

  const keepProducts = rows
    .filter((row) => !looksLikeTest(`${row.slug} ${asDisplayText(row.name)}`))
    .slice(0, KEEP_LIMITS.products);

  const keepProductIds = keepProducts.map((row) => row.id);
  const keepCollectionIds = [
    ...new Set(keepProducts.map((row) => row.collection_id).filter(Boolean)),
  ];

  if (keepProductIds.length) {
    await dataSource.query(
      `DELETE FROM store_products WHERE id <> ALL($1::uuid[])`,
      [keepProductIds],
    );
  }

  if (keepCollectionIds.length) {
    await dataSource.query(
      `DELETE FROM store_collections WHERE id <> ALL($1::uuid[])`,
      [keepCollectionIds],
    );
  }

  return { keepProductIds, keepCollectionIds };
}

async function trimEvents(dataSource: DataSource) {
  const rows: EventRow[] = await dataSource.query(
    `SELECT id, slug, title, status, created_at
     FROM events
     ORDER BY (CASE WHEN status = 'published' THEN 0 ELSE 1 END), created_at DESC`,
  );

  const keep = rows
    .filter((row) => !looksLikeTest(`${row.slug} ${asDisplayText(row.title)}`))
    .slice(0, KEEP_LIMITS.events)
    .map((row) => row.id);

  if (keep.length) {
    await dataSource.query(`DELETE FROM events WHERE id <> ALL($1::uuid[])`, [
      keep,
    ]);
  }
}

async function trimCommunity(dataSource: DataSource) {
  const rows: CommunityPostRow[] = await dataSource.query(
    `SELECT id, title, excerpt, status, created_at
     FROM community_posts
     WHERE deleted_at IS NULL
     ORDER BY (CASE WHEN status = 'published' THEN 0 ELSE 1 END), created_at DESC`,
  );

  const preferred = rows.filter(
    (row) =>
      !looksLikeTest(
        `${asDisplayText(row.title)} ${asDisplayText(row.excerpt)}`,
      ),
  );
  const keepSource =
    preferred.length >= KEEP_LIMITS.communityPosts
      ? preferred
      : rows.slice(0, KEEP_LIMITS.communityPosts);
  const keep = keepSource.map((row) => row.id);

  if (keep.length) {
    await dataSource.query(
      `DELETE FROM community_posts WHERE id <> ALL($1::uuid[])`,
      [keep],
    );
    await normalizeCommunityPosts(dataSource, keep);
  }

  const briefRows: CommunityBriefRow[] = await dataSource.query(
    `SELECT id, slug, title, prompt, active, sort_order
     FROM community_briefs
     ORDER BY active DESC, sort_order ASC, created_at DESC`,
  );

  const keepBriefs = briefRows
    .filter(
      (row) =>
        !looksLikeTest(
          `${row.slug} ${asDisplayText(row.title)} ${asDisplayText(row.prompt)}`,
        ),
    )
    .slice(0, KEEP_LIMITS.briefs)
    .map((row) => row.id);

  if (keepBriefs.length) {
    await dataSource.query(
      `DELETE FROM community_briefs WHERE id <> ALL($1::uuid[])`,
      [keepBriefs],
    );
  }
}

async function normalizeCommunityPosts(
  dataSource: DataSource,
  keepIds: string[],
) {
  if (!keepIds.length) return;

  const routeRows: RouteSlugRow[] = await dataSource.query(
    `SELECT slug FROM story_routes WHERE deleted_at IS NULL ORDER BY published DESC, created_at DESC`,
  );
  const cityRows: CityNameRow[] = await dataSource.query(
    `SELECT slug, name FROM cities WHERE deleted_at IS NULL ORDER BY published DESC, created_at DESC`,
  );

  const demos = [
    {
      title: {
        en: 'Morning Notes from Guangzhou Arcade Streets',
        zh: 'Morning Notes from Guangzhou Arcade Streets',
      },
      excerpt: {
        en: 'A short field note about breakfast steam, shaded arcades, and the river rhythm that holds Guangzhou together.',
        zh: 'A short field note about breakfast steam, shaded arcades, and the river rhythm that holds Guangzhou together.',
      },
      tags: ['Lingnan', 'Arcade walk'],
      location: asDisplayText(cityRows[0]?.name) || 'Guangzhou',
      route: routeRows[0]?.slug ?? '',
      mood: 'Curious',
      featured: true,
    },
    {
      title: {
        en: 'Sunset Impressions from the Southern Coast',
        zh: 'Sunset Impressions from the Southern Coast',
      },
      excerpt: {
        en: 'A calm post about fishing harbour light, volcanic shore air, and the slower table culture of Zhanjiang.',
        zh: 'A calm post about fishing harbour light, volcanic shore air, and the slower table culture of Zhanjiang.',
      },
      tags: ['Coastal', 'Field note'],
      location:
        asDisplayText(cityRows[1]?.name) ||
        asDisplayText(cityRows[0]?.name) ||
        'Zhanjiang',
      route: routeRows[1]?.slug ?? routeRows[0]?.slug ?? '',
      mood: 'Calm',
      featured: false,
    },
  ];

  for (const [index, postId] of keepIds.entries()) {
    const demo = demos[index] ?? demos[demos.length - 1];
    await dataSource.query(
      `UPDATE community_posts
       SET status = 'published',
           title = $2::jsonb,
           excerpt = $3::jsonb,
           tags = $4::jsonb,
           location = $5,
           route = $6,
           mood = $7,
           featured = $8,
           image = COALESCE(NULLIF(image, ''), NULL),
           reviewed_at = NOW(),
           reviewed_by = NULL,
           rejection_reason = NULL,
           updated_at = NOW()
       WHERE id = $1::uuid`,
      [
        postId,
        JSON.stringify(demo.title),
        JSON.stringify(demo.excerpt),
        JSON.stringify(demo.tags),
        demo.location,
        demo.route,
        demo.mood,
        demo.featured,
      ],
    );
  }
}

async function trimInterpreting(dataSource: DataSource) {
  const modeRows: ServiceModeRow[] = await dataSource.query(
    `SELECT id, title, best_for, sort_order
     FROM interpreting_service_modes
     ORDER BY sort_order ASC, created_at DESC`,
  );
  const keepModes = modeRows
    .filter(
      (row) =>
        !looksLikeTest(
          `${asDisplayText(row.title)} ${asDisplayText(row.best_for)}`,
        ),
    )
    .slice(0, KEEP_LIMITS.serviceModes)
    .map((row) => row.id);
  if (keepModes.length) {
    await dataSource.query(
      `DELETE FROM interpreting_service_modes WHERE id <> ALL($1::uuid[])`,
      [keepModes],
    );
  }

  const profileRows: InterpreterProfileRow[] = await dataSource.query(
    `SELECT id, name, focus, status, sort_order
     FROM interpreter_profiles
     ORDER BY (CASE WHEN status = 'active' THEN 0 ELSE 1 END), sort_order ASC, created_at DESC`,
  );
  const keepProfiles = profileRows
    .filter(
      (row) =>
        !looksLikeTest(
          `${asDisplayText(row.name)} ${asDisplayText(row.focus)}`,
        ),
    )
    .slice(0, KEEP_LIMITS.profiles)
    .map((row) => row.id);
  if (keepProfiles.length) {
    await dataSource.query(
      `DELETE FROM interpreter_profiles WHERE id <> ALL($1::uuid[])`,
      [keepProfiles],
    );
  }

  const faqRows: InterpretingFaqRow[] = await dataSource.query(
    `SELECT id, question, answer, sort_order
     FROM interpreting_faqs
     ORDER BY sort_order ASC, created_at DESC`,
  );
  const keepFaqs = faqRows
    .filter(
      (row) =>
        !looksLikeTest(
          `${asDisplayText(row.question)} ${asDisplayText(row.answer)}`,
        ),
    )
    .slice(0, KEEP_LIMITS.faqs)
    .map((row) => row.id);
  if (keepFaqs.length) {
    await dataSource.query(
      `DELETE FROM interpreting_faqs WHERE id <> ALL($1::uuid[])`,
      [keepFaqs],
    );
  }
}

async function trimSupportingTables(dataSource: DataSource) {
  await dataSource.query(`DELETE FROM frontend_featured`);

  const homeConfigRows: HomeConfigRow[] = await dataSource.query(
    `SELECT id FROM home_configs ORDER BY created_at DESC`,
  );
  const keepHomeConfigId = homeConfigRows[0]?.id;
  if (keepHomeConfigId) {
    await dataSource.query(`DELETE FROM home_configs WHERE id <> $1`, [
      keepHomeConfigId,
    ]);
  }
}

async function ensureDemoAccounts(dataSource: DataSource) {
  const adminHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 12);
  const editorHash = await bcrypt.hash(DEMO_EDITOR_PASSWORD, 12);

  await dataSource.query(
    `INSERT INTO users (email, password_hash, role, name, status)
     VALUES ($1, $2, 'admin', 'LingTour Admin', 'active')
     ON CONFLICT (email)
     DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role,
       name = EXCLUDED.name,
       status = EXCLUDED.status`,
    [DEMO_ADMIN_EMAIL, adminHash],
  );

  await dataSource.query(
    `INSERT INTO users (email, password_hash, role, name, status)
     VALUES ($1, $2, 'editor', 'LingTour Editor', 'active')
     ON CONFLICT (email)
     DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role,
       name = EXCLUDED.name,
       status = EXCLUDED.status`,
    [DEMO_EDITOR_EMAIL, editorHash],
  );
}

async function prepareJudgeDemo(apply: boolean) {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? process.env.DB_NAME ?? 'postgres',
    synchronize: false,
  });

  await dataSource.initialize();
  const uploadRoot = path.join(
    process.cwd(),
    process.env.UPLOAD_DIR ?? './uploads',
  );

  const beforeCounts = await Promise.all([
    countRows(dataSource, 'cities'),
    countRows(dataSource, 'story_routes'),
    countRows(dataSource, 'store_products'),
    countRows(dataSource, 'community_posts'),
    countRows(dataSource, 'media_files'),
  ]);

  console.log('[judge-demo] current counts', {
    cities: beforeCounts[0],
    routes: beforeCounts[1],
    products: beforeCounts[2],
    communityPosts: beforeCounts[3],
    mediaFiles: beforeCounts[4],
  });

  if (!apply) {
    const referencedMedia = await collectReferencedMediaFilenames(dataSource);
    console.log('[judge-demo] dry-run referenced media', referencedMedia);
    await dataSource.destroy();
    return;
  }

  await deleteSoftDeletedRows(dataSource);
  await trimCities(dataSource);
  await trimRoutes(dataSource);
  await trimProductsAndCollections(dataSource);
  await trimEvents(dataSource);
  await trimCommunity(dataSource);
  await trimInterpreting(dataSource);
  await trimSupportingTables(dataSource);
  await ensureDemoAccounts(dataSource);

  const referencedMedia = await collectReferencedMediaFilenames(dataSource);
  const syncedMedia = await syncMediaLibraryRecords(
    dataSource,
    referencedMedia,
    uploadRoot,
  );

  const afterCounts = await Promise.all([
    countRows(dataSource, 'cities'),
    countRows(dataSource, 'story_routes'),
    countRows(dataSource, 'store_products'),
    countRows(dataSource, 'community_posts'),
    countRows(dataSource, 'media_files'),
  ]);

  console.log('[judge-demo] final counts', {
    cities: afterCounts[0],
    routes: afterCounts[1],
    products: afterCounts[2],
    communityPosts: afterCounts[3],
    mediaFiles: afterCounts[4],
  });
  console.log('[judge-demo] synced media files', syncedMedia);
  console.log('[judge-demo] demo admin login', {
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
  });

  await dataSource.destroy();
}

prepareJudgeDemo(process.argv.includes('--apply')).catch((error) => {
  console.error('[judge-demo] failed', error);
  process.exit(1);
});
