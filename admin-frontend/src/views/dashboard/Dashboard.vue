<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { init, use, graphic, type ECharts } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { getDashboardStats } from '@/api/dashboard'
import type { DashboardData } from '@/types/dashboard'
import { useTheme } from '@/composables/useTheme'
import { ElMessage } from 'element-plus'
import {
  User,
  MapLocation,
  Guide,
  Goods,
  Microphone,
  Calendar,
  Tickets,
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

const loading = ref(false)
const data = ref<DashboardData | null>(null)

type DashboardStatKey = keyof DashboardData['stats']

interface DashboardStatCard {
  key: DashboardStatKey
  label: string
  icon: keyof typeof iconMap
  color: string
  softColor: string
}

const statCards: DashboardStatCard[] = [
  {
    key: 'totalUsers',
    label: 'Users',
    icon: 'User',
    color: 'var(--lt-primary)',
    softColor: 'color-mix(in srgb, var(--lt-primary) 16%, transparent)',
  },
  {
    key: 'totalCities',
    label: 'Cities',
    icon: 'MapLocation',
    color: 'var(--lt-success)',
    softColor: 'color-mix(in srgb, var(--lt-success) 16%, transparent)',
  },
  {
    key: 'totalRoutes',
    label: 'Published routes',
    icon: 'Guide',
    color: 'var(--lt-warning)',
    softColor: 'color-mix(in srgb, var(--lt-warning) 16%, transparent)',
  },
  {
    key: 'totalProducts',
    label: 'Shop products',
    icon: 'Goods',
    color: 'var(--lt-danger)',
    softColor: 'color-mix(in srgb, var(--lt-danger) 16%, transparent)',
  },
  {
    key: 'totalInterpreters',
    label: 'Interpreters',
    icon: 'Microphone',
    color: 'var(--lt-info)',
    softColor: 'color-mix(in srgb, var(--lt-info) 16%, transparent)',
  },
  {
    key: 'pendingBookings',
    label: 'Open bookings',
    icon: 'Calendar',
    color: 'var(--lt-warning)',
    softColor: 'color-mix(in srgb, var(--lt-warning) 16%, transparent)',
  },
  {
    key: 'pendingOrders',
    label: 'Open orders',
    icon: 'Tickets',
    color: 'var(--lt-route-mountain)',
    softColor: 'color-mix(in srgb, var(--lt-route-mountain) 16%, transparent)',
  },
]

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
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || 'Failed to load dashboard data')
  } finally {
    loading.value = false
  }
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
      data: ['Revenue (SGD)', 'Orders'],
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
        name: 'Revenue (SGD)',
        axisLabel: { formatter: '${value}' },
      },
      {
        type: 'value',
        name: 'Orders',
        min: 0,
        max: countMax,
        minInterval: 1,
      },
    ],
    series: [
      {
        name: 'Revenue (SGD)',
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
        name: 'Orders',
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
      data: ['Linked routes', 'Bookings'],
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
      name: 'Count',
    },
    series: [
      {
        name: 'Linked routes',
        type: 'bar',
        data: routeCounts,
        itemStyle: { color: palette.primary, borderRadius: [palette.radiusSm, palette.radiusSm, 0, 0] },
        barMaxWidth: 30,
      },
      {
        name: 'Bookings',
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
})
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <div class="page-header">
      <h2>Dashboard</h2>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div v-for="card in statCards" :key="card.key">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: card.softColor, color: card.color }">
              <el-icon :size="24">
                <component :is="iconMap[card.icon]" />
              </el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-value" :style="{ color: card.color }">
                {{ data?.stats?.[card.key] ?? '-' }}
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="charts-row">
      <!-- 近30天订单金额趋势 -->
      <el-col :span="24" style="margin-bottom: 16px">
        <el-card shadow="hover">
          <template #header>
            <span class="chart-title">📈 Orders in the last 30 days</span>
          </template>
          <div ref="trendChartRef" class="chart-container" style="height: 360px"></div>
        </el-card>
      </el-col>

      <!-- 口译预约模式分布 -->
      <el-col :xs="24" :md="12" style="margin-bottom: 16px">
        <el-card shadow="hover">
          <template #header>
            <span class="chart-title">🎯 Bookings by service mode</span>
          </template>
          <div ref="pieChartRef" class="chart-container" style="height: 320px"></div>
        </el-card>
      </el-col>

      <!-- 热门城市 Top5 -->
      <el-col :xs="24" :md="12" style="margin-bottom: 16px">
        <el-card shadow="hover">
          <template #header>
            <span class="chart-title">🏙️ Top five cities</span>
          </template>
          <div ref="barChartRef" class="chart-container" style="height: 320px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--lt-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-text {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: var(--lt-text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.charts-row {
  margin-top: 0;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--lt-text-primary);
}

.chart-container {
  width: 100%;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-value {
    font-size: 18px;
  }
}
</style>
