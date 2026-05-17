// ============================================
// 商城系列管理 (Store Collections) 类型定义
// ============================================

/** 商城系列实体 */
export interface StoreCollection {
  id: string
  slug: string // URL 标识
  title: string // 系列名称
  titleEn: string // 系列名称（英文）
  routeName: string // 关联路线名
  routeSlug: string // 关联路线 slug
  image: string // 封面图 URL
  body: string // 系列描述
  bodyEn: string // 系列描述（英文）
  productCount: number // 包含商品数
  status: 'published' | 'draft' // 发布状态
  createdAt?: string
  updatedAt?: string
}

/** 系列编辑表单（id 可选，用于新增） */
export interface CollectionFormData {
  id?: string
  slug: string
  title: string
  titleEn: string
  routeName: string
  routeSlug: string
  image: string
  body: string
  bodyEn: string
  productCount: number
  status: 'published' | 'draft'
}
