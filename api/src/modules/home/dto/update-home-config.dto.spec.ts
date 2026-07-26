import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { UpdateHomeConfigDto } from './update-home-config.dto';

/**
 * Regression guard for the silent home-config wipe.
 *
 * The global pipe in main.ts runs with enableImplicitConversion. Under that
 * option class-transformer coerces the elements of an untyped object array to
 * [], so `PUT /admin/home` used to persist [[],[],[]] over real content and
 * report 200. Each free-form array below therefore needs @Type(() => Object).
 */
describe('UpdateHomeConfigDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });
  const meta = {
    type: 'body' as const,
    metatype: UpdateHomeConfigDto,
    data: '',
  };

  const sections = [
    'trustMetrics',
    'entryCards',
    'cultureHighlights',
    'testimonials',
  ] as const;

  it.each(sections)('keeps %s entries intact through the global pipe', async (key) => {
    const entry = {
      slug: 'guangzhou',
      title: { en: 'Guangzhou', zh: '广州' },
      body: { en: 'Pearl River city', zh: '珠江之城' },
    };

    const result = (await pipe.transform({ [key]: [entry] }, meta)) as Record<
      string,
      unknown
    >;

    expect(result[key]).toEqual([entry]);
  });

  it('preserves every section in a single round-trip payload', async () => {
    const payload = {
      hero: { headline: { en: 'A', zh: '甲' } },
      trustMetrics: [{ value: '5', label: { en: 'cities', zh: '城市' } }],
      entryCards: [{ key: 'routes', label: { en: 'Routes', zh: '路线' } }],
      cultureHighlights: [{ slug: 'chaozhou', title: { en: 'Chaozhou', zh: '潮州' } }],
      testimonials: [{ quote: { en: 'Great', zh: '很好' }, author: 'A. Traveler' }],
      featuredRouteSlugs: ['southern-sea-table'],
    };

    const result = await pipe.transform(payload, meta);

    expect(result).toEqual(payload);
  });

  it('normalizes routeRegions into typed instances rather than dropping them', async () => {
    const result = (await pipe.transform(
      {
        routeRegions: [
          {
            key: 'bay-area-core',
            title: { en: 'Bay Area Core', zh: '大湾区核心' },
            note: { en: 'Guangzhou and beyond', zh: '广州及周边' },
            adcodes: [440100],
          },
        ],
      },
      meta,
    )) as { routeRegions: Array<Record<string, unknown>> };

    expect(result.routeRegions).toHaveLength(1);
    expect(result.routeRegions[0].key).toBe('bay-area-core');
    expect(result.routeRegions[0].adcodes).toEqual([440100]);
  });
});
