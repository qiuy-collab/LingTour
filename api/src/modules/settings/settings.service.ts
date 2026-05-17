import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from './entities/app-settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSettings)
    private readonly settingsRepo: Repository<AppSettings>,
  ) {}

  async getPublicSettings() {
    const settings = await this.getOrCreateDefault();
    return settings.payload;
  }

  async getAdminSettings() {
    return this.getOrCreateDefault();
  }

  async updateAdminSettings(payload: Record<string, unknown>) {
    const settings = await this.getOrCreateDefault();
    settings.payload = {
      ...settings.payload,
      ...payload,
    };
    return this.settingsRepo.save(settings);
  }

  private async getOrCreateDefault() {
    let settings = await this.settingsRepo.findOne({
      where: { scope: 'default' },
    });
    if (!settings) {
      settings = this.settingsRepo.create({
        scope: 'default',
        payload: {
          seoTitle: 'LingTour',
          seoDescription: 'LingTour public site settings',
          enableMarkdownEditor: true,
          pageTitleFontSize: 20,
          sectionTitleFontSize: 15,
          bodyFontSize: 14,
          hintFontSize: 12,
        },
      });
      settings = await this.settingsRepo.save(settings);
    }
    return settings;
  }
}

