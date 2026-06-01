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

/** 履约状态（物流） */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

/** 支付状态 */
export type PaymentStatus =
  | 'unpaid'
  | 'paid'
  | 'failed'
  | 'refunded'

/** 订单实体 */
export interface Order {
  id: string
  orderNo: string
  userId: string | null
  userName: string
  userEmail: string
  guestEmail: string | null
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: string
  shippingAddress: ShippingAddress
  contactEmail: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string | null
  paymentId: string | null
  paidAt: string | null
  paymentFailureReason: string | null
  trackingNo: string | null
  refundReason: string | null
  createdAt: string
  updatedAt?: string
  notes?: string
}

/** 履约状态中文映射 */
export const OrderStatusMap: Record<OrderStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  shipped: '已发货',
  delivered: '已签收',
  cancelled: '已取消',
}

/** 履约状态颜色映射 */
export const OrderStatusColorMap: Record<OrderStatus, string> = {
  pending: 'warning',
  confirmed: 'primary',
  shipped: 'success',
  delivered: '',
  cancelled: 'danger',
}

/** 支付状态中文映射 */
export const PaymentStatusMap: Record<PaymentStatus, string> = {
  unpaid: '未支付',
  paid: '已支付',
  failed: '支付失败',
  refunded: '已退款',
}

/** 支付状态颜色映射 */
export const PaymentStatusColorMap: Record<PaymentStatus, string> = {
  unpaid: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'info',
}
