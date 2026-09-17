import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from './entities/app-settings.entity';

/**
 * Field allow-lists (report P2-D). The settings payload used to be stored
 * and served verbatim: anyone with admin write access could stash secrets
 * in it and `GET /public/settings` would hand them to the whole internet.
 * The public endpoint now projects a fixed set of non-sensitive fields,
 * and the write path drops unknown keys instead of merging them in.
 */
const PUBLIC_SETTINGS_KEYS = [
  'seoTitle',
  'seoDescription',
  'defaultCurrency',
  'taxRate',
  'shippingTemplates',
  'serviceCities',
  'languages',
  'defaultLocale',
] as const;

const ADMIN_SETTINGS_KEYS = [
  ...PUBLIC_SETTINGS_KEYS.filter((k) => k !== 'languages' && k !== 'defaultLocale'),
  'enableMarkdownEditor',
  'pageTitleFontSize',
  'sectionTitleFontSize',
  'bodyFontSize',
  'hintFontSize',
  // P2-7: base handling fee for shop orders in minor units. The 6% variable
  // component stays fixed in code; this only makes the floor configurable.
  'handlingFeeCents',
] as const;

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSettings)
    private readonly settingsRepo: Repository<AppSettings>,
  ) {}

  async getPublicSettings() {
    const settings = await this.getOrCreateDefault();
    const payload = settings.payload ?? {};
    const projected: Record<string, unknown> = {};
    for (const key of PUBLIC_SETTINGS_KEYS) {
      if (key in payload) {
        projected[key] = payload[key];
      }
    }
    return projected;
  }

  async getAdminSettings() {
    return this.getOrCreateDefault();
  }

  async updateAdminSettings(payload: Record<string, unknown>) {
    const settings = await this.getOrCreateDefault();
    const next: Record<string, unknown> = { ...(settings.payload ?? {}) };
    for (const key of ADMIN_SETTINGS_KEYS) {
      if (key in payload) {
        next[key] = payload[key];
      }
    }
    next.languages = ['en'];
    next.defaultLocale = 'en';
    settings.payload = next;
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
          seoTitle: 'Culvoy',
          seoDescription: 'Culvoy public site settings',
          languages: ['en'],
          defaultLocale: 'en',
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
