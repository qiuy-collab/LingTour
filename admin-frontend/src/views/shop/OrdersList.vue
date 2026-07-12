<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ordersApi } from '@/api/orders'
import { OrderStatusMap, OrderStatusColorMap, PaymentStatusMap, PaymentStatusColorMap } from '@/types/order'
import type { Order } from '@/types/order'
import { formatDateTime } from '@/utils/format'
import { pickI18n } from '@/types/common'
import { useListPage } from '@/composables/useListPage'
import { ListToolbar } from '@/components/list'

const router = useRouter()

const listPage = useListPage<Order>({
  fetchApi: (params) => ordersApi.getOrders(params as any),
  defaultFilters: {
    keyword: '',
    status: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
  },
})

const {
  loading, list, total, page, pageSize,
  filters,
  handleSearch,
  handlePageChange, handleSizeChange,
} = listPage

const dateRange = ref<[string, string]>(['', ''])

const statusOptions: { label: string; value: string }[] = Object.entries(OrderStatusMap).map(
  ([value, label]) => ({ label, value })
)

const paymentStatusOptions: { label: string; value: string }[] = Object.entries(PaymentStatusMap).map(
  ([value, label]) => ({ label, value })
)

function onDateRangeChange(val: [string, string] | null) {
  filters.startDate = val?.[0] ?? ''
  filters.endDate = val?.[1] ?? ''
  handleSearch()
}

function handleReset() {
  dateRange.value = ['', '']
  listPage.handleReset()
}

function handleViewDetail(id: string) {
  router.push(`/admin/orders/${id}`)
}

async function handleShip(row: Order) {
  try {
    await ElMessageBox.confirm(
      `Mark order ${row.orderNo} as shipped?`,
      'Confirm shipment',
      { type: 'info' }
    )
    await ordersApi.markShipped(row.id)
    row.status = 'shipped'
    ElMessage.success(`Order ${row.orderNo} marked as shipped`)
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Shipment update failed')
  }
}

async function handleRefund(row: Order) {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      'Enter a refund reason (optional)',
      'Confirm refund',
      {
        inputPlaceholder: 'Refund reason',
        inputType: 'textarea',
        confirmButtonText: 'Issue refund',
        cancelButtonText: 'Cancel',
      }
    )
    await ordersApi.markRefunded(row.id, reason || undefined)
    row.paymentStatus = 'refunded'
    ElMessage.success(`Refund issued for ${row.orderNo}`)
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Refund failed')
  }
}

function itemsSummary(items: Order['items']) {
  if (!items || !items.length) return '-'
  return items.map((i: any) => `${pickI18n(i.productName) || i.productName} ×${i.quantity}`).join('、')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2>Orders</h2>
    </div>

    <!-- 筛选栏 -->
    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="Search by order number or email"
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-select
        v-model="filters.status"
        placeholder="Fulfilment status"
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

      <el-select
        v-model="filters.paymentStatus"
        placeholder="Payment status"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option
          v-for="opt in paymentStatusOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="to"
        start-placeholder="Start date"
        end-placeholder="End date"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 260px"
        @change="onDateRangeChange"
      />
    </ListToolbar>

    <el-card shadow="never" class="table-card">
    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="orderNo" label="Order" width="180" />
      <el-table-column label="Customer" min-width="140">
        <template #default="{ row }">
          <div>{{ row.userName }}</div>
          <div style="font-size: 12px; color: #909399">{{ row.userEmail }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Items" min-width="220">
        <template #default="{ row }">
          <div class="items-summary">{{ itemsSummary(row.items) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Total" width="120" align="right">
        <template #default="{ row }">
          <div>
            <span style="font-weight: 600">{{ row.currency }} {{ row.total.toFixed(2) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Fulfilment" width="120" align="center">
        <template #default="{ row }">
          <el-tag
            :type="(OrderStatusColorMap as Record<string, string>)[row.status]"
            size="small"
          >
            {{ (OrderStatusMap as Record<string, string>)[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Payment" width="110" align="center">
        <template #default="{ row }">
          <el-tag
            :type="(PaymentStatusColorMap as Record<string, string>)[row.paymentStatus]"
            size="small"
          >
            {{ (PaymentStatusMap as Record<string, string>)[row.paymentStatus] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Placed" width="170">
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleViewDetail(row.id)">Details</el-button>
          <el-button
            v-if="row.status === 'confirmed' && row.paymentStatus === 'paid'"
            type="success"
            link
            size="small"
            @click="handleShip(row)"
          >
            Ship
          </el-button>
          <el-button
            v-if="row.paymentStatus === 'paid' && row.status !== 'cancelled'"
            type="warning"
            link
            size="small"
            @click="handleRefund(row)"
          >
            Refund
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
    </el-card>
  </div>
</template>

<style scoped>
.items-summary {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
</style>
