import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeConfig } from './entities/home-config.entity';
import { UpdateHomeConfigDto } from './dto/update-home-config.dto';

const DEFAULT_ROUTE_REGIONS = [
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
];

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(HomeConfig)
    private readonly homeConfigRepo: Repository<HomeConfig>,
  ) {}

  async getPublicHome() {
    const config = await this.getOrCreateConfig();
    return config;
  }

  async getAdminHomeConfig() {
    return this.getOrCreateConfig();
  }

  async updateAdminHomeConfig(dto: UpdateHomeConfigDto) {
    const config = await this.getOrCreateConfig();
    Object.assign(config, {
      ...dto,
      routeRegions:
        dto.routeRegions !== undefined
          ? this.normalizeRouteRegions(dto.routeRegions)
          : config.routeRegions,
    });
    return this.homeConfigRepo.save(config);
  }

  private async getOrCreateConfig() {
    try {
      const [existingConfig] = await this.homeConfigRepo.find({
        order: { createdAt: 'ASC' },
        take: 1,
      });

      let config = existingConfig;
      if (!config) {
        config = this.homeConfigRepo.create({
          hero: {},
          trustMetrics: [],
          entryCards: [],
          cultureHighlights: [],
          testimonials: [],
          featuredRouteSlugs: [],
          featuredProductSlugs: [],
          featuredCitySlugs: [],
          routeRegions: DEFAULT_ROUTE_REGIONS,
        });
        config = await this.homeConfigRepo.save(config);
      }
      const normalizedRouteRegions = this.normalizeRouteRegions(config.routeRegions);
      if (
        !Array.isArray(config.routeRegions) ||
        config.routeRegions.length === 0 ||
        JSON.stringify(normalizedRouteRegions) !== JSON.stringify(config.routeRegions)
      ) {
        config.routeRegions = normalizedRouteRegions;
        config = await this.homeConfigRepo.save(config);
      }
      return config;
    } catch (error) {
      console.error('Error in getOrCreateConfig:', error);
      // Return a default object if DB fails or table doesn't exist yet
      return {
        hero: {},
        trustMetrics: [],
        entryCards: [],
        cultureHighlights: [],
        testimonials: [],
        featuredRouteSlugs: [],
        featuredProductSlugs: [],
        featuredCitySlugs: [],
        routeRegions: DEFAULT_ROUTE_REGIONS,
      };
    }
  }

  private normalizeRouteRegions(value: unknown) {
    if (!Array.isArray(value) || value.length === 0) {
      return DEFAULT_ROUTE_REGIONS;
    }

    const normalized = value
      .map((item: any, index) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return null;

        const key = typeof item.key === 'string' ? item.key.trim() : '';
        const title = this.normalizeI18nObject(item.title);
        const note = this.normalizeI18nObject(item.note);
        const adcodes = Array.isArray(item.adcodes)
          ? item.adcodes
              .map((adcode: unknown) => Number(adcode))
              .filter((adcode: number) => Number.isFinite(adcode))
          : [];

        if (!key) return null;

        return {
          key,
          title,
          note,
          adcodes,
          sortOrder: index,
        };
      })
      .filter(Boolean);

    return normalized.length
      ? normalized.map(({ sortOrder: _sortOrder, ...item }: any) => item)
      : DEFAULT_ROUTE_REGIONS;
  }

  private normalizeI18nObject(value: any) {
    if (!value || typeof value !== 'object') {
      return { en: '', zh: '' };
    }

    return {
      en: typeof value.en === 'string' ? value.en.trim() : '',
      zh: typeof value.zh === 'string' ? value.zh.trim() : '',
    };
  }
}
