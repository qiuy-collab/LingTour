import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeConfig } from './entities/home-config.entity';
import { UpdateHomeConfigDto } from './dto/update-home-config.dto';

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
    Object.assign(config, dto);
    return this.homeConfigRepo.save(config);
  }

  private async getOrCreateConfig() {
    try {
      let config = await this.homeConfigRepo.findOne({
        order: { createdAt: 'ASC' },
      });
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
        });
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
      };
    }
  }
}

