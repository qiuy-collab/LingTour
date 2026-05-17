// ============================================
// 路线管理 (Routes) 类型定义
// ============================================

/** 文化标签枚举 */
export type CultureTag =
  | 'Guangfu'
  | 'Chaoshan'
  | 'Hakka'
  | 'Coastal'
  | 'BayArea'
  | 'Mountain'

/** 路线站点子结构 (Stop) */
export interface RouteStop {
  id: string
  sortOrder: number // 站点顺序
  time: string // 时间（如 "08:00"）
  stopName: string // 站点名称
  plan: string // 计划简述
  story: string // 站点故事
  culturalStory: string // 文化深度解读（富文本）
  details: string[] // 体验要点列表
  image: string // 配图 URL
  lat: number // 纬度
  lng: number // 经度
  meal: string // 餐食安排
  hotel: string // 住宿安排
  transit: string // 交通方式
  placeDetail: string // 地点详述
}

/** 关联城市 */
export interface CityLink {
  cityName: string
  citySlug: string
}

/** 路线实体 */
export interface Route {
  id: string
  slug: string // URL 标识
  title: string // 路线标题
  titleEn: string // 路线标题（英文）
  cultureTag: CultureTag // 文化标签
  cityName: string // 所属城市
  duration: string // 时长（如 "1 day"）
  audience: string // 目标人群
  summary: string // 摘要
  story: string // 路线总述
  coverImage: string // 封面图 URL
  stops: RouteStop[] // 站点列表（核心子表）
  routeCityLinks: CityLink[] // 关联其他城市
  status: 'draft' | 'published' | 'archived' // 发布状态
  price: number // 路线价格
}

/** 路线编辑表单（id 可选，用于新增） */
export interface RouteFormData {
  id?: string
  slug: string
  title: string
  titleEn: string
  cultureTag: CultureTag
  cityName: string
  duration: string
  audience: string
  summary: string
  story: string
  coverImage: string
  stops: RouteStop[]
  routeCityLinks: CityLink[]
  status: 'draft' | 'published' | 'archived'
  price: number
}
