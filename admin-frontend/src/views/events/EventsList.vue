<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { eventsApi } from '@/api/events'
import type { Event, EventStatus } from '@/types/event'
import { EventStatusMap, EventStatusColorMap } from '@/types/event'
import { useListPage } from '@/composables/useListPage'
import { ListToolbar } from '@/components/list'
import { resolveMediaUrl } from '@/utils/media'

const router = useRouter()

// View mode
type ViewMode = 'list' | 'calendar'
const viewMode = ref<ViewMode>('list')

// List data
const {
  loading, list, total, page, pageSize,
  filters,
  handlePageChange, handleSizeChange,
  handleSearch, handleReset,
  handleDelete,
  fetchList,
} = useListPage<Event>({
  fetchApi: (params) => eventsApi.getEvents(params as any),
  deleteApi: (id) => eventsApi.deleteEvent(id),
  defaultFilters: { keyword: '', status: '', city: '', startDate: '', endDate: '' },
})

// Actions
function handleCreate() {
  router.push('/admin/events/create')
}

function handleEdit(id: string) {
  router.push(`/admin/events/${id}/edit`)
}

async function handleStatusChange(event: Event, status: EventStatus) {
  try {
    await eventsApi.updateStatus(event.id, status)
    ElMessage.success('Event status updated')
    fetchList()
  } catch {
    ElMessage.error('Failed to update event status')
  }
}

function getStatusLabel(status: string): string {
  return EventStatusMap[status as EventStatus] || status
}

function getStatusType(status: string): string {
  return EventStatusColorMap[status as EventStatus] || 'info'
}

// Calendar view
const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth() + 1)

const daysInMonth = computed(() => {
  return new Date(calendarYear.value, calendarMonth.value, 0).getDate()
})

const firstDayOfWeek = computed(() => {
  return new Date(calendarYear.value, calendarMonth.value - 1, 1).getDay()
})

const calendarEvents = computed(() => {
  return list.value.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === calendarYear.value && d.getMonth() + 1 === calendarMonth.value
  })
})

function getEventsForDay(day: number): Event[] {
  return list.value.filter((e) => {
    const d = new Date(e.date)
    return (
      d.getFullYear() === calendarYear.value &&
      d.getMonth() + 1 === calendarMonth.value &&
      d.getDate() === day
    )
  })
}

function prevMonth() {
  if (calendarMonth.value === 1) {
    calendarMonth.value = 12
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

function nextMonth() {
  if (calendarMonth.value === 12) {
    calendarMonth.value = 1
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

function goToday() {
  const today = new Date()
  calendarYear.value = today.getFullYear()
  calendarMonth.value = today.getMonth() + 1
}

// City options
const cityOptions = computed(() => {
  const cities = new Set(list.value.map((e) => e.city))
  return Array.from(cities).sort()
})
</script>

<template>
  <div>
    <div class="page-header">
      <h2>Events</h2>
      <div style="display: flex; gap: 12px; align-items: center">
        <el-button-group>
          <el-button :type="viewMode === 'list' ? 'primary' : ''" size="small" @click="viewMode = 'list'">
            List
          </el-button>
          <el-button :type="viewMode === 'calendar' ? 'primary' : ''" size="small" @click="viewMode = 'calendar'">
            Calendar
          </el-button>
        </el-button-group>
        <el-button type="primary" @click="handleCreate">Add event</el-button>
      </div>
    </div>

    <!-- Filters -->
    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="Search events..."
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-select
        v-model="filters.status"
        placeholder="Status"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="All" value="" />
        <el-option label="Upcoming" value="upcoming" />
        <el-option label="Ongoing" value="ongoing" />
        <el-option label="Ended" value="past" />
        <el-option label="Draft" value="draft" />
      </el-select>
      <el-select
        v-model="filters.city"
        placeholder="City"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="All" value="" />
        <el-option
          v-for="c in cityOptions"
          :key="c"
          :label="c"
          :value="c"
        />
      </el-select>
      <el-date-picker
        v-model="filters.startDate"
        type="date"
        placeholder="Start date"
        value-format="YYYY-MM-DD"
        style="width: 160px"
        @change="handleSearch"
      />
      <el-date-picker
        v-model="filters.endDate"
        type="date"
        placeholder="End date"
        value-format="YYYY-MM-DD"
        style="width: 160px"
        @change="handleSearch"
      />
    </ListToolbar>

    <!-- ============================================ -->
    <!-- List view -->
    <!-- ============================================ -->
    <el-card v-if="viewMode === 'list'" shadow="never" class="table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column label="Cover" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="resolveMediaUrl(row.image)"
              class="admin-list-thumb admin-list-thumb--wide"
              fit="cover"
              preview-teleported
            />
            <span v-else class="admin-list-empty">No image</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="Event" min-width="180">
          <template #default="{ row }">
            <div>{{ row.title || '' }}</div>
            <div class="admin-list-meta">{{ row.titleEn || '' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Dates" width="200" align="center">
          <template #default="{ row }">
            <span v-if="row.endDate && row.endDate !== row.date">
              {{ row.date }} ~ {{ row.endDate }}
            </span>
            <span v-else>{{ row.date }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="City" width="100" align="center" />
        <el-table-column label="Tags" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags.slice(0, 3)"
              :key="tag"
              size="small"
              style="margin-right: 4px"
            >
              {{ tag }}
            </el-tag>
            <el-tag v-if="row.tags.length > 3" size="small" type="info">
              +{{ row.tags.length - 3 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Linked routes" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.relatedRouteSlugs.length">{{ row.relatedRouteSlugs.length }}</span>
            <span v-else class="admin-list-empty">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="270" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row.id)">Edit</el-button>
            <template v-if="row.status === 'draft'">
              <el-button type="success" link size="small" @click="handleStatusChange(row, 'upcoming')">
                Publish
              </el-button>
            </template>
            <template v-if="row.status === 'upcoming'">
              <el-button type="success" link size="small" @click="handleStatusChange(row, 'ongoing')">
                Start
              </el-button>
            </template>
            <template v-if="row.status === 'ongoing'">
              <el-button type="info" link size="small" @click="handleStatusChange(row, 'past')">
                End
              </el-button>
            </template>
            <template v-if="row.status === 'past' || row.status === 'upcoming'">
              <el-button type="warning" link size="small" @click="handleStatusChange(row, 'draft')">
                Revert to draft
              </el-button>
            </template>
            <el-popconfirm title="Delete this event?" @confirm="handleDelete(row.id, row.title)">
              <template #reference>
                <el-button type="danger" link size="small">Delete</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
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

    <!-- ============================================ -->
    <!-- Calendar view -->
    <!-- ============================================ -->
    <div v-else class="calendar-view" v-loading="loading">
      <div class="calendar-nav">
        <el-button size="small" @click="prevMonth">◀</el-button>
        <span class="calendar-month">{{ new Date(calendarYear, calendarMonth - 1).toLocaleString('en', { month: 'long' }) }} {{ calendarYear }}</span>
        <el-button size="small" @click="nextMonth">▶</el-button>
        <el-button size="small" @click="goToday" style="margin-left: 12px">Today</el-button>
        <span class="calendar-event-count">{{ calendarEvents.length }} events</span>
      </div>

      <div class="calendar-grid">
        <div class="calendar-header">
          <div v-for="d in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="d" class="calendar-header-cell">
            {{ d }}
          </div>
        </div>
        <div class="calendar-body">
          <!-- Leading blank days -->
          <div
            v-for="i in firstDayOfWeek"
            :key="'empty-' + i"
            class="calendar-cell calendar-cell-empty"
          />
          <!-- Day cells -->
          <div
            v-for="day in daysInMonth"
            :key="day"
            class="calendar-cell"
            :class="{ 'is-today': day === new Date().getDate() && calendarMonth === new Date().getMonth() + 1 && calendarYear === new Date().getFullYear() }"
          >
            <div class="calendar-day-num">{{ day }}</div>
            <div class="calendar-events">
              <div
                v-for="ev in getEventsForDay(day)"
                :key="ev.id"
                class="calendar-event-chip"
                :class="'status-' + ev.status"
                :title="ev.title || ''"
                @click="handleEdit(ev.id)"
              >
                <el-tag :type="getStatusType(ev.status)" size="small" effect="plain">
                  {{ (ev.title || '').slice(0, 8) }}{{ (ev.title || '').length > 8 ? '…' : '' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Calendar view */
.calendar-view { margin-top: 8px; }
.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.calendar-month {
  font-size: 18px;
  font-weight: 600;
  min-width: 140px;
  text-align: center;
}
.calendar-event-count {
  margin-left: 16px;
  color: var(--lt-text-secondary);
  font-size: 14px;
}

.calendar-grid {
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-md);
  overflow: hidden;
}
.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--lt-bg-hover);
}
.calendar-header-cell {
  text-align: center;
  padding: 8px 0;
  font-weight: 600;
  font-size: 13px;
  color: var(--lt-text-regular);
  border-bottom: 1px solid var(--lt-border-light);
}
.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.calendar-cell {
  min-height: 90px;
  border-right: 1px solid var(--lt-border-light);
  border-bottom: 1px solid var(--lt-border-light);
  padding: 4px;
  position: relative;
}
.calendar-cell:nth-child(7n) { border-right: none; }
.calendar-cell-empty { background: var(--lt-bg-hover); }
.calendar-cell.is-today { background: var(--lt-primary-soft); }
.calendar-cell.is-today .calendar-day-num {
  color: var(--lt-primary);
  font-weight: 700;
}
.calendar-day-num {
  font-size: 13px;
  color: var(--lt-text-regular);
  margin-bottom: 4px;
  text-align: right;
  padding-right: 4px;
}
.calendar-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.calendar-event-chip {
  cursor: pointer;
  font-size: 12px;
}
</style>
