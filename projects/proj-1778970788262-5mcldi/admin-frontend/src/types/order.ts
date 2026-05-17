// ============================================
// 订单管理 (Orders) 类型定义
// ============================================

/** 订单商品明细 */
export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  quantity: number
  unitPrice: number
}

/** 收货地址 */
export interface ShippingAddress {
  fullName: string
  phone: string
  country: string
  city: string
  address: string
  postalCode: string
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'refunded'
  | 'cancelled'

/** 订单实体 */
export interface Order {
  id: string
  orderNo: string // 订单号（如 LT202605170001）
  userId: string // 用户 ID
  userName: string // 用户姓名
  userEmail: string // 用户邮箱
  items: OrderItem[] // 商品明细
  subtotal: number // 小计
  shipping: number // 运费
  tax: number // 税费
  total: number // 合计
  currency: string // 币种
  shippingAddress: ShippingAddress // 收货地址
  contactEmail: string // 联系邮箱
  status: OrderStatus
  paymentMethod: string // 支付方式
  createdAt: string // 下单时间
  updatedAt?: string
  notes?: string
}

/** 订单状态中文映射 */
export const OrderStatusMap: Record<OrderStatus, string> = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已发货',
  delivered: '已签收',
  refunded: '已退款',
  cancelled: '已取消',
}

/** 订单状态颜色映射 (Element Plus tag type) */
export const OrderStatusColorMap: Record<OrderStatus, string> = {
  pending: 'warning',
  paid: 'primary',
  shipped: 'success',
  delivered: '',
  refunded: 'info',
  cancelled: 'danger',
}
