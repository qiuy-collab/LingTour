import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Data-fix migration: detect and repair garbled / mojibake route_regions.
 *
 * The original migration (1737225000000) used string interpolation to embed
 * the JSON payload directly into the SQL template literal.  If the database
 * connection charset was not UTF-8 at execution time, the Chinese characters
 * could be corrupted ("mojibake").
 *
 * This migration:
 *  1. Reads each home_configs row's route_regions as text.
 *  2. Checks for common mojibake byte patterns (UTF-8 misread as Latin-1).
 *  3. If garbled, replaces the entire route_regions column with the canonical
 *     DEFAULT_ROUTE_REGIONS value using a parameterized query.
 */

const DEFAULT_ROUTE_REGIONS = JSON.stringify([
  {
    key: 'bay-area-core',
    title: { zh: '湾区核心', en: 'Bay Area Core' },
    note: { zh: '广州 / 深圳 / 佛山 / 珠海 / 中山等', en: 'Guangzhou / Shenzhen / Foshan / Zhuhai and beyond' },
    adcodes: [440100, 440300, 440400, 440600, 440700, 441200, 441300, 441900, 442000],
  },
  {
    key: 'chaoshan-coast',
    title: { zh: '潮汕海岸', en: 'Chaoshan Coast' },
    note: { zh: '汕头 / 潮州 / 揭阳 / 汕尾', en: 'Shantou / Chaozhou / Jieyang / Shanwei' },
    adcodes: [440500, 441500, 445100, 445200],
  },
  {
    key: 'hakka-mountains',
    title: { zh: '客家山地', en: 'Hakka Mountains' },
    note: { zh: '梅州 / 河源', en: 'Meizhou / Heyuan' },
    adcodes: [441400, 441600],
  },
  {
    key: 'southern-sea',
    title: { zh: '南境海宴', en: 'Southern Sea' },
    note: { zh: '湛江 / 茂名 / 阳江 / 云浮', en: 'Zhanjiang / Maoming / Yangjiang / Yunfu' },
    adcodes: [440800, 440900, 441700, 445300],
  },
  {
    key: 'northern-gateway',
    title: { zh: '北部门户', en: 'Northern Gateway' },
    note: { zh: '韶关 / 清远', en: 'Shaoguan / Qingyuan' },
    adcodes: [440200, 441800],
  },
]);

export class FixRouteRegionsEncoding1740600000000 implements MigrationInterface {
  name = 'FixRouteRegionsEncoding1740600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Step 1: Detect garbled rows ──────────────────────────────────────
    //
    // When UTF-8 Chinese text passes through a Latin-1 codec, it produces
    // "mojibake" — e.g. "湾区" becomes "Ã¦¹¾Å".  The canonical symptom is
    // the appearance of Â or Ã (UTF-8 lead bytes rendered as Latin-1 chars)
    // and/or the Unicode replacement character U+FFFD (ï¿½).
    //
    // We also check for rows where the title.zh field is missing expected
    // CJK characters entirely (empty or ASCII-only), which catches cases
    // where the data was mangled beyond simple mojibake.

    const garbledRows: { id: number }[] = await queryRunner.query(
      `SELECT id FROM home_configs
        WHERE route_regions::text LIKE '%Ã%'
           OR route_regions::text LIKE '%Â%'
           OR route_regions::text LIKE '%ï¿½%'
           OR route_regions::text LIKE '%�%'`,
    );

    // Additionally, check for rows that lack any expected CJK character
    // in their route_regions — a healthy row must contain Chinese chars
    // like 湾, 潮, 客, 南, 北 (from the region titles).
    const noCjkRows: { id: number }[] = await queryRunner.query(
      `SELECT id FROM home_configs
        WHERE jsonb_array_length(route_regions) > 0
          AND NOT (
            route_regions::text LIKE '%湾%'
            OR route_regions::text LIKE '%潮%'
            OR route_regions::text LIKE '%客%'
            OR route_regions::text LIKE '%南%'
            OR route_regions::text LIKE '%北%'
          )`,
    );

    const garbledIds = new Set<number>([
      ...garbledRows.map((r: { id: number }) => r.id),
      ...noCjkRows.map((r: { id: number }) => r.id),
    ]);

    if (garbledIds.size === 0) {
      // No garbled data found — nothing to fix.
      return;
    }

    // ── Step 2: Overwrite garbled rows with canonical default ────────────
    //
    // Uses a parameterized query to guarantee the JSON payload is sent
    // through the wire as proper UTF-8, regardless of the connection
    // charset setting.
    const ids = Array.from(garbledIds);
    await queryRunner.query(
      `UPDATE home_configs
          SET route_regions = $1::jsonb
        WHERE id = ANY($2::int[])`,
      [DEFAULT_ROUTE_REGIONS, ids],
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // This is a data-only fix; there is nothing structural to revert.
    // The original garbled bytes are intentionally lost.
  }
}
