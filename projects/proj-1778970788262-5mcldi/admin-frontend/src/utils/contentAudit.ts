import { citiesApi } from '@/api/cities'
import { routesApi } from '@/api/routes'
import { productsApi } from '@/api/products'
import { eventsApi } from '@/api/events'
import { collectionsApi } from '@/api/collections'
import { homeApi } from '@/api/home'
import { pickI18n } from '@/types/common'

type Severity = 'error' | 'warning'
type Domain = 'city' | 'route' | 'collection' | 'product' | 'event' | 'home'

export interface AuditIssue {
  id: string
  severity: Severity
  domain: Domain
  entityId?: string
  entityTitle: string
  message: string
  suggestion: string
  path: string
}

export interface AuditSummary {
  total: number
  errors: number
  warnings: number
  affectedEntities: number
}

export interface AuditReport {
  summary: AuditSummary
  issues: AuditIssue[]
  generatedAt: string
}

function hasText(value: unknown) {
  if (!value) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'object') return pickI18n(value).trim().length > 0
  return String(value).trim().length > 0
}

function countEntityKeys(issues: AuditIssue[]) {
  return new Set(issues.map((issue) => `${issue.domain}:${issue.entityId || issue.path}`)).size
}

function createIssue(input: Omit<AuditIssue, 'id'>): AuditIssue {
  return {
    ...input,
    id: `${input.domain}:${input.entityId || input.path}:${input.message}`,
  }
}

export async function runContentAudit(): Promise<AuditReport> {
  const [citiesRes, routesRes, collectionsRes, productsRes, eventsRes, homeRes] = await Promise.all([
    citiesApi.getCities({ page: 1, pageSize: 200 }),
    routesApi.getRoutes({ page: 1, pageSize: 200 }),
    collectionsApi.getCollections({ page: 1, pageSize: 200 }),
    productsApi.getProducts({ page: 1, pageSize: 200 }),
    eventsApi.getEvents({ page: 1, pageSize: 200 }),
    homeApi.getHomeConfig(),
  ])

  const cities = citiesRes.data.data.data || []
  const routes = routesRes.data.data.data || []
  const collections = collectionsRes.data.data.data || []
  const products = productsRes.data.data.data || []
  const events = eventsRes.data.data.data || []
  const home = homeRes.data.data

  const citySlugSet = new Set(cities.map((item: any) => item.slug).filter(Boolean))
  const routeSlugSet = new Set(routes.map((item: any) => item.slug).filter(Boolean))
  const collectionIdSet = new Set(collections.map((item: any) => item.id).filter(Boolean))
  const issues: AuditIssue[] = []

  for (const city of cities) {
    const title = pickI18n(city.name) || city.slug
    const path = `/admin/cities/${city.id}/edit`

    if (city.published && !city.heroImage) {
      issues.push(createIssue({
        severity: 'error',
        domain: 'city',
        entityId: city.id,
        entityTitle: title,
        message: '已发布城市缺少首页主图',
        suggestion: '补充 Overview 主图，否则前台首屏会缺图。',
        path,
      }))
    }

    if (city.published && !hasText(city.heroNarrative)) {
      issues.push(createIssue({
        severity: 'warning',
        domain: 'city',
        entityId: city.id,
        entityTitle: title,
        message: '已发布城市缺少 Overview 文案',
        suggestion: '补充城市导语，前台城市页首屏信息会更完整。',
        path,
      }))
    }

    if (city.published && (!Array.isArray(city.sections) || city.sections.length === 0)) {
      issues.push(createIssue({
        severity: 'warning',
        domain: 'city',
        entityId: city.id,
        entityTitle: title,
        message: '已发布城市没有 Section 内容',
        suggestion: '至少补充一个内容分段，避免城市页主体过空。',
        path,
      }))
    }

    for (const routeSlug of city.routeSlugs || []) {
      if (!routeSlugSet.has(routeSlug)) {
        issues.push(createIssue({
          severity: 'error',
          domain: 'city',
          entityId: city.id,
          entityTitle: title,
          message: `关联路线 slug 不存在：${routeSlug}`,
          suggestion: '修正 routeSlugs，或先创建对应路线。',
          path,
        }))
      }
    }

    for (const relatedCitySlug of city.relatedCitySlugs || []) {
      if (!citySlugSet.has(relatedCitySlug)) {
        issues.push(createIssue({
          severity: 'warning',
          domain: 'city',
          entityId: city.id,
          entityTitle: title,
          message: `关联城市 slug 不存在：${relatedCitySlug}`,
          suggestion: '清理 relatedCitySlugs，避免前台联动卡片出现空链接。',
          path,
        }))
      }
    }
  }

  for (const route of routes) {
    const title = pickI18n(route.title) || route.slug
    const path = `/admin/routes/${route.id}/edit`

    if (route.published && !route.coverImage) {
      issues.push(createIssue({
        severity: 'error',
        domain: 'route',
        entityId: route.id,
        entityTitle: title,
        message: '已发布路线缺少封面图',
        suggestion: '补充路线封面，否则路线页和首页推荐位展示不完整。',
        path,
      }))
    }

    if (route.published && (!Array.isArray(route.stops) || route.stops.length === 0)) {
      issues.push(createIssue({
        severity: 'error',
        domain: 'route',
        entityId: route.id,
        entityTitle: title,
        message: '已发布路线没有站点',
        suggestion: '至少配置一个站点，前台路线行程无法正常渲染。',
        path,
      }))
    }

    if (route.published && !hasText(route.summary)) {
      issues.push(createIssue({
        severity: 'warning',
        domain: 'route',
        entityId: route.id,
        entityTitle: title,
        message: '已发布路线缺少摘要',
        suggestion: '补充摘要，便于列表页和推荐位快速理解路线。',
        path,
      }))
    }

    for (const citySlug of route.citySlugs || []) {
      if (!citySlugSet.has(citySlug)) {
        issues.push(createIssue({
          severity: 'error',
          domain: 'route',
          entityId: route.id,
          entityTitle: title,
          message: `关联城市 slug 不存在：${citySlug}`,
          suggestion: '修正 citySlugs，避免前台路线与城市无法联动。',
          path,
        }))
      }
    }

    ;(route.stops || []).forEach((stop: any, index: number) => {
      if (!hasText(stop.stopName)) {
        issues.push(createIssue({
          severity: 'warning',
          domain: 'route',
          entityId: route.id,
          entityTitle: title,
          message: `第 ${index + 1} 个站点缺少名称`,
          suggestion: '补充 stopName，避免前台行程节点出现空标题。',
          path,
        }))
      }

      if (!stop.image) {
        issues.push(createIssue({
          severity: 'warning',
          domain: 'route',
          entityId: route.id,
          entityTitle: title,
          message: `第 ${index + 1} 个站点缺少图片`,
          suggestion: '补充站点图片，提升路线页的可读性与转化。',
          path,
        }))
      }
    })
  }

  for (const collection of collections) {
    const title = pickI18n(collection.title) || collection.slug
    const path = `/admin/shop/collections/${collection.id}/edit`

    if (collection.routeSlug && !routeSlugSet.has(collection.routeSlug)) {
      issues.push(createIssue({
        severity: 'error',
        domain: 'collection',
        entityId: collection.id,
        entityTitle: title,
        message: `系列关联路线不存在：${collection.routeSlug}`,
        suggestion: '修正 routeSlug，避免商城系列与路线故事断链。',
        path,
      }))
    }
  }

  for (const product of products) {
    const title = pickI18n(product.name) || product.slug
    const path = `/admin/shop/products/${product.id}/edit`

    if (product.published && !product.image) {
      issues.push(createIssue({
        severity: 'error',
        domain: 'product',
        entityId: product.id,
        entityTitle: title,
        message: '已上架商品缺少主图',
        suggestion: '补充商品主图，避免商品列表和详情页空白。',
        path,
      }))
    }

    if (product.published && !hasText(product.story)) {
      issues.push(createIssue({
        severity: 'warning',
        domain: 'product',
        entityId: product.id,
        entityTitle: title,
        message: '已上架商品缺少故事文案',
        suggestion: '补充 story，前台商品详情页会更完整。',
        path,
      }))
    }

    if (product.collectionId && !collectionIdSet.has(product.collectionId)) {
      issues.push(createIssue({
        severity: 'error',
        domain: 'product',
        entityId: product.id,
        entityTitle: title,
        message: '商品关联系列不存在',
        suggestion: '重新选择 collectionId，避免商城分类页异常。',
        path,
      }))
    }

    if (product.originTrace?.citySlug && !citySlugSet.has(product.originTrace.citySlug)) {
      issues.push(createIssue({
        severity: 'warning',
        domain: 'product',
        entityId: product.id,
        entityTitle: title,
        message: `商品产地城市不存在：${product.originTrace.citySlug}`,
        suggestion: '改用现有城市，确保前台溯源信息可联动。',
        path,
      }))
    }

    if (product.published && Number(product.stock || 0) <= 0) {
      issues.push(createIssue({
        severity: 'warning',
        domain: 'product',
        entityId: product.id,
        entityTitle: title,
        message: '已上架商品库存为 0',
        suggestion: '确认是否需要下架，或同步真实库存。',
        path,
      }))
    }
  }

  for (const event of events) {
    const title = pickI18n(event.title) || event.id
    const path = `/admin/events/${event.id}/edit`

    if (event.status !== 'draft' && !event.image) {
      issues.push(createIssue({
        severity: 'warning',
        domain: 'event',
        entityId: event.id,
        entityTitle: title,
        message: '非草稿活动缺少封面图',
        suggestion: '补充活动封面，避免活动列表和日历入口观感不完整。',
        path,
      }))
    }

    if (event.citySlug && !citySlugSet.has(event.citySlug)) {
      issues.push(createIssue({
        severity: 'error',
        domain: 'event',
        entityId: event.id,
        entityTitle: title,
        message: `活动城市 slug 不存在：${event.citySlug}`,
        suggestion: '重新选择活动城市，避免前台城市活动聚合异常。',
        path,
      }))
    }

    if (event.endDate && event.endDate < event.date) {
      issues.push(createIssue({
        severity: 'error',
        domain: 'event',
        entityId: event.id,
        entityTitle: title,
        message: '活动结束日期早于开始日期',
        suggestion: '修正日期区间，避免前台活动时间展示错误。',
        path,
      }))
    }

    for (const routeSlug of event.relatedRouteSlugs || []) {
      if (!routeSlugSet.has(routeSlug)) {
        issues.push(createIssue({
          severity: 'warning',
          domain: 'event',
          entityId: event.id,
          entityTitle: title,
          message: `关联路线 slug 不存在：${routeSlug}`,
          suggestion: '从现有路线中重新选择关联项。',
          path,
        }))
      }
    }
  }

  for (const routeSlug of home.featuredRoutes || []) {
    if (!routeSlugSet.has(routeSlug)) {
      issues.push(createIssue({
        severity: 'error',
        domain: 'home',
        entityTitle: '首页配置',
        message: `精选路线不存在：${routeSlug}`,
        suggestion: '清理 featuredRoutes 中失效的 slug。',
        path: '/admin/home',
      }))
    }
  }

  ;(home.cultureHighlights || []).forEach((item: any, index: number) => {
    if (item.citySlug && !citySlugSet.has(item.citySlug)) {
      issues.push(createIssue({
        severity: 'warning',
        domain: 'home',
        entityTitle: '首页配置',
        message: `文化亮点 #${index + 1} 的城市不存在：${item.citySlug}`,
        suggestion: '从现有城市中重新选择 citySlug。',
        path: '/admin/home',
      }))
    }
  })

  return {
    summary: {
      total: issues.length,
      errors: issues.filter((issue) => issue.severity === 'error').length,
      warnings: issues.filter((issue) => issue.severity === 'warning').length,
      affectedEntities: countEntityKeys(issues),
    },
    issues,
    generatedAt: new Date().toISOString(),
  }
}
