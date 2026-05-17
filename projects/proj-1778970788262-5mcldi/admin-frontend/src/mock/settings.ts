// 系统设置 Mock 数据
import type { AppSettings } from '@/types/settings'

export const mockSettings: AppSettings = {
  seoTitle: 'LingTour — Discover Guangdong Through Local Eyes',
  seoDescription: 'Immersive cultural tours, artisan crafts, and local interpreters across Guangdong, China.',
  languages: ['en', 'zh'],
  defaultCurrency: 'SGD',
  taxRate: 7.6,
  shippingTemplates: [
    {
      id: 'ship-001',
      region: 'Southeast Asia',
      countries: ['Singapore', 'Malaysia', 'Thailand', 'Vietnam', 'Indonesia', 'Philippines'],
      rate: 8.5,
      currency: 'SGD',
      freeThreshold: 80,
    },
    {
      id: 'ship-002',
      region: 'East Asia',
      countries: ['Japan', 'South Korea', 'Taiwan', 'Hong Kong'],
      rate: 12.0,
      currency: 'SGD',
      freeThreshold: 120,
    },
    {
      id: 'ship-003',
      region: 'North America',
      countries: ['United States', 'Canada'],
      rate: 22.0,
      currency: 'SGD',
      freeThreshold: 200,
    },
    {
      id: 'ship-004',
      region: 'Europe',
      countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
      rate: 25.0,
      currency: 'SGD',
      freeThreshold: 250,
    },
    {
      id: 'ship-005',
      region: 'Oceania',
      countries: ['Australia', 'New Zealand'],
      rate: 20.0,
      currency: 'SGD',
      freeThreshold: 180,
    },
  ],
  serviceCities: ['guangzhou', 'zhanjiang', 'chaozhou', 'meizhou', 'foshan'],
  enableMarkdownEditor: true,
  pageTitleFontSize: 20,
  sectionTitleFontSize: 15,
  bodyFontSize: 14,
  hintFontSize: 12,
}
