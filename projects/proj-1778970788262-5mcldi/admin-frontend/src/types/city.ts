// ============================================
// 城市管理 (Cities) 类型定义
// ============================================

/** 城市文章段落子结构 (Section) */
export interface CitySection {
  id: string
  title: string // 段落标题（支持中/英）
  body: string // 段落正文（富文本）
  image: string // 配图 URL
  statLabel: string // 数据标签
  statValue: string // 数据值
  breathImage: string // 呼吸图 URL
  breathQuote: string // 呼吸引语
  sortOrder: number // 排序
}

/** 城市实体 */
export interface City {
  id: string
  slug: string // URL 标识
  name: string // 城市名
  nameEn: string // 城市名（英文）
  regionLabel: string // 地区标签（如 "Southern coast"）
  adcode: number // 行政区划代码
  heroImage: string // 头图 URL
  heroNarrative: string // 头图叙述文案
  tags: string[] // 标签集
  editorIntro: string // 编辑推荐语/摘要
  galleryImages: string[] // 图片集
  foodTitle: string // 美食标题
  foodTitleEn: string // 美食标题（英文）
  foodDescription: string // 美食描述
  foodImages: string[] // 美食图片集
  sections: CitySection[] // 长文章段落
  stats: string[] // 城市数据亮点
  quotes: string[] // 引语/金句
  breathImages: string[] // 呼吸图片集
  status: 'published' | 'draft' // 发布状态
}

/** 城市编辑表单（id 可选，用于新增） */
export interface CityFormData {
  id?: string
  slug: string
  name: string
  nameEn: string
  regionLabel: string
  adcode: number
  heroImage: string
  heroNarrative: string
  tags: string[]
  editorIntro: string
  galleryImages: string[]
  foodTitle: string
  foodTitleEn: string
  foodDescription: string
  foodImages: string[]
  sections: CitySection[]
  stats: string[]
  quotes: string[]
  breathImages: string[]
  status: 'published' | 'draft'
}
