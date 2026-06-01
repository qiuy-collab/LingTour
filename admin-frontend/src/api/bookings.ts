import api from './index'
import type { ApiResponse, PaginatedResponse } from '@/types/common'
import type { Booking } from '@/types/interpreting'

export interface BookingListParams {
  page: number
  pageSize: number
  status?: string
  date?: string
}

function statusPayload(status: string) {
  return { status }
}

function normalizeBooking(raw: any): Booking {
  return {
    ...raw,
    date: raw.date || raw.serviceDate || '',
    mode: raw.mode || raw.supportMode || '',
    needs: raw.needs || raw.routeOrNeed || '',
    fastTrack: raw.fastTrack ?? false,
    status: raw.status,
    assignedInterpreterId: raw.assignedInterpreterId ?? null,
    assignedInterpreterName: raw.assignedInterpreterName ?? null,
  }
}

function normalizeList(res: any) {
  res.data.data.data = (res.data.data.data || []).map(normalizeBooking)
  return res
}

function normalizeDetail(res: any) {
  res.data.data = normalizeBooking(res.data.data)
  return res
}

export const bookingsApi = {
  async getBookings(params: BookingListParams) {
    const res = await api.get<ApiResponse<PaginatedResponse<Booking>>>('/bookings', {
      params: {
        page: params.page,
        size: params.pageSize,
        status: params.status,
        q: params.date,
      },
    })
    return normalizeList(res)
  },

  async getBooking(id: string) {
    const res = await api.get<ApiResponse<Booking>>(`/bookings/${id}`)
    return normalizeDetail(res)
  },

  confirmBooking(id: string) {
    return api.put<ApiResponse<Booking>>(`/bookings/${id}/status`, statusPayload('confirmed'))
  },

  assignInterpreter(id: string, interpreterId: string) {
    return api.patch<ApiResponse<Booking>>(`/bookings/${id}/assign`, { interpreterId })
  },

  completeBooking(id: string) {
    return api.put<ApiResponse<Booking>>(`/bookings/${id}/status`, statusPayload('completed'))
  },

  cancelBooking(id: string) {
    return api.put<ApiResponse<Booking>>(`/bookings/${id}/status`, statusPayload('cancelled'))
  },
}
