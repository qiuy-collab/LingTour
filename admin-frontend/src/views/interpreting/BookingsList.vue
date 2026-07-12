<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { bookingsApi } from '@/api/bookings'
import { interpretersApi } from '@/api/interpreters'
import type { Booking, BookingStatus } from '@/types/interpreting'
import type { Interpreter } from '@/types/interpreting'
import { BookingStatusMap, BookingStatusColorMap } from '@/types/interpreting'
import { pickI18n } from '@/types/common'
import { formatDateTime } from '@/utils/format'
import { useListPage } from '@/composables/useListPage'
import { ListToolbar } from '@/components/list'

// List data
const {
  loading, list, total, page, pageSize,
  filters,
  fetchList,
  handlePageChange, handleSizeChange,
  handleSearch, handleReset,
} = useListPage<Booking>({
  fetchApi: (params) => bookingsApi.getBookings(params as any),
  defaultFilters: { keyword: '', status: '', date: '' },
})

// Drawer
const drawerVisible = ref(false)
const selectedBooking = ref<Booking | null>(null)

// Interpreter assignment
const interpreters = ref<Interpreter[]>([])
const selectedInterpreterId = ref('')

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
      interpreters.value = res.data.data.data
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
    await ElMessageBox.confirm('Confirm this booking?', 'Confirm booking', { type: 'success' })
    await bookingsApi.confirmBooking(selectedBooking.value.id)
    ElMessage.success('Booking confirmed')
    await refreshBooking()
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Action failed')
  }
}

async function handleAssignInterpreter() {
  if (!selectedBooking.value || !selectedInterpreterId.value) {
    ElMessage.warning('Select an interpreter first')
    return
  }
  try {
    await bookingsApi.assignInterpreter(selectedBooking.value.id, selectedInterpreterId.value)
    const interp = interpreters.value.find((i) => i.id === selectedInterpreterId.value)
    ElMessage.success(`Assigned interpreter: ${interp ? pickI18n(interp.name) : selectedInterpreterId.value}`)
    await refreshBooking()
    fetchList()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || 'Assignment failed')
  }
}

async function handleComplete() {
  if (!selectedBooking.value) return
  try {
    await ElMessageBox.confirm('Complete this booking? This action cannot be undone.', 'Confirm completion', { type: 'success' })
    await bookingsApi.completeBooking(selectedBooking.value.id)
    ElMessage.success('Booking completed')
    await refreshBooking()
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Action failed')
  }
}

async function handleCancelBooking() {
  if (!selectedBooking.value) return
  try {
    await ElMessageBox.confirm('Cancel this booking?', 'Confirm cancellation', { type: 'warning' })
    await bookingsApi.cancelBooking(selectedBooking.value.id)
    ElMessage.success('Booking cancelled')
    await refreshBooking()
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Action failed')
  }
}

function getBookingStatusColor(status: string): string {
  return BookingStatusColorMap[status as BookingStatus] || 'info'
}
function getBookingStatusLabel(status: string): string {
  return BookingStatusMap[status as BookingStatus] || status
}

</script>

<template>
  <div>
    <div class="page-header">
      <h2>Interpreting bookings</h2>
    </div>

    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="Search by guest or contact"
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-input
        v-model="filters.date"
        placeholder="Booking date (YYYY-MM-DD)"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select
        v-model="filters.status"
        placeholder="Status"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="All" value="" />
        <el-option label="New" value="new" />
        <el-option label="Read" value="read" />
        <el-option label="Contacted" value="contacted" />
        <el-option label="Confirmed" value="confirmed" />
        <el-option label="Completed" value="completed" />
        <el-option label="Cancelled" value="cancelled" />
        <el-option label="Deposit pending" value="deposit_pending" />
        <el-option label="Deposit paid" value="deposit_paid" />
      </el-select>
    </ListToolbar>

    <el-card shadow="never" class="table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="name" label="Guest" width="120" />
        <el-table-column prop="contact" label="Contact" width="180" show-overflow-tooltip />
        <el-table-column prop="city" label="City" width="100" align="center" />
        <el-table-column label="Date" width="110" align="center">
          <template #default="{ row }">{{ row.date }}</template>
        </el-table-column>
        <el-table-column prop="mode" label="Service mode" width="120" />
        <el-table-column prop="groupSize" label="Group size" width="90" align="center" />
        <el-table-column label="Fast track" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.fastTrack" type="danger" size="small">Fast</el-tag>
            <span v-else style="color: #c0c4cc">Standard</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getBookingStatusColor(row.status)" size="small">
              {{ getBookingStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Assigned interpreter" min-width="160">
          <template #default="{ row }">
            <span v-if="row.assignedInterpreterName">{{ row.assignedInterpreterName }}</span>
            <span v-else style="color: #c0c4cc">Unassigned</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDrawer(row)">Details</el-button>
            <el-button
              v-if="row.status === 'new' || row.status === 'read' || row.status === 'contacted'"
              type="success"
              link
              size="small"
              @click="async () => { selectedBooking = row; await handleConfirm() }"
            >
              Confirm
            </el-button>
            <el-popconfirm
              v-if="row.status === 'new' || row.status === 'read' || row.status === 'contacted' || row.status === 'confirmed'"
              title="Cancel this booking?"
              @confirm="async () => { selectedBooking = row; await handleCancelBooking() }"
            >
              <template #reference>
                <el-button type="warning" link size="small">Cancel</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- Booking Detail Drawer -->
    <el-drawer
      v-model="drawerVisible"
      title="Booking details"
      size="520px"
      @closed="selectedBooking = null"
    >
      <template v-if="selectedBooking">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Guest">
            {{ selectedBooking.name }}
          </el-descriptions-item>
          <el-descriptions-item label="Contact">
            {{ selectedBooking.contact }}
          </el-descriptions-item>
          <el-descriptions-item label="City">
            {{ selectedBooking.city }}
          </el-descriptions-item>
          <el-descriptions-item label="Booking date">
            {{ selectedBooking.date }}
          </el-descriptions-item>
          <el-descriptions-item label="Service mode">
            {{ selectedBooking.mode }}
          </el-descriptions-item>
          <el-descriptions-item label="Group size">
            {{ selectedBooking.groupSize }}
          </el-descriptions-item>
          <el-descriptions-item label="Fast track">
            <el-tag v-if="selectedBooking.fastTrack" type="danger" size="small">Yes</el-tag>
            <span v-else>No</span>
          </el-descriptions-item>
          <el-descriptions-item label="Created">
            {{ formatDateTime(selectedBooking.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag
              :type="getBookingStatusColor(selectedBooking.status)"
              size="small"
            >
              {{ getBookingStatusLabel(selectedBooking.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Assigned interpreter">
            <span v-if="selectedBooking.assignedInterpreterName">
              {{ selectedBooking.assignedInterpreterName }}
            </span>
            <span v-else style="color: #c0c4cc">Unassigned</span>
          </el-descriptions-item>
          <el-descriptions-item label="Special requests">
            <div style="white-space: pre-wrap">{{ selectedBooking.needs }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Interpreter assignment (only for active bookings) -->
        <div
          v-if="selectedBooking.status === 'new' || selectedBooking.status === 'read' || selectedBooking.status === 'contacted' || selectedBooking.status === 'confirmed'"
          style="margin-top: 20px"
        >
          <el-divider content-position="left">Interpreter assignment</el-divider>
          <div style="display: flex; gap: 10px; align-items: center">
            <el-select
              v-model="selectedInterpreterId"
              placeholder="Select an interpreter"
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
            <el-button type="primary" @click="handleAssignInterpreter">Assign</el-button>
          </div>
        </div>

        <!-- Action buttons -->
        <div style="margin-top: 24px; display: flex; gap: 10px; justify-content: flex-end">
          <template v-if="selectedBooking.status === 'new' || selectedBooking.status === 'read' || selectedBooking.status === 'contacted'">
            <el-button type="success" @click="handleConfirm">Confirm booking</el-button>
            <el-button type="warning" @click="handleCancelBooking">Cancel booking</el-button>
          </template>
          <template v-if="selectedBooking.status === 'confirmed'">
            <el-button type="success" @click="handleComplete">Complete booking</el-button>
            <el-button type="warning" @click="handleCancelBooking">Cancel booking</el-button>
          </template>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
</style>
