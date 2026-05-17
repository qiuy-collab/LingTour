<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ordersApi } from '@/api/orders'
import { OrderStatusMap, OrderStatusColorMap } from '@/types/order'
import type { Order } from '@/types/order'

const router = useRouter()
const loading = ref(false)
const list = ref<Order[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')
const dateRange = ref<[string, string]>(['', ''])

const statusOptions: { label: string; value: string }[] = Object.entries(OrderStatusMap).map(
  ([value, label]) => ({ label, value })
)

async function fetchList() {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
    }
    if (statusFilter.value) params.status = statusFilter.value
    if (dateRange.value[0]) params.startDate = dateRange.value[0]
    if (dateRange.value[1]) params.endDate = dateRange.value[1]
    const res = await ordersApi.getOrders(params)
    list.value = res.data.data.items
    total.value = res.data.data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handleReset() {
  statusFilter.value = ''
  dateRange.value = ['', '']
  page.value = 1
  fetchList()
}

function handlePageChange(p: number) {
  page.value = p
  fetchList()
}

function handleSizeChange(s: number) {
  pageSize.value = s
  page.value = 1
  fetchList()
}

function handleViewDetail(id: string) {
  router.push(`/admin/orders/${id}`)
}

async function handleShip(row: Order) {
  try {
    await ElMessageBox.confirm(
      `确定将订单 ${row.orderNo} 标记为已发货？`,
      '确认发货',
      { type: 'info' }
    )
    await ordersApi.markShipped(row.id)
    row.status = 'shipped'
    ElMessage.success(`订单 ${row.orderNo} 已发货`)
  } catch { /* 取消 */ }
}

async function handleRefund(row: Order) {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入退款原因',
      '确认退款',
      { inputPlaceholder: '退款原因（可选）', inputType: 'textarea' }
    )
    await ordersApi.markRefunded(row.id, reason || undefined)
    row.status = 'refunded'
    ElMessage.success(`订单 ${row.orderNo} 已退款`)
  } catch { /* 取消 */ }
}

function formatDate(d: string) {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function itemsSummary(items: Order['items']) {
  return items.map((i) => `${i.productName} ×${i.quantity}`).join('、')
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>订单管理</h2>
    </div>

    <!-- 筛选栏 -->
    <div class="search-bar">
      <el-select
        v-model="statusFilter"
        placeholder="订单状态"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option
          v-for="opt in statusOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 260px"
        @change="handleSearch"
      />

      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column label="用户" min-width="140">
        <template #default="{ row }">
          <div>{{ row.userName }}</div>
          <div style="font-size: 12px; color: #909399">{{ row.userEmail }}</div>
        </template>
      </el-table-column>
      <el-table-column label="商品明细" min-width="220">
        <template #default="{ row }">
          <div class="items-summary">{{ itemsSummary(row.items) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="120" align="right">
        <template #default="{ row }">
          <div>
            <span style="font-weight: 600">{{ row.currency }} {{ row.total.toFixed(2) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="(OrderStatusColorMap as Record<string, string>)[row.status]"
            size="small"
          >
            {{ (OrderStatusMap as Record<string, string>)[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" width="170">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleViewDetail(row.id)">详情</el-button>
          <el-button
            v-if="row.status === 'paid'"
            size="small"
            type="success"
            @click="handleShip(row)"
          >
            发货
          </el-button>
          <el-button
            v-if="row.status === 'paid' || row.status === 'shipped'"
            size="small"
            type="warning"
            @click="handleRefund(row)"
          >
            退款
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
.items-summary {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
</style>
