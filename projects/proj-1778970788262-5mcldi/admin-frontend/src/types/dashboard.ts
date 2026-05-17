// 仪表盘类型定义

/** 统计卡片数据 */
export interface DashboardStats {
  totalUsers: number
  totalCities: number
  totalRoutes: number
  totalProducts: number
  totalInterpreters: number
  pendingBookings: number
  pendingOrders: number
}

/** 近30天订单金额趋势 */
export interface OrderTrend {
  date: string      // YYYY-MM-DD
  amount: number    // 当日订单总额
  count: number     // 当日订单数
}

/** 口译预约按模式分布 */
export interface BookingModeDist {
  mode: string
  count: number
  percentage: number
}

/** 热门城市 Top5 */
export interface CityPopularity {
  city: string
  citySlug: string
  routeCount: number
  bookingCount: number
}

/** 仪表盘完整响应 */
export interface DashboardData {
  stats: DashboardStats
  orderTrend: OrderTrend[]
  bookingModeDist: BookingModeDist[]
  topCities: CityPopularity[]
}
