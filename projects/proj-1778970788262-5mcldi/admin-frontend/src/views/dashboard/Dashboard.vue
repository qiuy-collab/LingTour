<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDashboardStats } from '@/api/dashboard'
import type { DashboardData } from '@/types/dashboard'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const data = ref<DashboardData | null>(null)

// ECharts 实例
const trendChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
const barChartRef = ref<HTMLDivElement>()
let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

async function fetchData() {
  loading.value = true
  try {
    const res = await getDashboardStats()
    data.value = res.data.data
    await nextTick()
    renderCharts()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '获取仪表盘数据失败')
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
  trendChart = echarts.init(trendChartRef.value)

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
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
          ]),
        },
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: counts,
        smooth: true,
        itemStyle: { color: '#67C23A' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' },
          ]),
        },
      },
    ],
  })
}

function renderPieChart() {
  if (!pieChartRef.value || !data.value) return
  if (pieChart) pieChart.dispose()
  pieChart = echarts.init(pieChartRef.value)

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
          borderRadius: 4,
          borderColor: '#fff',
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
        color: ['#409EFF', '#67C23A', '#E6A23C'],
      },
    ],
  })
}

function renderBarChart() {
  if (!barChartRef.value || !data.value) return
  if (barChart) barChart.dispose()
  barChart = echarts.init(barChartRef.value)

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
        itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 30,
      },
      {
        name: '口译预约',
        type: 'bar',
        data: bookingCounts,
        itemStyle: { color: '#E6A23C', borderRadius: [4, 4, 0, 0] },
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

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="8" :md="6" :lg="3" v-for="card in [
        { key: 'totalUsers', label: '用户总数', icon: 'User', color: '#409EFF' },
        { key: 'totalCities', label: '覆盖城市', icon: 'MapLocation', color: '#67C23A' },
        { key: 'totalRoutes', label: '已发布路线', icon: 'Guide', color: '#E6A23C' },
        { key: 'totalProducts', label: '商城商品', icon: 'Goods', color: '#F56C6C' },
        { key: 'totalInterpreters', label: '口译员', icon: 'Microphone', color: '#909399' },
        { key: 'pendingBookings', label: '待处理预约', icon: 'Calendar', color: '#FF9800' },
        { key: 'pendingOrders', label: '待处理订单', icon: 'Tickets', color: '#9C27B0' },
      ]" :key="card.key">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: card.color + '1a', color: card.color }">
              <el-icon :size="24">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-value" :style="{ color: card.color }">
                {{ data?.stats[card.key as keyof typeof data.stats] ?? '-' }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="charts-row">
      <!-- 近30天订单金额趋势 -->
      <el-col :span="24" style="margin-bottom: 16px">
        <el-card shadow="hover">
          <template #header>
            <span class="chart-title">📈 近30天订单趋势</span>
          </template>
          <div ref="trendChartRef" class="chart-container" style="height: 360px"></div>
        </el-card>
      </el-col>

      <!-- 口译预约模式分布 -->
      <el-col :xs="24" :md="12" style="margin-bottom: 16px">
        <el-card shadow="hover">
          <template #header>
            <span class="chart-title">🎯 口译预约按模式分布</span>
          </template>
          <div ref="pieChartRef" class="chart-container" style="height: 320px"></div>
        </el-card>
      </el-col>

      <!-- 热门城市 Top5 -->
      <el-col :xs="24" :md="12" style="margin-bottom: 16px">
        <el-card shadow="hover">
          <template #header>
            <span class="chart-title">🏙️ 热门城市 Top5</span>
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

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
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
  color: #909399;
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
}

.chart-container {
  width: 100%;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 18px;
  }
}
</style>
