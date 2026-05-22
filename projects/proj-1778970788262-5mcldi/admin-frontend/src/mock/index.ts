// Mock 数据拦截器（仅开发环境生效）
// 拦截自定义 axios 实例，模拟后端 API 响应
// 通过 request→reject→response 短路实现，无需额外 Mock 库

import type { AxiosInstance } from 'axios'
import instance from '@/api/index'
import { mockCities, generateId as genCityId } from './cities'
import { mockRoutes, generateId as genRouteId } from './routes'
import { mockCollections, generateId as genColId } from './collections'
import { mockProducts, generateId as genProdId } from './products'
import { mockOrders } from './orders'
import { mockServiceModes, mockInterpreters, mockBookings, mockFAQs, generateModeId, generateInterpreterId, generateFAQId } from './interpreting'
import { mockEvents, mockCommunityPosts, mockHomeConfig, generateEventId } from './operations'
import { mockDashboard } from './dashboard'
import { mockUsers } from './users'
import { mockSettings } from './settings'
import type { City } from '@/types/city'
import type { Route } from '@/types/route'
import type { StoreCollection } from '@/types/collection'
import type { Product } from '@/types/product'
import type { Order } from '@/types/order'
import type { ServiceMode, Interpreter, Booking, FAQ } from '@/types/interpreting'
import type { Event } from '@/types/event'
import type { CommunityPost } from '@/types/community'
import type { HomeConfig } from '@/types/home'
import type { ManagedUser } from '@/types/user'
import type { AppSettings } from '@/types/settings'

// ─── 内存数据（可写副本，支持 CRUD） ──────────────────
let cities: City[] = JSON.parse(JSON.stringify(mockCities))
let routes: Route[] = JSON.parse(JSON.stringify(mockRoutes))
let collections: StoreCollection[] = JSON.parse(JSON.stringify(mockCollections))
let products: Product[] = JSON.parse(JSON.stringify(mockProducts))
let orders: Order[] = JSON.parse(JSON.stringify(mockOrders))
let serviceModes: ServiceMode[] = JSON.parse(JSON.stringify(mockServiceModes))
let interpreters: Interpreter[] = JSON.parse(JSON.stringify(mockInterpreters))
let bookings: Booking[] = JSON.parse(JSON.stringify(mockBookings))
let faqs: FAQ[] = JSON.parse(JSON.stringify(mockFAQs))
let events: Event[] = JSON.parse(JSON.stringify(mockEvents))
let communityPosts: CommunityPost[] = JSON.parse(JSON.stringify(mockCommunityPosts))
let homeConfig: HomeConfig = JSON.parse(JSON.stringify(mockHomeConfig))
let users: ManagedUser[] = JSON.parse(JSON.stringify(mockUsers))
let appSettings: AppSettings = JSON.parse(JSON.stringify(mockSettings))

// ─── Auth Mock 数据 ──────────────────────────────────
const mockAdminUsers = [
  {
    id: '1',
    username: 'admin',
    name: '管理员',
    avatar: '',
  },
]
const mockToken = 'mock-admin-token-lingtour-2026'

// ─── 工具函数 ──────────────────────────────────────
function parseBody(config: any): any {
  if (!config.data) return {}
  return typeof config.data === 'string' ? JSON.parse(config.data) : config.data
}

function mockResponse(config: any, data: any, status = 200) {
  return Promise.reject({
    isMock: true,
    status,
    statusText: 'OK',
    data: { code: 0, data, message: 'ok' },
    headers: {},
    config,
  })
}

function mockError(config: any, message: string, status = 404) {
  return Promise.reject({
    isMock: true,
    status,
    statusText: message,
    data: { code: status, data: null, message },
    headers: {},
    config,
  })
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length
  const start = (page - 1) * pageSize
  const paged = items.slice(start, start + pageSize)
  return { items: paged, total, page, pageSize }
}

// ─── Mock 注册函数 ─────────────────────────────────
function setupMock(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.request.use((config) => {
    const url = config.url || ''
    const method = config.method?.toUpperCase() || 'GET'

    // ═══════════════════════════════════════
    // Auth
    // ═══════════════════════════════════════
    if (url === '/auth/login' && method === 'POST') {
      const body = parseBody(config)
      const user = mockAdminUsers.find((u) => u.username === body?.username)
      if (user) {
        return mockResponse(config, { token: mockToken, user })
      }
      return mockError(config, '用户名或密码错误', 401)
    }

    if (url === '/auth/me' && method === 'GET') {
      const token = config.headers?.Authorization as string
      if (token && token.includes('mock')) {
        return mockResponse(config, mockAdminUsers[0])
      }
      return mockError(config, '未登录', 401)
    }

    // ═══════════════════════════════════════
    // Upload
    // ═══════════════════════════════════════
    if (url === '/upload' && method === 'POST') {
      return mockResponse(config, {
        url: 'https://picsum.photos/800/600?random=' + Date.now(),
      })
    }

    // ═══════════════════════════════════════
    // Cities CRUD
    // ═══════════════════════════════════════
    // GET /cities — 列表（分页 + 搜索）
    if (url === '/cities' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const keyword = params.keyword?.toLowerCase() || ''

      let filtered = cities
      if (keyword) {
        filtered = cities.filter(
          (c) =>
            (c.name.zh || '').toLowerCase().includes(keyword) ||
            (c.name.en || '').toLowerCase().includes(keyword) ||
            c.slug.toLowerCase().includes(keyword)
        )
      }
      return mockResponse(config, paginate(filtered, page, pageSize))
    }

    // GET /cities/:id — 单个城市
    const cityMatch = url.match(/^\/cities\/([^/]+)$/)
    if (cityMatch && method === 'GET') {
      const id = cityMatch[1]
      const city = cities.find((c) => c.id === id)
      if (city) return mockResponse(config, city)
      return mockError(config, '城市不存在', 404)
    }

    // POST /cities — 新增
    if (url === '/cities' && method === 'POST') {
      const body = parseBody(config)
      const newCity: City = {
        ...body,
        id: genCityId(),
        galleryImages: body.galleryImages || [],
        foodImages: body.foodImages || [],
        stats: body.stats || [],
        quotes: body.quotes || [],
        breathImages: body.breathImages || [],
        status: body.status || 'published',
      }
      cities.unshift(newCity)
      return mockResponse(config, newCity)
    }

    // PUT /cities/:id — 更新
    const cityUpdateMatch = url.match(/^\/cities\/([^/]+)$/)
    if (cityUpdateMatch && method === 'PUT') {
      const id = cityUpdateMatch[1]
      const body = parseBody(config)
      const index = cities.findIndex((c) => c.id === id)
      if (index === -1) return mockError(config, '城市不存在', 404)
      cities[index] = { ...cities[index], ...body }
      return mockResponse(config, cities[index])
    }

    // DELETE /cities/:id — 删除
    if (cityMatch && method === 'DELETE') {
      const id = cityMatch[1]
      const index = cities.findIndex((c) => c.id === id)
      if (index === -1) return mockError(config, '城市不存在', 404)
      cities.splice(index, 1)
      return mockResponse(config, null)
    }

    // ═══════════════════════════════════════
    // Routes CRUD
    // ═══════════════════════════════════════
    // GET /routes — 列表（分页 + 筛选）
    if (url === '/routes' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const keyword = params.keyword?.toLowerCase() || ''
      const status = params.status || ''
      const cityName = params.cityName || ''

      let filtered = routes
      if (keyword) {
        filtered = filtered.filter(
          (r) =>
            (r.title.zh || '').toLowerCase().includes(keyword) ||
            (r.title.en || '').toLowerCase().includes(keyword) ||
            r.slug.toLowerCase().includes(keyword)
        )
      }
      if (status) {
        const isPublished = status === 'published'
        filtered = filtered.filter((r) => r.published === isPublished)
      }
      if (cityName) {
        filtered = filtered.filter((r) => (r.cityName.zh || '') === cityName || (r.cityName.en || '') === cityName)
      }
      return mockResponse(config, paginate(filtered, page, pageSize))
    }

    // GET /routes/:id — 单个路线
    const routeMatch = url.match(/^\/routes\/([^/]+)$/)
    if (routeMatch && method === 'GET') {
      const id = routeMatch[1]
      const route = routes.find((r) => r.id === id)
      if (route) return mockResponse(config, route)
      return mockError(config, '路线不存在', 404)
    }

    // PATCH /routes/:id/status — 更新状态
    const routeStatusMatch = url.match(/^\/routes\/([^/]+)\/status$/)
    if (routeStatusMatch && method === 'PATCH') {
      const id = routeStatusMatch[1]
      const body = parseBody(config)
      const index = routes.findIndex((r) => r.id === id)
      if (index === -1) return mockError(config, '路线不存在', 404)
      routes[index] = { ...routes[index], published: body.published }
      return mockResponse(config, routes[index])
    }

    // POST /routes — 新增
    if (url === '/routes' && method === 'POST') {
      const body = parseBody(config)
      const newRoute: Route = {
        ...body,
        id: genRouteId(),
        stops: body.stops || [],
        citySlugs: body.citySlugs || [],
        published: body.published !== undefined ? body.published : false,
      }
      routes.unshift(newRoute)
      return mockResponse(config, newRoute)
    }

    // PUT /routes/:id — 更新
    const routeUpdateMatch = url.match(/^\/routes\/([^/]+)$/)
    if (routeUpdateMatch && method === 'PUT') {
      const id = routeUpdateMatch[1]
      const body = parseBody(config)
      const index = routes.findIndex((r) => r.id === id)
      if (index === -1) return mockError(config, '路线不存在', 404)
      routes[index] = { ...routes[index], ...body }
      return mockResponse(config, routes[index])
    }

    // DELETE /routes/:id — 删除
    if (routeMatch && method === 'DELETE') {
      const id = routeMatch[1]
      const index = routes.findIndex((r) => r.id === id)
      if (index === -1) return mockError(config, '路线不存在', 404)
      routes.splice(index, 1)
      return mockResponse(config, null)
    }

    // ═══════════════════════════════════════
    // Collections CRUD
    // ═══════════════════════════════════════
    // GET /shop/collections — 列表（分页 + 搜索）
    if (url === '/shop/collections' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const keyword = params.keyword?.toLowerCase() || ''
      let filtered = collections
      if (keyword) {
        filtered = collections.filter(
          (c) =>
            (c.title.zh || '').toLowerCase().includes(keyword) ||
            (c.title.en || '').toLowerCase().includes(keyword) ||
            c.slug.toLowerCase().includes(keyword)
        )
      }
      return mockResponse(config, paginate(filtered, page, pageSize))
    }

    // GET /shop/collections/:id — 单个系列
    const colMatch = url.match(/^\/shop\/collections\/([^/]+)$/)
    if (colMatch && method === 'GET') {
      const id = colMatch[1]
      const col = collections.find((c) => c.id === id)
      if (col) return mockResponse(config, col)
      return mockError(config, '系列不存在', 404)
    }

    // POST /shop/collections — 新增
    if (url === '/shop/collections' && method === 'POST') {
      const body = parseBody(config)
      const newCol: StoreCollection = {
        ...body,
        id: genColId(),
        productCount: body.productCount || 0,
        published: body.published !== undefined ? body.published : false,
      }
      collections.unshift(newCol)
      return mockResponse(config, newCol)
    }

    // PUT /shop/collections/:id — 更新
    const colUpdateMatch = url.match(/^\/shop\/collections\/([^/]+)$/)
    if (colUpdateMatch && method === 'PUT') {
      const id = colUpdateMatch[1]
      const body = parseBody(config)
      const index = collections.findIndex((c) => c.id === id)
      if (index === -1) return mockError(config, '系列不存在', 404)
      collections[index] = { ...collections[index], ...body }
      return mockResponse(config, collections[index])
    }

    // DELETE /shop/collections/:id — 删除
    if (colMatch && method === 'DELETE') {
      const id = colMatch[1]
      const index = collections.findIndex((c) => c.id === id)
      if (index === -1) return mockError(config, '系列不存在', 404)
      collections.splice(index, 1)
      return mockResponse(config, null)
    }

    // ═══════════════════════════════════════
    // Products CRUD
    // ═══════════════════════════════════════
    // GET /shop/products — 列表（分页 + 筛选 + 搜索）
    if (url === '/shop/products' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const keyword = params.keyword?.toLowerCase() || ''
      const collectionId = params.collectionId || ''
      const status = params.status || ''
      let filtered = products
      if (keyword) {
        filtered = filtered.filter(
          (p) =>
            (p.name.zh || '').toLowerCase().includes(keyword) ||
            (p.name.en || '').toLowerCase().includes(keyword) ||
            p.slug.toLowerCase().includes(keyword)
        )
      }
      if (collectionId) {
        filtered = filtered.filter((p) => p.collectionId === collectionId)
      }
      if (status) {
        const isPublished = status === 'published'
        filtered = filtered.filter((p) => p.published === isPublished)
      }
      return mockResponse(config, paginate(filtered, page, pageSize))
    }

    // GET /shop/products/:id — 单个商品
    const prodMatch = url.match(/^\/shop\/products\/([^/]+)$/)
    if (prodMatch && method === 'GET') {
      const id = prodMatch[1]
      const prod = products.find((p) => p.id === id)
      if (prod) return mockResponse(config, prod)
      return mockError(config, '商品不存在', 404)
    }

    // PATCH /shop/products/:id/status — 上下架
    const prodStatusMatch = url.match(/^\/shop\/products\/([^/]+)\/status$/)
    if (prodStatusMatch && method === 'PATCH') {
      const id = prodStatusMatch[1]
      const body = parseBody(config)
      const index = products.findIndex((p) => p.id === id)
      if (index === -1) return mockError(config, '商品不存在', 404)
      products[index] = { ...products[index], published: body.published }
      return mockResponse(config, products[index])
    }

    // PATCH /shop/products/:id/stock — 库存调整
    const prodStockMatch = url.match(/^\/shop\/products\/([^/]+)\/stock$/)
    if (prodStockMatch && method === 'PATCH') {
      const id = prodStockMatch[1]
      const body = parseBody(config)
      const index = products.findIndex((p) => p.id === id)
      if (index === -1) return mockError(config, '商品不存在', 404)
      products[index] = { ...products[index], stock: body.stock }
      return mockResponse(config, products[index])
    }

    // POST /shop/products — 新增
    if (url === '/shop/products' && method === 'POST') {
      const body = parseBody(config)
      const newProd: Product = {
        ...body,
        id: genProdId(),
        gallery: body.gallery || [],
        originTrace: body.originTrace || {
          location: '', citySlug: '', cityName: '',
          materialSource: '', craftTradition: '', process: '', mapAdcode: 0,
        },
        stock: body.stock || 0,
        published: body.published !== undefined ? body.published : false,
      }
      products.unshift(newProd)
      return mockResponse(config, newProd)
    }

    // PUT /shop/products/:id — 更新
    const prodUpdateMatch = url.match(/^\/shop\/products\/([^/]+)$/)
    if (prodUpdateMatch && method === 'PUT') {
      const id = prodUpdateMatch[1]
      const body = parseBody(config)
      const index = products.findIndex((p) => p.id === id)
      if (index === -1) return mockError(config, '商品不存在', 404)
      products[index] = { ...products[index], ...body }
      return mockResponse(config, products[index])
    }

    // DELETE /shop/products/:id — 删除
    if (prodMatch && method === 'DELETE') {
      const id = prodMatch[1]
      const index = products.findIndex((p) => p.id === id)
      if (index === -1) return mockError(config, '商品不存在', 404)
      products.splice(index, 1)
      return mockResponse(config, null)
    }

    // ═══════════════════════════════════════
    // Orders CRUD (R+U only, no create/delete)
    // ═══════════════════════════════════════
    // GET /orders — 列表（分页 + 筛选）
    if (url === '/orders' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const status = params.status || ''
      const startDate = params.startDate || ''
      const endDate = params.endDate || ''
      let filtered = orders
      if (status) {
        filtered = filtered.filter((o) => o.status === status)
      }
      if (startDate) {
        filtered = filtered.filter((o) => o.createdAt >= startDate)
      }
      if (endDate) {
        filtered = filtered.filter((o) => o.createdAt <= endDate + 'T23:59:59Z')
      }
      // 按创建时间倒序
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      return mockResponse(config, paginate(filtered, page, pageSize))
    }

    // GET /orders/:id — 单个订单
    const ordMatch = url.match(/^\/orders\/([^/]+)$/)
    if (ordMatch && method === 'GET') {
      const id = ordMatch[1]
      const ord = orders.find((o) => o.id === id)
      if (ord) return mockResponse(config, ord)
      return mockError(config, '订单不存在', 404)
    }

    // PATCH /orders/:id/status — 更新状态
    const ordStatusMatch = url.match(/^\/orders\/([^/]+)\/status$/)
    if (ordStatusMatch && method === 'PATCH') {
      const id = ordStatusMatch[1]
      const body = parseBody(config)
      const index = orders.findIndex((o) => o.id === id)
      if (index === -1) return mockError(config, '订单不存在', 404)
      orders[index] = { ...orders[index], status: body.status, updatedAt: new Date().toISOString() }
      return mockResponse(config, orders[index])
    }

    // PATCH /orders/:id/ship — 发货
    const ordShipMatch = url.match(/^\/orders\/([^/]+)\/ship$/)
    if (ordShipMatch && method === 'PATCH') {
      const id = ordShipMatch[1]
      const index = orders.findIndex((o) => o.id === id)
      if (index === -1) return mockError(config, '订单不存在', 404)
      orders[index] = { ...orders[index], status: 'shipped', updatedAt: new Date().toISOString() }
      return mockResponse(config, orders[index])
    }

    // PATCH /orders/:id/refund — 退款
    const ordRefundMatch = url.match(/^\/orders\/([^/]+)\/refund$/)
    if (ordRefundMatch && method === 'PATCH') {
      const id = ordRefundMatch[1]
      const index = orders.findIndex((o) => o.id === id)
      if (index === -1) return mockError(config, '订单不存在', 404)
      orders[index] = { ...orders[index], paymentStatus: 'refunded', status: 'cancelled', updatedAt: new Date().toISOString() }
      return mockResponse(config, orders[index])
    }

    // ═══════════════════════════════════════
    // Interpreting — Service Modes CRUD
    // ═══════════════════════════════════════
    // GET /interpreting/modes — 列表
    if (url === '/interpreting/modes' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const sorted = [...serviceModes].sort((a, b) => a.sortOrder - b.sortOrder)
      return mockResponse(config, paginate(sorted, page, pageSize))
    }

    // PATCH /interpreting/modes/:id/sort — 排序更新
    const modeSortMatch = url.match(/^\/interpreting\/modes\/([^/]+)\/sort$/)
    if (modeSortMatch && method === 'PATCH') {
      const id = modeSortMatch[1]
      const body = parseBody(config)
      const index = serviceModes.findIndex((m) => m.id === id)
      if (index === -1) return mockError(config, '模式不存在', 404)
      serviceModes[index] = { ...serviceModes[index], sortOrder: body.sortOrder }
      return mockResponse(config, serviceModes[index])
    }

    // GET /interpreting/modes/:id
    const modeMatch = url.match(/^\/interpreting\/modes\/([^/]+)$/)
    if (modeMatch && method === 'GET') {
      const id = modeMatch[1]
      const mode = serviceModes.find((m) => m.id === id)
      if (mode) return mockResponse(config, mode)
      return mockError(config, '模式不存在', 404)
    }

    // POST /interpreting/modes — 新增
    if (url === '/interpreting/modes' && method === 'POST') {
      const body = parseBody(config)
      const newMode: ServiceMode = { ...body, id: generateModeId(), includes: body.includes || [] }
      serviceModes.unshift(newMode)
      return mockResponse(config, newMode)
    }

    // PUT /interpreting/modes/:id — 更新
    const modeUpdateMatch = url.match(/^\/interpreting\/modes\/([^/]+)$/)
    if (modeUpdateMatch && method === 'PUT') {
      const id = modeUpdateMatch[1]
      const body = parseBody(config)
      const index = serviceModes.findIndex((m) => m.id === id)
      if (index === -1) return mockError(config, '模式不存在', 404)
      serviceModes[index] = { ...serviceModes[index], ...body }
      return mockResponse(config, serviceModes[index])
    }

    // DELETE /interpreting/modes/:id
    if (modeMatch && method === 'DELETE') {
      const id = modeMatch[1]
      const index = serviceModes.findIndex((m) => m.id === id)
      if (index === -1) return mockError(config, '模式不存在', 404)
      serviceModes.splice(index, 1)
      return mockResponse(config, null)
    }

    // ═══════════════════════════════════════
    // Interpreting — Interpreters CRUD
    // ═══════════════════════════════════════
    // GET /interpreting/profiles — 列表
    if (url === '/interpreting/profiles' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const status = params.status || ''
      let filtered = interpreters
      if (status) {
        filtered = filtered.filter((i) => i.status === status)
      }
      return mockResponse(config, paginate(filtered, page, pageSize))
    }

    // PATCH /interpreting/profiles/:id/status — 状态变更
    const interpStatusMatch = url.match(/^\/interpreting\/profiles\/([^/]+)\/status$/)
    if (interpStatusMatch && method === 'PATCH') {
      const id = interpStatusMatch[1]
      const body = parseBody(config)
      const index = interpreters.findIndex((i) => i.id === id)
      if (index === -1) return mockError(config, '口译员不存在', 404)
      interpreters[index] = { ...interpreters[index], status: body.status }
      return mockResponse(config, interpreters[index])
    }

    // GET /interpreting/profiles/:id
    const interpMatch = url.match(/^\/interpreting\/profiles\/([^/]+)$/)
    if (interpMatch && method === 'GET') {
      const id = interpMatch[1]
      const interp = interpreters.find((i) => i.id === id)
      if (interp) return mockResponse(config, interp)
      return mockError(config, '口译员不存在', 404)
    }

    // POST /interpreting/profiles — 新增
    if (url === '/interpreting/profiles' && method === 'POST') {
      const body = parseBody(config)
      const newInterp: Interpreter = { ...body, id: generateInterpreterId(), helps: body.helps || [] }
      interpreters.unshift(newInterp)
      return mockResponse(config, newInterp)
    }

    // PUT /interpreting/profiles/:id — 更新
    const interpUpdateMatch = url.match(/^\/interpreting\/profiles\/([^/]+)$/)
    if (interpUpdateMatch && method === 'PUT') {
      const id = interpUpdateMatch[1]
      const body = parseBody(config)
      const index = interpreters.findIndex((i) => i.id === id)
      if (index === -1) return mockError(config, '口译员不存在', 404)
      interpreters[index] = { ...interpreters[index], ...body }
      return mockResponse(config, interpreters[index])
    }

    // DELETE /interpreting/profiles/:id
    if (interpMatch && method === 'DELETE') {
      const id = interpMatch[1]
      const index = interpreters.findIndex((i) => i.id === id)
      if (index === -1) return mockError(config, '口译员不存在', 404)
      interpreters.splice(index, 1)
      return mockResponse(config, null)
    }

    // ═══════════════════════════════════════
    // Interpreting — Bookings (R+U)
    // ═══════════════════════════════════════
    // GET /interpreting/bookings — 列表（分页 + 筛选）
    if (url === '/interpreting/bookings' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const status = params.status || ''
      const date = params.date || ''
      let filtered = bookings
      if (status) {
        filtered = filtered.filter((b) => b.status === status)
      }
      if (date) {
        filtered = filtered.filter((b) => b.date === date)
      }
      // 按创建时间倒序
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      return mockResponse(config, paginate(filtered, page, pageSize))
    }

    // GET /interpreting/bookings/:id
    const bookingMatch = url.match(/^\/interpreting\/bookings\/([^/]+)$/)
    if (bookingMatch && method === 'GET') {
      const id = bookingMatch[1]
      const booking = bookings.find((b) => b.id === id)
      if (booking) return mockResponse(config, booking)
      return mockError(config, '预约不存在', 404)
    }

    // PATCH /interpreting/bookings/:id/confirm — 确认
    const bookingConfirmMatch = url.match(/^\/interpreting\/bookings\/([^/]+)\/confirm$/)
    if (bookingConfirmMatch && method === 'PATCH') {
      const id = bookingConfirmMatch[1]
      const index = bookings.findIndex((b) => b.id === id)
      if (index === -1) return mockError(config, '预约不存在', 404)
      bookings[index] = { ...bookings[index], status: 'confirmed' }
      return mockResponse(config, bookings[index])
    }

    // PATCH /interpreting/bookings/:id/assign — 分配口译员
    const bookingAssignMatch = url.match(/^\/interpreting\/bookings\/([^/]+)\/assign$/)
    if (bookingAssignMatch && method === 'PATCH') {
      const id = bookingAssignMatch[1]
      const body = parseBody(config)
      const index = bookings.findIndex((b) => b.id === id)
      if (index === -1) return mockError(config, '预约不存在', 404)
      const interp = interpreters.find((i) => i.id === body.interpreterId)
      bookings[index] = {
        ...bookings[index],
        assignedInterpreterId: body.interpreterId,
        assignedInterpreterName: interp?.name || null,
      }
      return mockResponse(config, bookings[index])
    }

    // PATCH /interpreting/bookings/:id/complete — 完成
    const bookingCompleteMatch = url.match(/^\/interpreting\/bookings\/([^/]+)\/complete$/)
    if (bookingCompleteMatch && method === 'PATCH') {
      const id = bookingCompleteMatch[1]
      const index = bookings.findIndex((b) => b.id === id)
      if (index === -1) return mockError(config, '预约不存在', 404)
      bookings[index] = { ...bookings[index], status: 'completed' }
      return mockResponse(config, bookings[index])
    }

    // PATCH /interpreting/bookings/:id/cancel — 取消
    const bookingCancelMatch = url.match(/^\/interpreting\/bookings\/([^/]+)\/cancel$/)
    if (bookingCancelMatch && method === 'PATCH') {
      const id = bookingCancelMatch[1]
      const index = bookings.findIndex((b) => b.id === id)
      if (index === -1) return mockError(config, '预约不存在', 404)
      bookings[index] = { ...bookings[index], status: 'cancelled' }
      return mockResponse(config, bookings[index])
    }

    // ═══════════════════════════════════════
    // Interpreting — FAQs CRUD
    // ═══════════════════════════════════════
    // GET /interpreting/faqs — 列表
    if (url === '/interpreting/faqs' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const category = params.category || ''
      let filtered = faqs
      if (category) {
        filtered = filtered.filter((f) => f.category === category)
      }
      const sorted = [...filtered].sort((a, b) => a.sortOrder - b.sortOrder)
      return mockResponse(config, paginate(sorted, page, pageSize))
    }

    // PATCH /interpreting/faqs/:id/sort — 排序更新
    const faqSortMatch = url.match(/^\/interpreting\/faqs\/([^/]+)\/sort$/)
    if (faqSortMatch && method === 'PATCH') {
      const id = faqSortMatch[1]
      const body = parseBody(config)
      const index = faqs.findIndex((f) => f.id === id)
      if (index === -1) return mockError(config, 'FAQ不存在', 404)
      faqs[index] = { ...faqs[index], sortOrder: body.sortOrder }
      return mockResponse(config, faqs[index])
    }

    // GET /interpreting/faqs/:id
    const faqMatch = url.match(/^\/interpreting\/faqs\/([^/]+)$/)
    if (faqMatch && method === 'GET') {
      const id = faqMatch[1]
      const faq = faqs.find((f) => f.id === id)
      if (faq) return mockResponse(config, faq)
      return mockError(config, 'FAQ不存在', 404)
    }

    // POST /interpreting/faqs — 新增
    if (url === '/interpreting/faqs' && method === 'POST') {
      const body = parseBody(config)
      const newFAQ: FAQ = { ...body, id: generateFAQId() }
      faqs.unshift(newFAQ)
      return mockResponse(config, newFAQ)
    }

    // PUT /interpreting/faqs/:id — 更新
    const faqUpdateMatch = url.match(/^\/interpreting\/faqs\/([^/]+)$/)
    if (faqUpdateMatch && method === 'PUT') {
      const id = faqUpdateMatch[1]
      const body = parseBody(config)
      const index = faqs.findIndex((f) => f.id === id)
      if (index === -1) return mockError(config, 'FAQ不存在', 404)
      faqs[index] = { ...faqs[index], ...body }
      return mockResponse(config, faqs[index])
    }

    // DELETE /interpreting/faqs/:id
    if (faqMatch && method === 'DELETE') {
      const id = faqMatch[1]
      const index = faqs.findIndex((f) => f.id === id)
      if (index === -1) return mockError(config, 'FAQ不存在', 404)
      faqs.splice(index, 1)
      return mockResponse(config, null)
    }

    // ═══════════════════════════════════════
    // Events CRUD
    // ═══════════════════════════════════════
    // GET /events — 列表（分页 + 筛选）
    if (url === '/events' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const status = params.status || ''
      const city = params.city || ''
      const startDate = params.startDate || ''
      const endDate = params.endDate || ''
      let filtered = events
      if (status) {
        filtered = filtered.filter((e) => e.status === status)
      }
      if (city) {
        filtered = filtered.filter((e) => e.citySlug === city || e.city === city)
      }
      if (startDate) {
        filtered = filtered.filter((e) => e.date >= startDate)
      }
      if (endDate) {
        filtered = filtered.filter((e) => e.date <= endDate)
      }
      // 按日期排序
      filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      return mockResponse(config, paginate(filtered, page, pageSize))
    }

    // GET /events/:id
    const eventMatch = url.match(/^\/events\/([^/]+)$/)
    if (eventMatch && method === 'GET') {
      const id = eventMatch[1]
      const event = events.find((e) => e.id === id)
      if (event) return mockResponse(config, event)
      return mockError(config, '活动不存在', 404)
    }

    // PATCH /events/:id/status
    const eventStatusMatch = url.match(/^\/events\/([^/]+)\/status$/)
    if (eventStatusMatch && method === 'PATCH') {
      const id = eventStatusMatch[1]
      const body = parseBody(config)
      const index = events.findIndex((e) => e.id === id)
      if (index === -1) return mockError(config, '活动不存在', 404)
      events[index] = { ...events[index], status: body.status }
      return mockResponse(config, events[index])
    }

    // POST /events — 新增
    if (url === '/events' && method === 'POST') {
      const body = parseBody(config)
      const newEvent: Event = {
        ...body,
        id: generateEventId(),
        tags: body.tags || [],
        relatedRouteSlugs: body.relatedRouteSlugs || [],
        status: body.status || 'draft',
      }
      events.unshift(newEvent)
      return mockResponse(config, newEvent)
    }

    // PUT /events/:id — 更新
    const eventUpdateMatch = url.match(/^\/events\/([^/]+)$/)
    if (eventUpdateMatch && method === 'PUT') {
      const id = eventUpdateMatch[1]
      const body = parseBody(config)
      const index = events.findIndex((e) => e.id === id)
      if (index === -1) return mockError(config, '活动不存在', 404)
      events[index] = { ...events[index], ...body }
      return mockResponse(config, events[index])
    }

    // DELETE /events/:id
    if (eventMatch && method === 'DELETE') {
      const id = eventMatch[1]
      const index = events.findIndex((e) => e.id === id)
      if (index === -1) return mockError(config, '活动不存在', 404)
      events.splice(index, 1)
      return mockResponse(config, null)
    }

    // ═══════════════════════════════════════
    // Community Posts (R+U+D)
    // ═══════════════════════════════════════
    // GET /community/posts — 列表（分页 + 筛选）
    if (url === '/community/posts' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const keyword = params.keyword?.toLowerCase() || ''
      const channel = params.channel || ''
      const status = params.status || ''
      let filtered = communityPosts
      if (keyword) {
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(keyword) ||
            p.excerpt.toLowerCase().includes(keyword) ||
            p.userName.includes(keyword)
        )
      }
      if (channel) {
        filtered = filtered.filter((p) => p.channel === channel)
      }
      if (status) {
        filtered = filtered.filter((p) => p.status === status)
      }
      // 按日期倒序
      filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      return mockResponse(config, paginate(filtered, page, pageSize))
    }

    // GET /community/posts/:id
    const postMatch = url.match(/^\/community\/posts\/([^/]+)$/)
    if (postMatch && method === 'GET') {
      const id = postMatch[1]
      const post = communityPosts.find((p) => p.id === id)
      if (post) return mockResponse(config, post)
      return mockError(config, '帖子不存在', 404)
    }

    // PATCH /community/posts/:id/review — 审核
    const postReviewMatch = url.match(/^\/community\/posts\/([^/]+)\/review$/)
    if (postReviewMatch && method === 'PATCH') {
      const id = postReviewMatch[1]
      const body = parseBody(config)
      const index = communityPosts.findIndex((p) => p.id === id)
      if (index === -1) return mockError(config, '帖子不存在', 404)
      communityPosts[index] = { ...communityPosts[index], status: body.status }
      return mockResponse(config, communityPosts[index])
    }

    // PATCH /community/posts/:id/featured — 精选
    const postFeaturedMatch = url.match(/^\/community\/posts\/([^/]+)\/featured$/)
    if (postFeaturedMatch && method === 'PATCH') {
      const id = postFeaturedMatch[1]
      const body = parseBody(config)
      const index = communityPosts.findIndex((p) => p.id === id)
      if (index === -1) return mockError(config, '帖子不存在', 404)
      // featured 字段不在 CommunityPost 类型中，此处仅作 OK 响应
      return mockResponse(config, { ...communityPosts[index], featured: body.featured })
    }

    // DELETE /community/posts/:id
    if (postMatch && method === 'DELETE') {
      const id = postMatch[1]
      const index = communityPosts.findIndex((p) => p.id === id)
      if (index === -1) return mockError(config, '帖子不存在', 404)
      communityPosts.splice(index, 1)
      return mockResponse(config, null)
    }

    // ═══════════════════════════════════════
    // Home Config (R+U)
    // ═══════════════════════════════════════
    // GET /home — 获取首页配置
    if (url === '/home' && method === 'GET') {
      return mockResponse(config, homeConfig)
    }

    // PUT /home — 更新首页配置
    if (url === '/home' && method === 'PUT') {
      const body = parseBody(config)
      homeConfig = { ...homeConfig, ...body }
      return mockResponse(config, homeConfig)
    }

    // ═══════════════════════════════════════
    // Dashboard
    // ═══════════════════════════════════════
    // GET /dashboard — 仪表盘统计
    if (url === '/dashboard' && method === 'GET') {
      return mockResponse(config, mockDashboard)
    }

    // ═══════════════════════════════════════
    // Users (R+U)
    // ═══════════════════════════════════════
    // GET /users — 列表（分页 + 筛选）
    if (url === '/users' && method === 'GET') {
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 10
      const keyword = params.keyword?.toLowerCase() || ''
      const status = params.status || ''
      let filtered = users
      if (keyword) {
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(keyword) ||
            u.email.toLowerCase().includes(keyword)
        )
      }
      if (status) {
        filtered = filtered.filter((u) => u.status === status)
      }
      // 按注册时间倒序
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      return mockResponse(config, paginate(filtered, page, pageSize))
    }

    // GET /users/:id
    const userMatch = url.match(/^\/users\/([^/]+)$/)
    if (userMatch && method === 'GET') {
      const id = userMatch[1]
      const user = users.find((u) => u.id === id)
      if (user) return mockResponse(config, user)
      return mockError(config, '用户不存在', 404)
    }

    // PATCH /users/:id/status — 封禁/解封
    const userStatusMatch = url.match(/^\/users\/([^/]+)\/status$/)
    if (userStatusMatch && method === 'PATCH') {
      const id = userStatusMatch[1]
      const body = parseBody(config)
      const index = users.findIndex((u) => u.id === id)
      if (index === -1) return mockError(config, '用户不存在', 404)
      users[index] = { ...users[index], status: body.status }
      return mockResponse(config, users[index])
    }

    // ═══════════════════════════════════════
    // Settings (R+U)
    // ═══════════════════════════════════════
    // GET /settings — 获取系统设置
    if (url === '/settings' && method === 'GET') {
      return mockResponse(config, appSettings)
    }

    // PUT /settings — 更新系统设置
    if (url === '/settings' && method === 'PUT') {
      const body = parseBody(config)
      appSettings = { ...appSettings, ...body }
      return mockResponse(config, appSettings)
    }

    // 非 Mock URL，正常放行
    return config
  })

  // 响应拦截器：将 Mock 错误转换为正常响应
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.isMock) {
        return Promise.resolve({
          status: error.status,
          statusText: error.statusText,
          data: error.data,
          headers: error.headers || {},
          config: error.config || {},
        })
      }
      return Promise.reject(error)
    }
  )
}

// 启动 Mock
setupMock(instance)
