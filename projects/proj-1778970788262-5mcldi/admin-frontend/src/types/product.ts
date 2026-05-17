// ============================================
// 商品管理 (Products) 类型定义
// ============================================

/** 产地溯源子结构 */
export interface OriginTrace {
  location: string // 产地位置
  citySlug: string // 城市 slug
  cityName: string // 城市名
  materialSource: string // 原料来源描述
  craftTradition: string // 工艺传统描述
  process: string // 制作过程描述
  mapAdcode: number // 地图区域代码
}

export type ProductStatus = 'on_sale' | 'off_shelf'

/** 商品实体 */
export interface Product {
  id: string
  slug: string // URL 标识
  name: string // 商品名称
  nameEn: string // 商品名称（英文）
  collectionId: string // 所属系列 ID
  collectionName: string // 所属系列名称（展示用）
  price: number // 价格
  currency: string // 币种（如 SGD）
  tag: string // 标签
  image: string // 主图 URL
  story: string // 商品故事
  storyEn: string // 商品故事（英文）
  material: string // 材质
  materialEn: string // 材质（英文）
  dimensions: string // 尺寸
  origin: string // 产地
  care: string // 保养说明
  careEn: string // 保养说明（英文）
  gallery: string[] // 详情图集
  stock: number // 库存
  originTrace: OriginTrace // 产地溯源
  status: ProductStatus // 上架状态
  createdAt?: string
  updatedAt?: string
}

/** 商品编辑表单（id 可选，用于新增） */
export interface ProductFormData {
  id?: string
  slug: string
  name: string
  nameEn: string
  collectionId: string
  collectionName: string
  price: number
  currency: string
  tag: string
  image: string
  story: string
  storyEn: string
  material: string
  materialEn: string
  dimensions: string
  origin: string
  care: string
  careEn: string
  gallery: string[]
  stock: number
  originTrace: OriginTrace
  status: ProductStatus
}
