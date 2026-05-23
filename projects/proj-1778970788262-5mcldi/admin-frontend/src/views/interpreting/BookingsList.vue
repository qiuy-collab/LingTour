<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { bookingsApi } from '@/api/bookings'
import { interpretersApi } from '@/api/interpreters'
import type { Booking, BookingStatus } from '@/types/interpreting'
import type { Interpreter } from '@/types/interpreting'
import { BookingStatusMap, BookingStatusColorMap } from '@/types/interpreting'
import { pickI18n } from '@/types/common'
import { formatDateTime } from '@/utils/format'

const loading = ref(false)
const list = ref<Booking[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')
const dateFilter = ref('')
const keyword = ref('')

// Drawer
const drawerVisible = ref(false)
const selectedBooking = ref<Booking | null>(null)

// Interpreter assignment
const interpreters = ref<Interpreter[]>([])
const selectedInterpreterId = ref('')

async function fetchList() {
  loading.value = true
  try {
    const res = await bookingsApi.getBookings({
      page: page.value,
      pageSize: pageSize.value,
      status: statusFilter.value,
      date: dateFilter.value,
      keyword: keyword.value || undefined,
    } as any)
    list.value = res.data.data.items
    total.value = res.data.data.total
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '加载预约列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
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

// ─── Drawer operations ──────────────────
async function openDrawer(booking: Booking) {
  selectedBooking.value = booking
  drawerVisible.value = true

  if (booking.status === 'new' || booking.status === 'read' || booking.status === 'contacted' || booking.status === 'confirmed') {
    selectedInterpreterId.value = booking.assignedInterpreterId || ''
    try {
      const res = await interpretersApi.getInterpreters({
        page: 1,
        pageSize: 100,
        status: 'active',
      } as any)
      interpreters.value = res.data.data.items
    } catch {
      interpreters.value = []
    }
  }
}

async function refreshBooking() {
  if (!selectedBooking.value) return
  try {
    const res = await bookingsApi.getBooking(selectedBooking.value.id)
    selectedBooking.value = res.data.data
    // Also update in list
    const idx = list.value.findIndex((b) => b.id === selectedBooking.value!.id)
    if (idx >= 0) {
      list.value[idx] = { ...(selectedBooking.value as Booking) }
    }
  } catch {
    // ignore
  }
}

async function handleConfirm() {
  if (!selectedBooking.value) return
  try {
    await ElMessageBox.confirm('确定确认该预约?', '操作确认', { type: 'success' })
    await bookingsApi.confirmBooking(selectedBooking.value.id)
    ElMessage.success('预约已确认')
    await refreshBooking()
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '操作失败')
  }
}

async function handleAssignInterpreter() {
  if (!selectedBooking.value || !selectedInterpreterId.value) {
    ElMessage.warning('请选择口译员')
    return
  }
  try {
    await bookingsApi.assignInterpreter(selectedBooking.value.id, selectedInterpreterId.value)
    const interp = interpreters.value.find((i) => i.id === selectedInterpreterId.value)
    ElMessage.success(`已分配口译员:${interp ? pickI18n(interp.name) : selectedInterpreterId.value}`)
    await refreshBooking()
    fetchList()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '分配失败')
  }
}

async function handleComplete() {
  if (!selectedBooking.value) return
  try {
    await ElMessageBox.confirm('确定完成该预约?该操作不可撤销。', '操作确认', { type: 'success' })
    await bookingsApi.completeBooking(selectedBooking.value.id)
    ElMessage.success('预约已完成')
    await refreshBooking()
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '操作失败')
  }
}

async function handleCancelBooking() {
  if (!selectedBooking.value) return
  try {
    await ElMessageBox.confirm('确定取消该预约?', '操作确认', { type: 'warning' })
    await bookingsApi.cancelBooking(selectedBooking.value.id)
    ElMessage.success('预约已取消')
    await refreshBooking()
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '操作失败')
  }
}

function getBookingStatusColor(status: string): string {
  return BookingStatusColorMap[status as BookingStatus] || 'info'
}
function getBookingStatusLabel(status: string): string {
  return BookingStatusMap[status as BookingStatus] || status
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>口译预约管理</h2>
    </div>

    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索预约人/联系方式"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-input
        v-model="dateFilter"
        placeholder="预约日期 (YYYY-MM-DD)"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select
        v-model="statusFilter"
        placeholder="状态筛选"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="全部" value="" />
        <el-option label="新预约" value="new" />
        <el-option label="已读" value="read" />
        <el-option label="已联系" value="contacted" />
        <el-option label="已确认" value="confirmed" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
        <el-option label="待付定金" value="deposit_pending" />
        <el-option label="定金已付" value="deposit_paid" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="name" label="预约人" width="120" />
      <el-table-column prop="contact" label="联系方式" width="180" show-overflow-tooltip />
      <el-table-column prop="city" label="城市" width="80" align="center" />
      <el-table-column label="日期" width="110" align="center">
        <template #default="{ row }">{{ row.date }}</template>
      </el-table-column>
      <el-table-column prop="mode" label="服务模式" width="120" />
      <el-table-column prop="groupSize" label="人数" width="80" align="center" />
      <el-table-column label="快速通道" width="90" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.fastTrack" type="danger" size="small">快速</el-tag>
          <span v-else style="color: #c0c4cc">普通</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getBookingStatusColor(row.status)" size="small">
            {{ getBookingStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="分配口译员" min-width="120">
        <template #default="{ row }">
          <span v-if="row.assignedInterpreterName">{{ row.assignedInterpreterName }}</span>
          <span v-else style="color: #c0c4cc">未分配</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDrawer(row)">详情</el-button>
          <el-button
            v-if="row.status === 'new' || row.status === 'read' || row.status === 'contacted'"
            size="small"
            type="success"
            @click="async () => { selectedBooking = row; await handleConfirm() }"
          >
            确认
          </el-button>
          <el-popconfirm
            v-if="row.status === 'new' || row.status === 'read' || row.status === 'contacted' || row.status === 'confirmed'"
            title="确定取消该预约？"
            @confirm="async () => { selectedBooking = row; await handleCancelBooking() }"
          >
            <template #reference>
              <el-button size="small" type="warning">取消</el-button>
            </template>
          </el-popconfirm>
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

    <!-- Booking Detail Drawer -->
    <el-drawer
      v-model="drawerVisible"
      title="预约详情"
      size="520px"
      @closed="selectedBooking = null"
    >
      <template v-if="selectedBooking">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="预约人">
            {{ selectedBooking.name }}
          </el-descriptions-item>
          <el-descriptions-item label="联系方式">
            {{ selectedBooking.contact }}
          </el-descriptions-item>
          <el-descriptions-item label="预约城市">
            {{ selectedBooking.city }}
          </el-descriptions-item>
          <el-descriptions-item label="预约日期">
            {{ selectedBooking.date }}
          </el-descriptions-item>
          <el-descriptions-item label="服务模式">
            {{ selectedBooking.mode }}
          </el-descriptions-item>
          <el-descriptions-item label="人数">
            {{ selectedBooking.groupSize }}
          </el-descriptions-item>
          <el-descriptions-item label="快速通道">
            <el-tag v-if="selectedBooking.fastTrack" type="danger" size="small">是</el-tag>
            <span v-else>否</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(selectedBooking.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="getBookingStatusColor(selectedBooking.status)"
              size="small"
            >
              {{ getBookingStatusLabel(selectedBooking.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分配口译员">
            <span v-if="selectedBooking.assignedInterpreterName">
              {{ selectedBooking.assignedInterpreterName }}
            </span>
            <span v-else style="color: #c0c4cc">未分配</span>
          </el-descriptions-item>
          <el-descriptions-item label="特殊需求">
            <div style="white-space: pre-wrap">{{ selectedBooking.needs }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Interpreter assignment (only for active bookings) -->
        <div
          v-if="selectedBooking.status === 'new' || selectedBooking.status === 'read' || selectedBooking.status === 'contacted' || selectedBooking.status === 'confirmed'"
          style="margin-top: 20px"
        >
          <el-divider content-position="left">口译员分配</el-divider>
          <div style="display: flex; gap: 10px; align-items: center">
            <el-select
              v-model="selectedInterpreterId"
              placeholder="选择口译员"
              clearable
              style="flex: 1"
            >
              <el-option
                v-for="interp in interpreters"
                :key="interp.id"
                :label="`${pickI18n(interp.name)} (${pickI18n(interp.city)})`"
                :value="interp.id"
              >
                <div style="display: flex; justify-content: space-between">
                  <span>{{ pickI18n(interp.name) }}</span>
                  <span style="color: #909399; font-size: 12px">{{ pickI18n(interp.city) }}</span>
                </div>
              </el-option>
            </el-select>
            <el-button type="primary" @click="handleAssignInterpreter">分配</el-button>
          </div>
        </div>

        <!-- Action buttons -->
        <div style="margin-top: 24px; display: flex; gap: 10px; justify-content: flex-end">
          <template v-if="selectedBooking.status === 'new' || selectedBooking.status === 'read' || selectedBooking.status === 'contacted'">
            <el-button type="success" @click="handleConfirm">确认预约</el-button>
            <el-button type="warning" @click="handleCancelBooking">取消预约</el-button>
          </template>
          <template v-if="selectedBooking.status === 'confirmed'">
            <el-button type="success" @click="handleComplete">完成预约</el-button>
            <el-button type="warning" @click="handleCancelBooking">取消预约</el-button>
          </template>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
