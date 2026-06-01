/**
 * Guangdong region configuration for the admin frontend.
 *
 * DEFAULT_ROUTE_REGIONS is the single source of truth, imported from
 * the shared JSON at /shared/route-regions.json. The Site and API
 * also import from this same file, ensuring all three stay in sync.
 *
 * The rest of the exports (city adcode list, route tags, helpers)
 * are admin-specific UI utilities.
 */

import regionsData from '../../../shared/route-regions.json'

export interface GuangdongAdcodeOption {
  adcode: number
  zh: string
  en: string
}

export interface RouteRegionConfig {
  key: string
  title: { zh: string; en: string }
  note: { zh: string; en: string }
  adcodes: number[]
}

export interface RouteTagOption {
  value: string
  zh: string
  en: string
}

export const DEFAULT_ROUTE_REGIONS: RouteRegionConfig[] = regionsData as RouteRegionConfig[]

export const GUANGDONG_ADCODE_OPTIONS: GuangdongAdcodeOption[] = [
  { adcode: 440100, zh: '广州', en: 'Guangzhou' },
  { adcode: 440200, zh: '韶关', en: 'Shaoguan' },
  { adcode: 440300, zh: '深圳', en: 'Shenzhen' },
  { adcode: 440400, zh: '珠海', en: 'Zhuhai' },
  { adcode: 440500, zh: '汕头', en: 'Shantou' },
  { adcode: 440600, zh: '佛山', en: 'Foshan' },
  { adcode: 440700, zh: '江门', en: 'Jiangmen' },
  { adcode: 440800, zh: '湛江', en: 'Zhanjiang' },
  { adcode: 440900, zh: '茂名', en: 'Maoming' },
  { adcode: 441200, zh: '肇庆', en: 'Zhaoqing' },
  { adcode: 441300, zh: '惠州', en: 'Huizhou' },
  { adcode: 441400, zh: '梅州', en: 'Meizhou' },
  { adcode: 441500, zh: '汕尾', en: 'Shanwei' },
  { adcode: 441600, zh: '河源', en: 'Heyuan' },
  { adcode: 441700, zh: '阳江', en: 'Yangjiang' },
  { adcode: 441800, zh: '清远', en: 'Qingyuan' },
  { adcode: 441900, zh: '东莞', en: 'Dongguan' },
  { adcode: 442000, zh: '中山', en: 'Zhongshan' },
  { adcode: 445100, zh: '潮州', en: 'Chaozhou' },
  { adcode: 445200, zh: '揭阳', en: 'Jieyang' },
  { adcode: 445300, zh: '云浮', en: 'Yunfu' },
]

export const ROUTE_TAG_OPTIONS: RouteTagOption[] = [
  { value: 'Bay Area', zh: '湾区', en: 'Bay Area' },
  { value: 'Chaoshan', zh: '潮汕', en: 'Chaoshan' },
  { value: 'Hakka', zh: '客家', en: 'Hakka' },
  { value: 'Coastal', zh: '海岸', en: 'Coastal' },
  { value: 'Mountain', zh: '山地', en: 'Mountain' },
]

export const LEGACY_ROUTE_TAG_MAP: Record<string, string> = {
  Guangfu: 'Bay Area',
  BayArea: 'Bay Area',
  'Bay Area': 'Bay Area',
  Chaoshan: 'Chaoshan',
  Hakka: 'Hakka',
  Coastal: 'Coastal',
  Mountain: 'Mountain',
}

export function formatAdcodeLabel(adcode: number) {
  const item = GUANGDONG_ADCODE_OPTIONS.find((option) => option.adcode === adcode)
  return item ? `${item.zh} / ${item.en} (${item.adcode})` : String(adcode)
}

export function formatRouteRegionLabel(region: RouteRegionConfig) {
  return `${region.title.zh} / ${region.title.en}`
}

export function normalizeRouteTag(value: string | undefined) {
  if (!value) return 'Bay Area'
  return LEGACY_ROUTE_TAG_MAP[value] || value
}

export function formatRouteTagLabel(value: string | undefined) {
  const normalized = normalizeRouteTag(value)
  const item = ROUTE_TAG_OPTIONS.find((option) => option.value === normalized)
  return item ? `${item.zh} / ${item.en}` : normalized
}
