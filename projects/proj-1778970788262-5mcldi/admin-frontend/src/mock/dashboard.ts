// 仪表盘 Mock 数据
import type { DashboardData, OrderTrend, BookingModeDist, CityPopularity } from '@/types/dashboard'

/** 生成最近30天趋势数据 */
function generateOrderTrend(): OrderTrend[] {
  const trend: OrderTrend[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    // 模拟周末和平时不同的订单量
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseAmount = isWeekend ? 400 + Math.random() * 300 : 200 + Math.random() * 200
    const baseCount = isWeekend ? 5 + Math.floor(Math.random() * 4) : 2 + Math.floor(Math.random() * 3)
    trend.push({
      date: dateStr,
      amount: Math.round(baseAmount * 100) / 100,
      count: baseCount,
    })
  }
  return trend
}

const bookingModeDist: BookingModeDist[] = [
  { mode: 'Hourly Companion', count: 48, percentage: 42.1 },
  { mode: 'Half-Day Explorer', count: 38, percentage: 33.3 },
  { mode: 'Full-Day Immersion', count: 28, percentage: 24.6 },
]

const topCities: CityPopularity[] = [
  { city: '广州', citySlug: 'guangzhou', routeCount: 12, bookingCount: 35 },
  { city: '潮州', citySlug: 'chaozhou', routeCount: 8, bookingCount: 27 },
  { city: '湛江', citySlug: 'zhanjiang', routeCount: 5, bookingCount: 19 },
  { city: '梅州', citySlug: 'meizhou', routeCount: 4, bookingCount: 14 },
  { city: '佛山', citySlug: 'foshan', routeCount: 3, bookingCount: 11 },
]

export const mockDashboard: DashboardData = {
  stats: {
    totalUsers: 2847,
    totalCities: 5,
    totalRoutes: 12,
    totalProducts: 24,
    totalInterpreters: 8,
    pendingBookings: 14,
    pendingOrders: 9,
  },
  orderTrend: generateOrderTrend(),
  bookingModeDist,
  topCities,
}

export function generateDashboardId(): string {
  return ''
}
