<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { modesApi } from '@/api/modes'
import type { ServiceMode } from '@/types/interpreting'
import { pickI18n } from '@/types/common'
import { useListPage } from '@/composables/useListPage'

const router = useRouter()

// List data
const {
  loading, list, total,
  fetchList,
} = useListPage<ServiceMode>({
  fetchApi: (params) => modesApi.getModes(params as any),
  deleteApi: (id) => modesApi.deleteMode(id),
  defaultFilters: {},
  defaultPageSize: 200,
  transform: (items: ServiceMode[]) => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
})

function handleCreate() {
  router.push('/admin/interpreting/modes/create')
}

function handleEdit(id: string) {
  router.push(`/admin/interpreting/modes/${id}/edit`)
}

async function handleDelete(row: ServiceMode) {
  const title = pickI18n(row.title as any) || 'this service mode'
  try {
    await ElMessageBox.confirm(
      `Delete "${title}"? This action cannot be undone.`,
      'Confirm deletion',
      { type: 'warning' },
    )
    await modesApi.deleteMode(row.id)
    ElMessage.success(`Deleted "${title}"`)
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Deletion failed')
  }
}

async function handleMoveUp(index: number) {
  if (index === 0) return
  const a = list.value[index]
  const b = list.value[index - 1]
  const tmp = a.sortOrder
  try {
    await modesApi.updateSort(a.id, b.sortOrder)
    await modesApi.updateSort(b.id, tmp)
    ElMessage.success('Order updated')
    fetchList()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || 'Failed to update order')
  }
}

async function handleMoveDown(index: number) {
  if (index === list.value.length - 1) return
  const a = list.value[index]
  const b = list.value[index + 1]
  const tmp = a.sortOrder
  try {
    await modesApi.updateSort(a.id, b.sortOrder)
    await modesApi.updateSort(b.id, tmp)
    ElMessage.success('Order updated')
    fetchList()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || 'Failed to update order')
  }
}

function getAccentLabel(accent: string) {
  return accent === 'light' ? 'Light' : 'Dark'
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2>Service modes</h2>
      <el-button type="primary" @click="handleCreate">Add service mode</el-button>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column label="Order" width="80" align="center">
          <template #default="{ row, $index }">
            <div class="sort-actions">
              <el-button size="small" text :disabled="$index === 0" @click="handleMoveUp($index)">↑</el-button>
              <span class="sort-num">{{ row.sortOrder }}</span>
              <el-button size="small" text :disabled="$index === list.length - 1" @click="handleMoveDown($index)">↓</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Service mode" min-width="180">
          <template #default="{ row }">
            <div>{{ pickI18n(row.title) }}</div>
            <div style="font-size: 12px; color: #909399">{{ pickI18n(row.title, 'en') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Price" width="180">
          <template #default="{ row }">
            <div>{{ pickI18n(row.price) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Featured" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.featured" type="danger" size="small">Featured</el-tag>
            <span v-else style="color: #c0c4cc">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Tone" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.accent === 'dark' ? '' : 'info'" size="small" effect="plain">
              {{ getAccentLabel(row.accent) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Best for" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ pickI18n(row.bestFor) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="240" fixed="right">
          <template #default="{ row, $index }">
            <el-button type="primary" link size="small" @click="handleEdit(row.id)">Edit</el-button>
            <el-button type="primary" link size="small" @click="handleMoveUp($index)" :disabled="$index === 0">Move up</el-button>
            <el-button type="primary" link size="small" @click="handleMoveDown($index)" :disabled="$index === list.length - 1">Move down</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap" v-if="total > 0">
        <span class="footer-info">{{ total }} service modes</span>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.sort-actions { display: flex; align-items: center; gap: 4px; justify-content: center; }
.sort-num { min-width: 20px; text-align: center; font-weight: 500; }
.footer-info { font-size: 12px; color: var(--lt-text-secondary, #909399); }
</style>
