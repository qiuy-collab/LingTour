import api from './index'
import type { BookingModeDist, CityPopularity, DashboardData, DashboardStats, OrderTrend } from '@/types/dashboard'

function normalizeStats(input: Partial<DashboardStats> | undefined): DashboardStats {
  return {
    totalUsers: input?.totalUsers ?? 0,
    totalCities: input?.totalCities ?? 0,
    totalRoutes: input?.totalRoutes ?? 0,
    totalProducts: input?.totalProducts ?? 0,
    totalInterpreters: input?.totalInterpreters ?? 0,
    pendingBookings: input?.pendingBookings ?? 0,
    pendingOrders: input?.pendingOrders ?? 0,
  }
}

function normalizeOrderTrend(input: unknown): OrderTrend[] {
  if (!Array.isArray(input)) return []
  return input.map((item: any) => ({
    date: typeof item?.date === 'string' ? item.date : '',
    amount: typeof item?.amount === 'number' ? item.amount : 0,
    count: typeof item?.count === 'number' ? item.count : 0,
  }))
}

function normalizeBookingModeDist(input: unknown): BookingModeDist[] {
  if (!Array.isArray(input)) return []
  return input.map((item: any) => ({
    mode: typeof item?.mode === 'string' ? item.mode : '',
    count: typeof item?.count === 'number' ? item.count : 0,
    percentage: typeof item?.percentage === 'number' ? item.percentage : 0,
  }))
}

function normalizeTopCities(input: unknown): CityPopularity[] {
  if (!Array.isArray(input)) return []
  return input.map((item: any) => ({
    city: typeof item?.city === 'string' ? item.city : '',
    citySlug: typeof item?.citySlug === 'string' ? item.citySlug : '',
    routeCount: typeof item?.routeCount === 'number' ? item.routeCount : 0,
    bookingCount: typeof item?.bookingCount === 'number' ? item.bookingCount : 0,
  }))
}

function normalizeDashboardData(input: any): DashboardData {
  const payload = input?.data && !input?.stats ? input.data : input
  return {
    stats: normalizeStats(payload?.stats),
    orderTrend: normalizeOrderTrend(payload?.orderTrend),
    bookingModeDist: normalizeBookingModeDist(payload?.bookingModeDist),
    topCities: normalizeTopCities(payload?.topCities),
  }
}

export async function getDashboardStats(): Promise<DashboardData> {
  const response = await api.get('/dashboard')
  return normalizeDashboardData(response.data)
}
