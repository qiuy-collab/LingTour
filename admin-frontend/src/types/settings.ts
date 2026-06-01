// 系统设置类型定义

export interface ShippingTemplate {
  id: string
  region: string       // 如 "Southeast Asia", "North America"
  countries: string[]  // 国家列表
  rate: number         // 运费金额
  currency: string     // 币种
  freeThreshold: number // 满额免运费（0 表示不免）
}

export interface AppSettings {
  // SEO
  seoTitle: string
  seoDescription: string

  // 语种与地区
  languages: string[]          // 支持语种列表，如 ['en', 'zh']
  defaultLocale?: string       // 默认语言，如 'zh'
  defaultCurrency: string      // 默认币种，如 'SGD'

  // 税率 (百分比)
  taxRate: number

  // 运费模板
  shippingTemplates: ShippingTemplate[]

  // 口译服务城市
  serviceCities: string[]      // 可选城市 slug 列表

  // 后台UI配置
  enableMarkdownEditor: boolean
  pageTitleFontSize: number
  sectionTitleFontSize: number
  bodyFontSize: number
  hintFontSize: number
}

export const DefaultSettings: AppSettings = {
  seoTitle: 'LingTour — Discover Guangdong Through Local Eyes',
  seoDescription: 'Immersive cultural tours, artisan crafts, and local interpreters across Guangdong, China.',
  languages: ['en', 'zh'],
  defaultLocale: 'zh',
  defaultCurrency: 'SGD',
  taxRate: 7.6,
  shippingTemplates: [],
  serviceCities: [],
  enableMarkdownEditor: true,
  pageTitleFontSize: 20,
  sectionTitleFontSize: 15,
  bodyFontSize: 14,
  hintFontSize: 12,
}
