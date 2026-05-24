// ============================================
// 订单 API 服务
// ============================================
import api from './index'
import type { ApiResponse, PaginatedResponse, PageParams } from '@/types/common'
import type { Order, OrderStatus, PaymentStatus } from '@/types/order'

export interface OrderListParams extends PageParams {
  status?: OrderStatus | string
  paymentStatus?: PaymentStatus | string
  startDate?: string
  endDate?: string
}

/** 将后端订单数据适配为前端 Order 类型 */
function normalizeOrder(raw: any): Order {
  const addr = raw.shippingAddr || {}
  return {
    id: raw.id,
    orderNo: raw.orderNo || '',
    userId: raw.userId || null,
    userName: addr.recipientName || raw.userName || '',
    userEmail: raw.guestEmail || raw.userEmail || '',
    guestEmail: raw.guestEmail || null,
    items: raw.items || [],
    subtotal: parseFloat(raw.totalAmount) || 0,
    shipping: 0,
    tax: 0,
    total: parseFloat(raw.totalAmount) || 0,
    currency: raw.currency || 'SGD',
    shippingAddress: {
      fullName: addr.recipientName || '',
      phone: addr.phone || '',
      country: addr.country || '',
      city: addr.city || '',
      address: [addr.street, addr.state].filter(Boolean).join(', '),
      postalCode: addr.postalCode || '',
    },
    contactEmail: raw.guestEmail || raw.userEmail || '',
    status: raw.status || 'pending',
    paymentStatus: raw.paymentStatus || 'unpaid',
    paymentMethod: raw.paymentMethod || null,
    paymentId: raw.paymentId || null,
    paidAt: raw.paidAt || null,
    paymentFailureReason: raw.paymentFailureReason || null,
    trackingNo: raw.trackingNo || null,
    refundReason: raw.refundReason || null,
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
    notes: raw.notes || '',
  }
}

export const ordersApi = {
  async getOrders(params: OrderListParams) {
    const res = await api.get<ApiResponse<PaginatedResponse<Order>>>('/orders', {
      params: { ...params, limit: params.pageSize },
    })
    // Normalize items
    if (res.data?.data?.items) {
      res.data.data.items = res.data.data.items.map(normalizeOrder)
    }
    return res
  },

  async getOrder(id: string) {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`)
    if (res.data?.data) {
      res.data.data = normalizeOrder(res.data.data)
    }
    return res
  },

  updateOrderStatus(id: string, status: OrderStatus) {
    return api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status })
  },

  /** 快捷操作：标记发货 */
  markShipped(id: string, trackingNo?: string) {
    return api.patch<ApiResponse<Order>>(`/orders/${id}/ship`, { trackingNo })
  },

  /** 快捷操作：退款 */
  markRefunded(id: string, reason?: string) {
    return api.patch<ApiResponse<Order>>(`/orders/${id}/refund`, { reason })
  },
}
