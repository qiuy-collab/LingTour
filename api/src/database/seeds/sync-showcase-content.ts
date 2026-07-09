import { AppDataSource } from '../data-source';
import { DEFAULT_ROUTE_REGIONS } from '../../common/constants/route-regions';
import {
  SHOWCASE_CITIES,
  SHOWCASE_HOME_FEATURED_ROUTE_SLUGS,
  SHOWCASE_HOME_HIGHLIGHTS,
  SHOWCASE_ROUTES,
  type ShowcaseCity,
  type ShowcaseRoute,
} from './showcase-content';

const apply = process.argv.includes('--apply');

const asJson = (value: unknown) => JSON.stringify(value);

async function upsertCity(city: ShowcaseCity) {
  const existing = await AppDataSource.query(
    `SELECT id FROM cities WHERE slug = $1 LIMIT 1`,
    [city.slug],
  );

  if (!apply) {
    return {
      id: existing[0]?.id ?? null,
      action: existing.length ? 'update' : 'create',
    };
  }

  const rows = await AppDataSource.query(
    `INSERT INTO cities (
        slug,
        name,
        region_label,
        hero_image,
        hero_narrative,
        tags,
        editor_intro,
        gallery_images,
        food_title,
        food_description,
        food_images,
        related_city_slugs,
        adcode,
        published,
        deleted_at
      )
      VALUES (
        $1,
        $2::jsonb,
        $3::jsonb,
        $4,
        $5::jsonb,
        $6::jsonb,
        $7::jsonb,
        $8::jsonb,
        $9::jsonb,
        $10::jsonb,
        $11::jsonb,
        $12::jsonb,
        $13,
        $14,
        NULL
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        region_label = EXCLUDED.region_label,
        hero_image = EXCLUDED.hero_image,
        hero_narrative = EXCLUDED.hero_narrative,
        tags = EXCLUDED.tags,
        editor_intro = EXCLUDED.editor_intro,
        gallery_images = EXCLUDED.gallery_images,
        food_title = EXCLUDED.food_title,
        food_description = EXCLUDED.food_description,
        food_images = EXCLUDED.food_images,
        related_city_slugs = EXCLUDED.related_city_slugs,
        adcode = EXCLUDED.adcode,
        published = EXCLUDED.published,
        deleted_at = NULL,
        updated_at = now()
      RETURNING id`,
    [
      city.slug,
      asJson(city.name),
      asJson(city.regionLabel),
      city.heroImage,
      asJson(city.heroNarrative),
      asJson(city.tags),
      asJson(city.editorIntro),
      asJson(city.galleryImages),
      asJson(city.foodTitle),
      asJson(city.foodDescription),
      asJson(city.foodImages),
      asJson(city.relatedCitySlugs),
      city.adcode,
      city.published,
    ],
  );

  const cityId = rows[0].id as string;

  await AppDataSource.query(`DELETE FROM city_culture_sections WHERE city_id = $1`, [
    cityId,
  ]);

  for (const section of city.sections) {
    await AppDataSource.query(
      `INSERT INTO city_culture_sections (
          city_id,
          title,
          body,
          image,
          images,
          stat_label,
          stat_value,
          breath_image,
          breath_quote,
          sort_order
        )
        VALUES (
          $1,
          $2::jsonb,
          $3::jsonb,
          $4,
          $5::jsonb,
          $6::jsonb,
          $7::jsonb,
          $8,
          $9::jsonb,
          $10
        )`,
      [
        cityId,
        asJson(section.title),
        asJson(section.body),
        section.image,
        asJson(section.images ?? []),
        asJson(section.statLabel ?? null),
        asJson(section.statValue ?? null),
        section.breathImage ?? section.image,
        asJson(section.breathQuote ?? null),
        section.sortOrder,
      ],
    );
  }

  return {
    id: cityId,
    action: existing.length ? 'update' : 'create',
  };
}

async function upsertRoute(route: ShowcaseRoute, cityIdBySlug: Map<string, string>) {
  const existing = await AppDataSource.query(
    `SELECT id FROM story_routes WHERE slug = $1 LIMIT 1`,
    [route.slug],
  );

  if (!apply) {
    return {
      id: existing[0]?.id ?? null,
      action: existing.length ? 'update' : 'create',
    };
  }

  const rows = await AppDataSource.query(
    `INSERT INTO story_routes (
        slug,
        title,
        culture_tag,
        city_name,
        duration,
        audience,
        summary,
        story,
        cover_image,
        route_region_key,
        published,
        deleted_at
      )
      VALUES (
        $1,
        $2::jsonb,
        $3,
        $4::jsonb,
        $5::jsonb,
        $6::jsonb,
        $7::jsonb,
        $8::jsonb,
        $9,
        $10,
        $11,
        NULL
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        culture_tag = EXCLUDED.culture_tag,
        city_name = EXCLUDED.city_name,
        duration = EXCLUDED.duration,
        audience = EXCLUDED.audience,
        summary = EXCLUDED.summary,
        story = EXCLUDED.story,
        cover_image = EXCLUDED.cover_image,
        route_region_key = EXCLUDED.route_region_key,
        published = EXCLUDED.published,
        deleted_at = NULL,
        updated_at = now()
      RETURNING id`,
    [
      route.slug,
      asJson(route.title),
      route.cultureTag,
      asJson(route.cityName),
      asJson(route.duration),
      asJson(route.audience),
      asJson(route.summary),
      asJson(route.story),
      route.coverImage,
      route.routeRegionKey,
      route.published,
    ],
  );

  const routeId = rows[0].id as string;

  await AppDataSource.query(`DELETE FROM route_stops WHERE route_id = $1`, [routeId]);
  await AppDataSource.query(`DELETE FROM route_city_links WHERE route_id = $1`, [
    routeId,
  ]);

  for (const [index, citySlug] of route.citySlugs.entries()) {
    const cityId = cityIdBySlug.get(citySlug);
    if (!cityId) continue;
    await AppDataSource.query(
      `INSERT INTO route_city_links (route_id, city_id, sort_order)
       VALUES ($1, $2, $3)
       ON CONFLICT (route_id, city_id) DO UPDATE SET sort_order = EXCLUDED.sort_order`,
      [routeId, cityId, index],
    );
  }

  for (const [index, stop] of route.stops.entries()) {
    await AppDataSource.query(
      `INSERT INTO route_stops (
          route_id,
          sort_order,
          time,
          stop_name,
          story,
          cultural_story,
          details,
          image,
          images,
          lat,
          lng,
          meal,
          hotel,
          transit,
          plan
        )
        VALUES (
          $1,
          $2,
          $3,
          $4::jsonb,
          $5::jsonb,
          $6::jsonb,
          $7::jsonb,
          $8,
          $9::jsonb,
          $10,
          $11,
          $12::jsonb,
          $13::jsonb,
          $14::jsonb,
          $15
        )`,
      [
        routeId,
        index,
        stop.time,
        asJson(stop.stopName),
        asJson(stop.story),
        asJson(stop.culturalStory),
        asJson(stop.details),
        stop.image,
        asJson(stop.images ?? []),
        stop.lat,
        stop.lng,
        asJson(stop.meal ?? null),
        asJson(stop.hotel ?? null),
        asJson(stop.transit ?? null),
        stop.plan ?? null,
      ],
    );
  }

  return {
    id: routeId,
    action: existing.length ? 'update' : 'create',
  };
}

async function syncHomeConfig() {
  const [existing] = await AppDataSource.query(
    `SELECT *
       FROM home_configs
      ORDER BY created_at ASC
      LIMIT 1`,
  );

  const nextHero = existing?.hero ?? {};
  const nextTrustMetrics = existing?.trust_metrics ?? [];
  const nextEntryCards = existing?.entry_cards ?? [];
  const nextTestimonials = existing?.testimonials ?? [];
  const nextRouteRegions =
    Array.isArray(existing?.route_regions) && existing.route_regions.length > 0
      ? existing.route_regions
      : DEFAULT_ROUTE_REGIONS;

  if (!apply) {
    return existing ? 'update' : 'create';
  }

  if (!existing) {
    await AppDataSource.query(
      `INSERT INTO home_configs (
          hero,
          trust_metrics,
          entry_cards,
          culture_highlights,
          testimonials,
          featured_route_slugs,
          route_regions
        )
        VALUES (
          $1::jsonb,
          $2::jsonb,
          $3::jsonb,
          $4::jsonb,
          $5::jsonb,
          $6::jsonb,
          $7::jsonb
        )`,
      [
        asJson(nextHero),
        asJson(nextTrustMetrics),
        asJson(nextEntryCards),
        asJson(SHOWCASE_HOME_HIGHLIGHTS),
        asJson(nextTestimonials),
        asJson(SHOWCASE_HOME_FEATURED_ROUTE_SLUGS),
        asJson(nextRouteRegions),
      ],
    );
    return 'create';
  }

  await AppDataSource.query(
    `UPDATE home_configs
        SET hero = $1::jsonb,
            trust_metrics = $2::jsonb,
            entry_cards = $3::jsonb,
            culture_highlights = $4::jsonb,
            testimonials = $5::jsonb,
            featured_route_slugs = $6::jsonb,
            route_regions = $7::jsonb,
            updated_at = now()
      WHERE id = $8`,
    [
      asJson(nextHero),
      asJson(nextTrustMetrics),
      asJson(nextEntryCards),
      asJson(SHOWCASE_HOME_HIGHLIGHTS),
      asJson(nextTestimonials),
      asJson(SHOWCASE_HOME_FEATURED_ROUTE_SLUGS),
      asJson(nextRouteRegions),
      existing.id,
    ],
  );

  return 'update';
}

async function main() {
  await AppDataSource.initialize();

  const cityIdBySlug = new Map<string, string>();
  const citySummary: string[] = [];
  const routeSummary: string[] = [];

  for (const city of SHOWCASE_CITIES) {
    const result = await upsertCity(city);
    if (result.id) cityIdBySlug.set(city.slug, result.id);
    citySummary.push(`${result.action}:${city.slug}`);
  }

  for (const route of SHOWCASE_ROUTES) {
    const result = await upsertRoute(route, cityIdBySlug);
    routeSummary.push(`${result.action}:${route.slug}`);
  }

  const homeAction = await syncHomeConfig();

  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'dry-run',
        cities: citySummary,
        routes: routeSummary,
        featuredRouteSlugs: SHOWCASE_HOME_FEATURED_ROUTE_SLUGS,
        cultureHighlights: SHOWCASE_HOME_HIGHLIGHTS.map((item) => item.slug),
        homeConfig: homeAction,
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log(
      'Dry run only. Re-run with --apply, then run `npm run media:ingest-external` to localize remote images into /uploads.',
    );
  }
}

main()
  .catch((error) => {
    console.error('Failed to sync showcase content.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
