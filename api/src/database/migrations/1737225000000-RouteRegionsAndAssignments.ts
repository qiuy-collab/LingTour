import { MigrationInterface, QueryRunner } from 'typeorm';

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

export class RouteRegionsAndAssignments1737225000000 implements MigrationInterface {
  name = 'RouteRegionsAndAssignments1737225000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE story_routes
      ADD COLUMN IF NOT EXISTS route_region_key VARCHAR(80)
    `);

    await queryRunner.query(`
      ALTER TABLE home_configs
      ADD COLUMN IF NOT EXISTS route_regions JSONB NOT NULL DEFAULT '[]'::jsonb
    `);

    await queryRunner.query(
      `UPDATE home_configs
       SET route_regions = $1::jsonb
       WHERE route_regions IS NULL
          OR route_regions = '[]'::jsonb`,
      [DEFAULT_ROUTE_REGIONS],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE home_configs
      DROP COLUMN IF EXISTS route_regions
    `);

    await queryRunner.query(`
      ALTER TABLE story_routes
      DROP COLUMN IF EXISTS route_region_key
    `);
  }
}
