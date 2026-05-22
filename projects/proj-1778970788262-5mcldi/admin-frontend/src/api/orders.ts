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

export const ordersApi = {
  getOrders(params: OrderListParams) {
    return api.get<ApiResponse<PaginatedResponse<Order>>>('/orders', {
      params: { ...params, limit: params.pageSize },
    })
  },

  getOrder(id: string) {
    return api.get<ApiResponse<Order>>(`/orders/${id}`)
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
