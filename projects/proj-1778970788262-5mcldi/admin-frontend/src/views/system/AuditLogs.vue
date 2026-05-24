<script setup lang="ts">
import { ref } from 'vue'
import { auditApi } from '@/api/audit'
import { AUDIT_ACTION_LABELS, AUDIT_RESOURCE_LABELS } from '@/types/audit'
import type { AuditLog } from '@/types/audit'
import { formatDateTime } from '@/utils/format'
import { useListPage } from '@/composables/useListPage'
import ExportButton from '@/components/ExportButton.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import type { ExportColumn } from '@/composables/useExport'
import { Search, Refresh } from '@element-plus/icons-vue'

const {
  loading, list, total, page, pageSize, isFirstLoad, filters,
  handlePageChange, handleSizeChange, handleSearch, handleReset, getAllData,
} = useListPage<AuditLog>({
  fetchApi: (params) => auditApi.getList(params),
  defaultPageSize: 20,
  defaultFilters: {
    action: '',
    resource: '',
    keyword: '',
    dateRange: [] as string[],
  },
})

function doSearch() {
  handleSearch()
}

function doReset() {
  handleReset()
}

// Expand row
const expandedRows = ref<string[]>([])

function handleExpandChange(_row: AuditLog, expanded: boolean[]) {
  expandedRows.value = expanded.map((r: any) => r.id)
}

// Action tag type
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

// Export columns
const exportColumns: ExportColumn[] = [
  { header: '时间', key: 'createdAt', width: 20 },
  { header: '操作人', key: 'userName', width: 12 },
  { header: '操作', accessor: (row) => AUDIT_ACTION_LABELS[row.action] || row.action, width: 10 },
  { header: '资源类型', accessor: (row) => AUDIT_RESOURCE_LABELS[row.resource] || row.resource, width: 12 },
  { header: '资源名称', key: 'resourceName', width: 20 },
  { header: 'IP', key: 'ip', width: 16 },
]
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>操作日志</h2>
      <ExportButton
        filename="操作日志"
        :columns="exportColumns"
        :current-data="list"
        :fetch-all-data="getAllData"
      />
    </div>

    <!-- Filters -->
    <div class="search-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索操作人/资源名称"
        clearable
        style="width: 200px"
        @keyup.enter="doSearch"
      />
      <el-select v-model="filters.action" placeholder="操作类型" clearable style="width: 130px">
        <el-option
          v-for="(label, key) in AUDIT_ACTION_LABELS"
          :key="key"
          :label="label"
          :value="key"
        />
      </el-select>
      <el-select v-model="filters.resource" placeholder="资源类型" clearable style="width: 130px">
        <el-option
          v-for="(label, key) in AUDIT_RESOURCE_LABELS"
          :key="key"
          :label="label"
          :value="key"
        />
      </el-select>
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 240px"
      />
      <el-button type="primary" :icon="Search" @click="doSearch">搜索</el-button>
      <el-button :icon="Refresh" @click="doReset">重置</el-button>
    </div>

    <!-- Skeleton -->
    <PageSkeleton v-if="isFirstLoad && loading" type="list" :rows="8" />

    <!-- Table -->
    <el-table
      v-else
      :data="list"
      v-loading="loading"
      stripe
      row-key="id"
      @expand-change="handleExpandChange"
    >
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-detail" v-if="row.details">
            <pre class="detail-json">{{ JSON.stringify(row.details, null, 2) }}</pre>
          </div>
          <div v-else class="expand-detail">
            <span style="color: #909399;">无详细信息</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="170">
        <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作人" prop="userName" width="100" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-tag :type="getActionTagType(row.action)" size="small">
            {{ AUDIT_ACTION_LABELS[row.action] || row.action }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="资源类型" width="100">
        <template #default="{ row }">
          {{ AUDIT_RESOURCE_LABELS[row.resource] || row.resource }}
        </template>
      </el-table-column>
      <el-table-column label="资源名称" prop="resourceName" min-width="160" show-overflow-tooltip />
      <el-table-column label="IP" prop="ip" width="130" />
    </el-table>

    <!-- Empty state -->
    <EmptyState
      v-if="!loading && !isFirstLoad && list.length === 0"
      title="暂无操作日志"
      description="系统操作记录将在此显示"
    />

    <!-- Pagination -->
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
  </div>
</template>

<style scoped>
.page-container { padding: 4px 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: var(--admin-font-page-title, 20px); }
.search-bar { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; align-items: center; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
.expand-detail { padding: 12px 20px; }
.detail-json {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 300px;
  margin: 0;
}
</style>
