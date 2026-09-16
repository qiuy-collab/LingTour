import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Collapse the legacy bilingual JSON values to the single English content
 * contract. JSONB is intentionally retained for existing column compatibility;
 * scalar content fields now contain JSON strings and content arrays contain
 * JSON string values. Non-content JSONB such as accounts and shipping data is
 * left untouched.
 */
export class EnglishOnlyContent1762300000000 implements MigrationInterface {
  name = 'EnglishOnlyContent1762300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION lingtour_english_content(value jsonb)
      RETURNS jsonb
      LANGUAGE sql
      IMMUTABLE
      AS $$
        SELECT CASE
          WHEN value IS NULL THEN NULL::jsonb
          WHEN jsonb_typeof(value) = 'object'
            AND jsonb_typeof(value->'en') = 'string' THEN value->'en'
          WHEN jsonb_typeof(value) = 'object'
            AND jsonb_typeof(value->'EN') = 'string' THEN value->'EN'
          WHEN jsonb_typeof(value) = 'object' THEN COALESCE(
            (
              SELECT jsonb_object_agg(key, lingtour_english_content(item))
              FROM jsonb_each(value) AS entries(key, item)
              WHERE key NOT IN ('zh', 'ZH')
            ),
            '{}'::jsonb
          )
          WHEN jsonb_typeof(value) = 'array' THEN COALESCE(
            (
              SELECT jsonb_agg(lingtour_english_content(item))
              FROM jsonb_array_elements(value) AS entries(item)
            ),
            '[]'::jsonb
          )
          ELSE value
        END
      $$;
    `);

    const contentColumns = [
      ['cities', 'name'],
      ['cities', 'region_label'],
      ['cities', 'hero_narrative'],
      ['cities', 'tags'],
      ['cities', 'editor_intro'],
      ['cities', 'food_title'],
      ['cities', 'food_description'],
      ['cities', 'hero_media'],
      ['cities', 'gallery_media'],
      ['city_culture_sections', 'title'],
      ['city_culture_sections', 'body'],
      ['city_culture_sections', 'stat_label'],
      ['city_culture_sections', 'stat_value'],
      ['city_culture_sections', 'breath_quote'],
      ['city_culture_sections', 'primary_media'],
      ['city_culture_sections', 'media'],
      ['story_routes', 'title'],
      ['story_routes', 'city_name'],
      ['story_routes', 'duration'],
      ['story_routes', 'audience'],
      ['story_routes', 'summary'],
      ['story_routes', 'story'],
      ['route_stops', 'stop_name'],
      ['route_stops', 'story'],
      ['route_stops', 'cultural_story'],
      ['route_stops', 'details'],
      ['route_stops', 'meal'],
      ['route_stops', 'hotel'],
      ['route_stops', 'transit'],
      ['route_stops', 'primary_media'],
      ['route_stops', 'media'],
      ['store_collections', 'title'],
      ['store_collections', 'body'],
      ['store_products', 'name'],
      ['store_products', 'tag'],
      ['store_products', 'story'],
      ['store_products', 'material'],
      ['store_products', 'dimensions'],
      ['store_products', 'origin'],
      ['store_products', 'care'],
      ['store_products', 'origin_trace'],
      ['store_products', 'primary_media'],
      ['store_products', 'gallery_media'],
      ['events', 'title'],
      ['events', 'summary'],
      ['events', 'description'],
      ['community_posts', 'title'],
      ['community_posts', 'excerpt'],
      ['community_briefs', 'title'],
      ['community_briefs', 'prompt'],
      ['interpreting_service_modes', 'title'],
      ['interpreting_service_modes', 'price'],
      ['interpreting_service_modes', 'best_for'],
      ['interpreting_service_modes', 'body'],
      ['interpreting_service_modes', 'includes'],
      ['interpreter_profiles', 'name'],
      ['interpreter_profiles', 'language'],
      ['interpreter_profiles', 'focus'],
      ['interpreter_profiles', 'helps'],
      ['interpreter_profiles', 'bio'],
      ['interpreting_faqs', 'question'],
      ['interpreting_faqs', 'answer'],
      ['home_configs', 'hero'],
      ['home_configs', 'trust_metrics'],
      ['home_configs', 'entry_cards'],
      ['home_configs', 'culture_highlights'],
      ['home_configs', 'testimonials'],
      ['home_configs', 'route_regions'],
    ] as const;

    for (const [table, column] of contentColumns) {
      await queryRunner.query(
        `UPDATE "${table}" SET "${column}" = lingtour_english_content("${column}") WHERE "${column}" IS NOT NULL`,
      );
    }

    await queryRunner.query('DROP FUNCTION lingtour_english_content(jsonb)');
  }

  public async down(): Promise<void> {
    // The discarded Chinese values cannot be reconstructed safely.
  }
}
