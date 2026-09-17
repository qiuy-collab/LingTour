import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { HomeConfig } from './entities/home-config.entity';
import { UpdateHomeConfigDto } from './dto/update-home-config.dto';
import { DEFAULT_ROUTE_REGIONS } from '../../common/constants/route-regions';

@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);

  constructor(
    @InjectRepository(HomeConfig)
    private readonly homeConfigRepo: Repository<HomeConfig>,
  ) {}

  async getPublicHome() {
    // P3-14: the public GET must never write. Read-only lookup with an
    // in-memory default; a missing row is created by the admin write path.
    return this.readConfig();
  }

  async getAdminHomeConfig() {
    // Admin read also stays read-only; the row is created on first save.
    return this.readConfig();
  }

  async updateAdminHomeConfig(dto: UpdateHomeConfigDto) {
    const config = await this.getOrCreateConfigForWrite();
    Object.assign(config, {
      ...dto,
      routeRegions:
        dto.routeRegions !== undefined
          ? this.normalizeRouteRegions(dto.routeRegions)
          : config.routeRegions,
    });
    return this.homeConfigRepo.save(config as HomeConfig);
  }

  private buildDefaultConfig(): HomeConfig {
    return {
      hero: {},
      trustMetrics: [],
      entryCards: [],
      cultureHighlights: [],
      testimonials: [],
      featuredRouteSlugs: [],
      routeRegions: DEFAULT_ROUTE_REGIONS as unknown as Array<
        Record<string, unknown>
      >,
    } as unknown as HomeConfig;
  }

  /**
   * Read-only config lookup (P3-14): no INSERT, no normalization writes.
   * Falls back to an in-memory default when no row exists yet.
   */
  private async readConfig(): Promise<HomeConfig> {
    try {
      const [existingConfig] = await this.homeConfigRepo.find({
        order: { createdAt: 'ASC' },
        take: 1,
      });
      const config = existingConfig ?? this.buildDefaultConfig();
      config.routeRegions = this.normalizeRouteRegions(config.routeRegions);
      return config;
    } catch (error) {
      this.logger.error(
        'Failed to read home config; serving in-memory defaults',
        error instanceof Error ? error.stack : String(error),
      );
      return this.buildDefaultConfig();
    }
  }

  /** Write-path lookup: creates the row when the admin saves for the first time. */
  private async getOrCreateConfigForWrite(): Promise<HomeConfig> {
    const [existingConfig] = await this.homeConfigRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });
    if (existingConfig) return existingConfig;
    return this.homeConfigRepo.save(
      this.homeConfigRepo.create(this.buildDefaultConfig() as DeepPartial<HomeConfig>),
    );
  }

  private normalizeRouteRegions(value: unknown) {
    if (!Array.isArray(value) || value.length === 0) {
      return DEFAULT_ROUTE_REGIONS;
    }

    const normalized = value
      .map((item: any, index) => {
        if (!item || typeof item !== 'object' || Array.isArray(item))
          return null;

        const key = typeof item.key === 'string' ? item.key.trim() : '';
        const title = typeof item.title === 'string' ? item.title.trim() : '';
        const note = typeof item.note === 'string' ? item.note.trim() : '';
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

}
