<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { init, use, graphic, type ECharts } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { getDashboardStats } from '@/api/dashboard'
import type { DashboardData } from '@/types/dashboard'
import { useTheme } from '@/composables/useTheme'
import { ElMessage } from 'element-plus'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '@/utils/motion'
import OperationsGuide from '@/components/OperationsGuide.vue'
import {
  User,
  MapLocation,
  Guide,
  Goods,
  Microphone,
  Calendar,
  Tickets,
  Picture,
  ArrowRight,
} from '@element-plus/icons-vue'

use([
  LineChart,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
])

const iconMap: Record<string, any> = { User, MapLocation, Guide, Goods, Microphone, Calendar, Tickets }
const { isDark } = useTheme()
const router = useRouter()

const loading = ref(false)
const data = ref<DashboardData | null>(null)
const dashboardRoot = ref<HTMLElement>()
let dashboardMotionContext: gsap.Context | undefined

type DashboardStatKey = keyof DashboardData['stats']

interface DashboardStatCard {
  key: DashboardStatKey
  label: string
  icon: keyof typeof iconMap
  color: string
  softColor: string
  path: string
}

const statCards: DashboardStatCard[] = [
  {
    key: 'totalUsers',
    label: '用户总数',
    icon: 'User',
    color: 'var(--lt-primary)',
    softColor: 'color-mix(in srgb, var(--lt-primary) 16%, transparent)',
    path: '/admin/users',
  },
  {
    key: 'totalCities',
    label: '覆盖城市',
    icon: 'MapLocation',
    color: 'var(--lt-success)',
    softColor: 'color-mix(in srgb, var(--lt-success) 16%, transparent)',
    path: '/admin/cities',
  },
  {
    key: 'totalRoutes',
    label: '已发布路线',
    icon: 'Guide',
    color: 'var(--lt-warning)',
    softColor: 'color-mix(in srgb, var(--lt-warning) 16%, transparent)',
    path: '/admin/routes',
  },
  {
    key: 'totalProducts',
    label: '商城商品',
    icon: 'Goods',
    color: 'var(--lt-danger)',
    softColor: 'color-mix(in srgb, var(--lt-danger) 16%, transparent)',
    path: '/admin/shop/products',
  },
  {
    key: 'totalInterpreters',
    label: '口译员',
    icon: 'Microphone',
    color: 'var(--lt-info)',
    softColor: 'color-mix(in srgb, var(--lt-info) 16%, transparent)',
    path: '/admin/interpreting/profiles',
  },
  {
    key: 'pendingBookings',
    label: '待处理预约',
    icon: 'Calendar',
    color: 'var(--lt-warning)',
    softColor: 'color-mix(in srgb, var(--lt-warning) 16%, transparent)',
    path: '/admin/interpreting/bookings',
  },
  {
    key: 'pendingOrders',
    label: '待处理订单',
    icon: 'Tickets',
    color: 'var(--lt-route-mountain)',
    softColor: 'color-mix(in srgb, var(--lt-route-mountain) 16%, transparent)',
    path: '/admin/orders',
  },
]

const quickActions = [
  { label: '新建路线', hint: '规划新的文化旅程', path: '/admin/routes/create', icon: Guide },
  { label: '新建商品', hint: '录入商品与视频媒体', path: '/admin/shop/products/create', icon: Goods },
  { label: '媒体库', hint: '管理图片与视频素材', path: '/admin/media', icon: Picture },
]

const todayLabel = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(new Date())

const pendingTotal = computed(() =>
  (data.value?.stats.pendingBookings || 0) + (data.value?.stats.pendingOrders || 0),
)

const publishedTotal = computed(() =>
  (data.value?.stats.totalCities || 0)
  + (data.value?.stats.totalRoutes || 0)
  + (data.value?.stats.totalProducts || 0),
)

function resolveThemeColor(token: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  return value || fallback
}

function resolveThemeRadius(token: string, fallback: number) {
  const rawValue = resolveThemeColor(token, `${fallback}px`)
  const parsed = Number.parseFloat(rawValue)
  return Number.isFinite(parsed) ? parsed : fallback
}

function withAlpha(hexColor: string, alpha: number) {
  const normalized = hexColor.replace('#', '').trim()
  const expanded = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized

  if (expanded.length !== 6) {
    return hexColor
  }

  const red = Number.parseInt(expanded.slice(0, 2), 16)
  const green = Number.parseInt(expanded.slice(2, 4), 16)
  const blue = Number.parseInt(expanded.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function getDashboardPalette() {
  const primary = resolveThemeColor('--lt-primary', '#409eff')
  const success = resolveThemeColor('--lt-success', '#67c23a')
  const warning = resolveThemeColor('--lt-warning', '#e6a23c')
  const info = resolveThemeColor('--lt-info', '#909399')
  const cardBackground = resolveThemeColor('--lt-bg-card', '#ffffff')
  const radiusSm = resolveThemeRadius('--lt-radius-sm', 6)

  return {
    primary,
    success,
    warning,
    info,
    cardBackground,
    radiusSm,
    primaryStrong: withAlpha(primary, 0.3),
    primarySoft: withAlpha(primary, 0.05),
    successStrong: withAlpha(success, 0.3),
    successSoft: withAlpha(success, 0.05),
  }
}

// ECharts 实例
const trendChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
const barChartRef = ref<HTMLDivElement>()
let trendChart: ECharts | null = null
let pieChart: ECharts | null = null
let barChart: ECharts | null = null

async function fetchData() {
  loading.value = true
  try {
    data.value = await getDashboardStats()
    await nextTick()
    renderCharts()
    animateDashboardData()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '获取仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

function animateDashboardData() {
  if (!dashboardRoot.value || prefersReducedMotion()) return

  dashboardMotionContext?.revert()
  dashboardMotionContext = gsap.context(() => {
    gsap.fromTo(
      '.stat-card',
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.46,
        stagger: 0.045,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
    )
    gsap.fromTo(
      '.chart-card',
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.52,
        stagger: 0.08,
        delay: 0.12,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
    )
  }, dashboardRoot.value)
}

function renderCharts() {
  if (!data.value) return
  renderTrendChart()
  renderPieChart()
  renderBarChart()
}

function renderTrendChart() {
  if (!trendChartRef.value || !data.value) return
  if (trendChart) trendChart.dispose()
  trendChart = init(trendChartRef.value)
  const palette = getDashboardPalette()

  const dates = data.value.orderTrend.map((t) => t.date.slice(5)) // MM-DD
  const amounts = data.value.orderTrend.map((t) => t.amount)
  const counts = data.value.orderTrend.map((t) => t.count)
  // yAxis 上限根据数据动态计算,避免硬编码截断
  const maxCount = Math.max(0, ...counts)
  const countMax = Math.max(5, Math.ceil((maxCount + 1) / 5) * 5)

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['订单金额 (SGD)', '订单数'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: [
      {
        type: 'value',
        name: '金额 (SGD)',
        axisLabel: { formatter: '${value}' },
      },
      {
        type: 'value',
        name: '订单数',
        min: 0,
        max: countMax,
        minInterval: 1,
      },
    ],
    series: [
      {
        name: '订单金额 (SGD)',
        type: 'line',
        data: amounts,
        smooth: true,
        itemStyle: { color: palette.primary },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: palette.primaryStrong },
            { offset: 1, color: palette.primarySoft },
          ]),
        },
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: counts,
        smooth: true,
        itemStyle: { color: palette.success },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: palette.successStrong },
            { offset: 1, color: palette.successSoft },
          ]),
        },
      },
    ],
  })
}

function renderPieChart() {
  if (!pieChartRef.value || !data.value) return
  if (pieChart) pieChart.dispose()
  pieChart = init(pieChartRef.value)
  const palette = getDashboardPalette()

  const pieData = data.value.bookingModeDist.map((item) => ({
    name: item.mode,
    value: item.count,
  }))

  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: palette.radiusSm,
          borderColor: palette.cardBackground,
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
        },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: pieData,
        color: [palette.primary, palette.success, palette.warning],
      },
    ],
  })
}

function renderBarChart() {
  if (!barChartRef.value || !data.value) return
  if (barChart) barChart.dispose()
  barChart = init(barChartRef.value)
  const palette = getDashboardPalette()

  const cities = data.value.topCities.map((c) => c.city)
  const routeCounts = data.value.topCities.map((c) => c.routeCount)
  const bookingCounts = data.value.topCities.map((c) => c.bookingCount)

  barChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['关联路线', '口译预约'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: cities,
    },
    yAxis: {
      type: 'value',
      name: '数量',
    },
    series: [
      {
        name: '关联路线',
        type: 'bar',
        data: routeCounts,
        itemStyle: { color: palette.primary, borderRadius: [palette.radiusSm, palette.radiusSm, 0, 0] },
        barMaxWidth: 30,
      },
      {
        name: '口译预约',
        type: 'bar',
        data: bookingCounts,
        itemStyle: { color: palette.warning, borderRadius: [palette.radiusSm, palette.radiusSm, 0, 0] },
        barMaxWidth: 30,
      },
    ],
  })
}

// 响应式图表
function handleResize() {
  trendChart?.resize()
  pieChart?.resize()
  barChart?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

watch(isDark, async () => {
  if (!data.value) return
  await nextTick()
  renderCharts()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
  barChart?.dispose()
  dashboardMotionContext?.revert()
})
</script>

<template>
  <div ref="dashboardRoot" class="dashboard" v-loading="loading">
    <section class="dashboard-intro">
      <div class="intro-copy">
        <p class="intro-eyebrow">线上实时数据 · {{ todayLabel }}</p>
        <h2>今日待办与内容状态</h2>
        <p>快速查看待处理预约、订单和已发布内容。</p>
      </div>
      <div class="intro-signal">
        <span>待处理事项</span>
        <strong>{{ data ? pendingTotal : '—' }}</strong>
        <small>{{ publishedTotal }} 项内容资产在线</small>
      </div>
    </section>

    <OperationsGuide />

    <nav class="quick-actions" aria-label="快捷操作">
      <button
        v-for="action in quickActions"
        :key="action.path"
        type="button"
        class="quick-action"
        @click="router.push(action.path)"
      >
        <span class="quick-action__icon"><el-icon><component :is="action.icon" /></el-icon></span>
        <span class="quick-action__copy">
          <strong>{{ action.label }}</strong>
          <small>{{ action.hint }}</small>
        </span>
        <el-icon class="quick-action__arrow"><ArrowRight /></el-icon>
      </button>
    </nav>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <button
        v-for="card in statCards"
        :key="card.key"
        type="button"
        class="stat-card"
        @click="router.push(card.path)"
      >
        <div class="stat-card__top">
          <span class="stat-icon" :style="{ background: card.softColor, color: card.color }">
            <el-icon :size="20"><component :is="iconMap[card.icon]" /></el-icon>
          </span>
          <el-icon class="stat-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="stat-text">
          <span class="stat-label">{{ card.label }}</span>
          <strong class="stat-value">{{ data?.stats?.[card.key] ?? '—' }}</strong>
          <small>实时汇总</small>
        </div>
      </button>
    </div>

    <section class="chart-grid" aria-label="运营趋势">
      <article class="chart-card chart-card--wide">
        <header class="chart-header">
          <div>
            <span>近 30 天</span>
            <h3>订单趋势</h3>
          </div>
          <p>金额与订单量的联合变化</p>
        </header>
        <div ref="trendChartRef" class="chart-container chart-container--trend" />
      </article>

      <article class="chart-card">
        <header class="chart-header">
          <div>
            <span>服务构成</span>
            <h3>口译预约分布</h3>
          </div>
          <p>按服务模式拆分</p>
        </header>
        <div ref="pieChartRef" class="chart-container" />
      </article>

      <article class="chart-card">
        <header class="chart-header">
          <div>
            <span>目的地热度</span>
            <h3>热门城市 Top 5</h3>
          </div>
          <p>路线与预约热度</p>
        </header>
        <div ref="barChartRef" class="chart-container" />
      </article>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-intro {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: end;
  overflow: hidden;
  margin-bottom: 18px;
  padding: clamp(24px, 3vw, 42px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--lt-radius-xl);
  background:
    radial-gradient(circle at 82% 16%, rgba(113, 180, 160, 0.2), transparent 18rem),
    linear-gradient(135deg, #183229, #10211a 72%);
  color: #eef5f1;
  box-shadow: var(--lt-shadow-md);
}

.dashboard-intro::after {
  position: absolute;
  right: -7rem;
  bottom: -12rem;
  width: 25rem;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
  box-shadow: 0 0 0 56px rgba(255, 255, 255, 0.018);
  content: '';
  pointer-events: none;
}

.intro-copy,
.intro-signal {
  position: relative;
  z-index: 1;
}

.intro-eyebrow {
  margin: 0 0 16px;
  color: #d6aa68;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.13em;
}

.intro-copy h2 {
  max-width: 720px;
  margin: 0;
  font-size: clamp(30px, 3.6vw, 52px);
  font-weight: 520;
  letter-spacing: -0.055em;
  line-height: 1.08;
}

.intro-copy > p:last-child {
  margin: 18px 0 0;
  color: rgba(230, 240, 234, 0.62);
  font-size: 13px;
  line-height: 1.7;
}

.intro-signal {
  display: grid;
  min-width: 170px;
  padding-left: 24px;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
}

.intro-signal span,
.intro-signal small {
  color: rgba(230, 240, 234, 0.52);
  font-size: 10px;
}

.intro-signal strong {
  margin: 5px 0 9px;
  font-size: clamp(38px, 4vw, 58px);
  font-weight: 560;
  letter-spacing: -0.05em;
  line-height: 1;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.quick-action {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-lg);
  background: var(--lt-bg-card);
  color: var(--lt-text-primary);
  text-align: left;
  cursor: pointer;
  box-shadow: var(--lt-shadow-sm);
  transition: transform 220ms var(--lt-ease-out), border-color 180ms ease, box-shadow 220ms ease;
}

.quick-action:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--lt-primary) 34%, var(--lt-border-color));
  box-shadow: var(--lt-shadow-md);
}

.quick-action__icon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--lt-primary-soft);
  color: var(--lt-primary);
}

.quick-action__copy {
  display: grid;
  min-width: 0;
}

.quick-action__copy strong {
  font-size: 13px;
}

.quick-action__copy small {
  overflow: hidden;
  margin-top: 3px;
  color: var(--lt-text-secondary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-action__arrow,
.stat-arrow {
  color: var(--lt-text-placeholder);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.stat-card {
  display: grid;
  min-width: 0;
  min-height: 164px;
  padding: 17px;
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-lg);
  background: var(--lt-bg-card);
  color: var(--lt-text-primary);
  text-align: left;
  cursor: pointer;
  box-shadow: var(--lt-shadow-sm);
  transition: transform 220ms var(--lt-ease-out), border-color 180ms ease, box-shadow 220ms ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--lt-primary) 30%, var(--lt-border-color));
  box-shadow: var(--lt-shadow-md);
}

.stat-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.stat-icon {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-text {
  display: grid;
  align-self: end;
}

.stat-label {
  color: var(--lt-text-secondary);
  font-size: 11px;
}

.stat-value {
  margin-top: 5px;
  font-size: 30px;
  font-weight: 650;
  letter-spacing: -0.04em;
  line-height: 1;
}

.stat-text small {
  margin-top: 7px;
  color: var(--lt-text-placeholder);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.chart-card {
  min-width: 0;
  padding: clamp(18px, 2vw, 26px);
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-xl);
  background: var(--lt-bg-card);
  box-shadow: var(--lt-shadow-sm);
}

.chart-card--wide {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.chart-header span {
  color: var(--lt-primary);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.13em;
}

.chart-header h3 {
  margin: 6px 0 0;
  color: var(--lt-text-primary);
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.025em;
}

.chart-header p {
  margin: 0;
  color: var(--lt-text-secondary);
  font-size: 10px;
}

.chart-container {
  width: 100%;
  height: 310px;
}

.chart-container--trend {
  height: 350px;
}

@media (max-width: 1180px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-intro {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 24px 20px;
  }

  .intro-copy h2 {
    font-size: 32px;
  }

  .intro-signal {
    grid-template-columns: 1fr auto;
    align-items: end;
    padding: 18px 0 0;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    border-left: 0;
  }

  .intro-signal strong {
    grid-row: 1 / 3;
    grid-column: 2;
  }

  .quick-actions {
    display: flex;
    overflow-x: auto;
    margin-inline: -14px;
    padding-inline: 14px;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
  }

  .quick-action {
    min-width: min(82vw, 300px);
    scroll-snap-align: start;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card {
    min-height: 148px;
    padding: 15px;
  }

  .stat-value {
    font-size: 26px;
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }

  .chart-card--wide {
    grid-column: auto;
  }

  .chart-container,
  .chart-container--trend {
    height: 280px;
  }

  .chart-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
