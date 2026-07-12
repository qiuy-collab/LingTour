<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useListPage } from '@/composables/useListPage'
import { interpretersApi } from '@/api/interpreters'
import { InterpreterStatusMap, InterpreterStatusColorMap } from '@/types/interpreting'
import { pickI18n } from '@/types/common'
import type { Interpreter } from '@/types/interpreting'
import { resolveMediaUrl } from '@/utils/media'

const router = useRouter()

const {
  loading, list, total, page, pageSize,
  filters,
  fetchList,
  handlePageChange, handleSizeChange,
  handleSearch,
} = useListPage<Interpreter>({
  fetchApi: (params) => interpretersApi.getInterpreters(params as any),
  defaultFilters: { keyword: '', status: '' },
})

/** Get the English display name for messages and avatar initials. */
function nameZh(row: Interpreter): string {
  return pickI18n(row.name) || 'this interpreter'
}

function handleCreate() {
  router.push('/admin/interpreting/profiles/create')
}

function handleEdit(id: string) {
  router.push(`/admin/interpreting/profiles/${id}/edit`)
}

async function handleDelete(row: Interpreter) {
  try {
    await ElMessageBox.confirm(
      `Delete "${nameZh(row)}"? This action cannot be undone.`,
      'Confirm deletion',
      { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' }
    )
    await interpretersApi.deleteInterpreter(row.id)
    ElMessage.success(`Deleted "${nameZh(row)}"`)
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Deletion failed')
  }
}

async function handleApprove(row: Interpreter) {
  try {
    await ElMessageBox.confirm(
      `Approve "${nameZh(row)}"? Their profile will become active.`,
      'Confirm approval',
      { confirmButtonText: 'Approve', cancelButtonText: 'Cancel', type: 'success' }
    )
    await interpretersApi.updateStatus(row.id, 'active')
    ElMessage.success(`${nameZh(row)} is approved and active`)
    fetchList()
  } catch { /* cancelled */ }
}

async function handleReject(row: Interpreter) {
  try {
    await ElMessageBox.confirm(
      `Reject "${nameZh(row)}"? Their profile will become inactive.`,
      'Confirm rejection',
      { confirmButtonText: 'Reject', cancelButtonText: 'Cancel', type: 'warning' }
    )
    await interpretersApi.updateStatus(row.id, 'inactive')
    ElMessage.info(`${nameZh(row)} was rejected and is now inactive`)
    fetchList()
  } catch { /* cancelled */ }
}

async function handleDisable(row: Interpreter) {
  try {
    await ElMessageBox.confirm(
      `Deactivate "${nameZh(row)}"?`,
      'Confirm deactivation',
      { confirmButtonText: 'Deactivate', cancelButtonText: 'Cancel', type: 'warning' }
    )
    await interpretersApi.updateStatus(row.id, 'inactive')
    ElMessage.info(`${nameZh(row)} is now inactive`)
    fetchList()
  } catch { /* cancelled */ }
}

async function handleEnable(row: Interpreter) {
  try {
    await ElMessageBox.confirm(
      `Activate "${nameZh(row)}"?`,
      'Confirm activation',
      { confirmButtonText: 'Activate', cancelButtonText: 'Cancel', type: 'success' }
    )
    await interpretersApi.updateStatus(row.id, 'active')
    ElMessage.success(`${nameZh(row)} is now active`)
    fetchList()
  } catch { /* cancelled */ }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2>Interpreters</h2>
      <el-button type="primary" @click="handleCreate">Add interpreter</el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="Search by name or language"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select v-model="filters.status" placeholder="Status" clearable style="width: 160px" @change="handleSearch">
        <el-option label="All" value="" />
        <el-option label="Pending review" value="pending_review" />
        <el-option label="Active" value="active" />
        <el-option label="Inactive" value="inactive" />
      </el-select>
      <el-button type="primary" @click="handleSearch">Search</el-button>
    </div>

    <el-card shadow="never" class="table-card">
    <el-table :data="list" v-loading="loading" stripe empty-text="No interpreters found">
      <el-table-column label="Avatar" width="70">
        <template #default="{ row }">
          <el-avatar v-if="row.avatar" :src="resolveMediaUrl(row.avatar)" :size="40" />
          <el-avatar v-else :size="40">{{ nameZh(row).charAt(0) }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="Name" width="140">
        <template #default="{ row }">
          <div>{{ pickI18n(row.name) }}</div>
          <div class="admin-list-meta">{{ pickI18n(row.name, 'en') }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Languages" width="200" show-overflow-tooltip>
        <template #default="{ row }">{{ pickI18n(row.language) }}</template>
      </el-table-column>
      <el-table-column label="Specialties" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <div>{{ pickI18n(row.focus) }}</div>
          <div class="admin-list-meta">{{ pickI18n(row.focus, 'en') }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Capabilities" min-width="200">
        <template #default="{ row }">
          <el-tag v-for="(h, i) in row.helps" :key="i" size="small" style="margin: 2px 2px">{{ pickI18n(h) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Cities" width="120" align="center">
        <template #default="{ row }">{{ pickI18n(row.city) }}</template>
      </el-table-column>
      <el-table-column label="Status" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="(InterpreterStatusColorMap as Record<string, string>)[row.status]" size="small">
            {{ (InterpreterStatusMap as Record<string, string>)[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="270" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row.id)">Edit</el-button>
          <template v-if="row.status === 'pending_review'">
            <el-button type="success" link size="small" @click="handleApprove(row)">Approve</el-button>
            <el-button type="warning" link size="small" @click="handleReject(row)">Reject</el-button>
          </template>
          <template v-if="row.status === 'active'">
            <el-button type="warning" link size="small" @click="handleDisable(row)">Deactivate</el-button>
          </template>
          <template v-if="row.status === 'inactive'">
            <el-button type="success" link size="small" @click="handleEnable(row)">Activate</el-button>
          </template>
          <el-button type="danger" link size="small" @click="handleDelete(row)">Delete</el-button>
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
  </div>
</template>

<style scoped>
.search-bar { margin-bottom: 16px; }
</style>
