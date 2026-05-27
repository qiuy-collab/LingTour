<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import { auditApi } from '@/api/audit'
import { AUDIT_ACTION_LABELS, AUDIT_RESOURCE_LABELS, type AuditLog, type AuditStats } from '@/types/audit'
import { formatDateTime } from '@/utils/format'
import ExportButton from '@/components/ExportButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import type { ExportColumn } from '@/composables/useExport'

const loading = ref(false)
const isFirstLoad = ref(true)
const apiUnavailable = ref(false)
const detailVisible = ref(false)
const activeLog = ref<AuditLog | null>(null)
const list = ref<AuditLog[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const stats = ref<AuditStats>({
  total: 0,
  last7Days: 0,
  actionBreakdown: [],
  resourceBreakdown: [],
})

const filters = reactive({
  action: '',
  resource: '',
  keyword: '',
  dateRange: [] as string[],
})

const topActions = computed(() => stats.value.actionBreakdown.slice(0, 4))
const topResources = computed(() => stats.value.resourceBreakdown.slice(0, 4))

const exportColumns: ExportColumn[] = [
  { header: '时间', key: 'createdAt', width: 20 },
  { header: '操作人', key: 'userName', width: 14 },
  { header: '动作', accessor: (row) => AUDIT_ACTION_LABELS[row.action] || row.action, width: 12 },
  { header: '资源类型', accessor: (row) => AUDIT_RESOURCE_LABELS[row.resource] || row.resource, width: 14 },
  { header: '资源名称', key: 'resourceName', width: 24 },
  { header: 'IP', key: 'ip', width: 18 },
]

function getActionTagType(action: string) {
  const map: Record<string, string> = {
    create: 'success',
    update: 'primary',
    delete: 'danger',
    publish: 'success',
    unpublish: 'warning',
    login: 'info',
    logout: 'info',
    batch_delete: 'danger',
    status_change: 'warning',
    export: '',
  }
  return map[action] || 'info'
}

async function fetchStats() {
  const response = await auditApi.getStats()
  const data = response.data?.data || {}
  apiUnavailable.value = Boolean(data.unavailable)
  stats.value = {
    total: Number(data.total || 0),
    last7Days: Number(data.last7Days || 0),
    actionBreakdown: Array.isArray(data.actionBreakdown) ? data.actionBreakdown : [],
    resourceBreakdown: Array.isArray(data.resourceBreakdown) ? data.resourceBreakdown : [],
  }
}

async function fetchList() {
  loading.value = true
  try {
    const [startDate, endDate] = filters.dateRange || []
    const response = await auditApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      action: filters.action || undefined,
      resource: filters.resource || undefined,
      keyword: filters.keyword || undefined,
      startDate,
      endDate,
    })
    const data = response.data?.data || {}
    apiUnavailable.value = apiUnavailable.value || Boolean(data.unavailable)
    list.value = Array.isArray(data.items) ? data.items : []
    total.value = Number(data.total || 0)
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '加载操作日志失败')
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
    isFirstLoad.value = false
  }
}

async function loadPage() {
  await Promise.all([fetchStats(), fetchList()])
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handleReset() {
  filters.action = ''
  filters.resource = ''
  filters.keyword = ''
  filters.dateRange = []
  page.value = 1
  fetchList()
}

function handlePageChange(value: number) {
  page.value = value
  fetchList()
}

function handleSizeChange(value: number) {
  pageSize.value = value
  page.value = 1
  fetchList()
}

async function openDetail(row: AuditLog) {
  activeLog.value = row
  detailVisible.value = true

  if (row.details) return

  try {
    const response = await auditApi.getDetail(row.id)
    const data = response.data?.data
    if (data) {
      activeLog.value = {
        ...row,
        ...data,
      }
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '加载日志详情失败')
  }
}

async function getAllData() {
  const [startDate, endDate] = filters.dateRange || []
  const response = await auditApi.getList({
    page: 1,
    pageSize: 9999,
    action: filters.action || undefined,
    resource: filters.resource || undefined,
    keyword: filters.keyword || undefined,
    startDate,
    endDate,
  })
  return response.data?.data?.items || []
}

onMounted(() => {
  loadPage()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2>操作日志</h2>
        <p class="page-desc">查看后台关键操作，支持筛选、导出和详情核对。</p>
      </div>
      <ExportButton
        filename="操作日志"
        :columns="exportColumns"
        :current-data="list"
        :fetch-all-data="getAllData"
      />
    </div>

    <el-alert
      v-if="apiUnavailable"
      title="当前后端未开放完整操作日志接口，页面已降级为空数据视图，但不会再报错。"
      type="warning"
      show-icon
      :closable="false"
      class="warning-banner"
    />

    <div class="stats-grid">
      <el-card shadow="never" class="stat-card">
        <span class="stat-label">总操作数</span>
        <strong>{{ stats.total }}</strong>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <span class="stat-label">近 7 天</span>
        <strong>{{ stats.last7Days }}</strong>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <span class="stat-label">高频动作</span>
        <strong>{{ topActions[0]?.count || 0 }}</strong>
        <small>{{ topActions[0] ? AUDIT_ACTION_LABELS[topActions[0].action] || topActions[0].action : '暂无' }}</small>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <span class="stat-label">高频资源</span>
        <strong>{{ topResources[0]?.count || 0 }}</strong>
        <small>{{ topResources[0] ? AUDIT_RESOURCE_LABELS[topResources[0].resource] || topResources[0].resource : '暂无' }}</small>
      </el-card>
    </div>

    <div class="search-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索操作人或资源名称"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="filters.action" placeholder="动作类型" clearable style="width: 140px">
        <el-option v-for="(label, key) in AUDIT_ACTION_LABELS" :key="key" :label="label" :value="key" />
      </el-select>
      <el-select v-model="filters.resource" placeholder="资源类型" clearable style="width: 140px">
        <el-option v-for="(label, key) in AUDIT_RESOURCE_LABELS" :key="key" :label="label" :value="key" />
      </el-select>
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px"
      />
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      <el-button :icon="Refresh" @click="handleReset">重置</el-button>
    </div>

    <PageSkeleton v-if="isFirstLoad && loading" type="list" :rows="8" />

    <el-table v-else :data="list" v-loading="loading" stripe>
      <el-table-column label="时间" width="180">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作人" prop="userName" width="120" />
      <el-table-column label="动作" width="120">
        <template #default="{ row }">
          <el-tag :type="getActionTagType(row.action)" size="small">
            {{ AUDIT_ACTION_LABELS[row.action] || row.action }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="资源类型" width="120">
        <template #default="{ row }">
          {{ AUDIT_RESOURCE_LABELS[row.resource] || row.resource }}
        </template>
      </el-table-column>
      <el-table-column label="资源名称" prop="resourceName" min-width="180" show-overflow-tooltip />
      <el-table-column label="IP" prop="ip" width="150" />
      <el-table-column label="详情" width="120">
        <template #default="{ row }">
          <el-button text type="primary" @click="openDetail(row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <EmptyState
      v-if="!loading && !isFirstLoad && list.length === 0"
      title="暂无操作日志"
      :description="apiUnavailable ? '后端暂未提供操作日志接口。' : '当前筛选条件下没有操作记录。'"
    />

    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <el-drawer v-model="detailVisible" title="操作详情" size="560px">
      <div v-if="activeLog" class="detail-stack">
        <div class="detail-row"><span>操作人</span><strong>{{ activeLog.userName || '-' }}</strong></div>
        <div class="detail-row"><span>动作</span><strong>{{ AUDIT_ACTION_LABELS[activeLog.action] || activeLog.action }}</strong></div>
        <div class="detail-row"><span>资源类型</span><strong>{{ AUDIT_RESOURCE_LABELS[activeLog.resource] || activeLog.resource }}</strong></div>
        <div class="detail-row"><span>资源名称</span><strong>{{ activeLog.resourceName || '-' }}</strong></div>
        <div class="detail-row"><span>IP</span><strong>{{ activeLog.ip || '-' }}</strong></div>
        <div class="detail-row"><span>时间</span><strong>{{ formatDateTime(activeLog.createdAt) }}</strong></div>
        <div class="detail-json-wrap">
          <div class="detail-json-title">差异详情</div>
          <pre class="detail-json">{{ JSON.stringify(activeLog.details || {}, null, 2) }}</pre>
        </div>
      </div>
      <EmptyState v-else title="暂无详情" description="当前日志没有可展示的详情数据。" />
    </el-drawer>
  </div>
</template>

<style scoped>
.page-container {
  padding: 4px 0 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.page-desc {
  margin: 6px 0 0;
  color: #8b95a4;
  font-size: 13px;
}

.warning-banner {
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card :deep(.el-card__body) {
  display: grid;
  gap: 8px;
}

.stat-label {
  color: #8b95a4;
  font-size: 12px;
}

.stat-card strong {
  font-size: 24px;
  line-height: 1;
  color: #1f2a37;
}

.stat-card small {
  color: #606266;
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.detail-stack {
  display: grid;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.detail-json-wrap {
  margin-top: 8px;
}

.detail-json-title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.detail-json {
  margin: 0;
  padding: 12px;
  max-height: 360px;
  overflow: auto;
  border-radius: 8px;
  background: #f5f7fa;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
