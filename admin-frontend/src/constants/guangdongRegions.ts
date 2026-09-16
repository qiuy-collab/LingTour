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
  label: string
}

export interface RouteRegionConfig {
  key: string
  title: string
  note: string
  adcodes: number[]
}

export interface RouteTagOption {
  value: string
  label: string
}

export const DEFAULT_ROUTE_REGIONS: RouteRegionConfig[] = regionsData as RouteRegionConfig[]

export const GUANGDONG_ADCODE_OPTIONS: GuangdongAdcodeOption[] = [
  { adcode: 440100, label: 'Guangzhou' },
  { adcode: 440200, label: 'Shaoguan' },
  { adcode: 440300, label: 'Shenzhen' },
  { adcode: 440400, label: 'Zhuhai' },
  { adcode: 440500, label: 'Shantou' },
  { adcode: 440600, label: 'Foshan' },
  { adcode: 440700, label: 'Jiangmen' },
  { adcode: 440800, label: 'Zhanjiang' },
  { adcode: 440900, label: 'Maoming' },
  { adcode: 441200, label: 'Zhaoqing' },
  { adcode: 441300, label: 'Huizhou' },
  { adcode: 441400, label: 'Meizhou' },
  { adcode: 441500, label: 'Shanwei' },
  { adcode: 441600, label: 'Heyuan' },
  { adcode: 441700, label: 'Yangjiang' },
  { adcode: 441800, label: 'Qingyuan' },
  { adcode: 441900, label: 'Dongguan' },
  { adcode: 442000, label: 'Zhongshan' },
  { adcode: 445100, label: 'Chaozhou' },
  { adcode: 445200, label: 'Jieyang' },
  { adcode: 445300, label: 'Yunfu' },
]

export const ROUTE_TAG_OPTIONS: RouteTagOption[] = [
  { value: 'Bay Area', label: 'Bay Area' },
  { value: 'Chaoshan', label: 'Chaoshan' },
  { value: 'Hakka', label: 'Hakka' },
  { value: 'Coastal', label: 'Coastal' },
  { value: 'Mountain', label: 'Mountain' },
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
  return item ? `${item.label} (${item.adcode})` : String(adcode)
}

export function formatRouteRegionLabel(region: RouteRegionConfig) {
  return region.title
}

export function normalizeRouteTag(value: string | undefined) {
  if (!value) return 'Bay Area'
  return LEGACY_ROUTE_TAG_MAP[value] || value
}

export function formatRouteTagLabel(value: string | undefined) {
  const normalized = normalizeRouteTag(value)
  const item = ROUTE_TAG_OPTIONS.find((option) => option.value === normalized)
  return item ? `${item.label}` : normalized
}
