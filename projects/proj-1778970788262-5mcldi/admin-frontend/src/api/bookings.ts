// ============================================
// 口译预约管理 API
// ============================================
import api from './index'
import type { ApiResponse, PaginatedResponse } from '@/types/common'
import type { Booking } from '@/types/interpreting'

export interface BookingListParams {
  page: number
  pageSize: number
  status?: string
  date?: string
}

export const bookingsApi = {
  getBookings(params: BookingListParams) {
    return api.get<ApiResponse<PaginatedResponse<Booking>>>('/interpreting/bookings', { params })
  },

  getBooking(id: string) {
    return api.get<ApiResponse<Booking>>(`/interpreting/bookings/${id}`)
  },

  confirmBooking(id: string) {
    return api.patch<ApiResponse<Booking>>(`/interpreting/bookings/${id}/confirm`)
  },

  assignInterpreter(id: string, interpreterId: string) {
    return api.patch<ApiResponse<Booking>>(`/interpreting/bookings/${id}/assign`, { interpreterId })
  },

  completeBooking(id: string) {
    return api.patch<ApiResponse<Booking>>(`/interpreting/bookings/${id}/complete`)
  },

  cancelBooking(id: string) {
    return api.patch<ApiResponse<Booking>>(`/interpreting/bookings/${id}/cancel`)
  },
}
