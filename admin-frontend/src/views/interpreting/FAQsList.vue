<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { faqsApi } from '@/api/faqs'
import { FAQCategoryMap } from '@/types/interpreting'
import type { FAQ } from '@/types/interpreting'
import { pickI18n } from '@/types/common'
import { useListPage } from '@/composables/useListPage'
import { ListToolbar } from '@/components/list'

const router = useRouter()

// List data
const {
  loading, list, total, page,
  filters,
  fetchList,
  handleSearch: _handleSearch,
  handleReset,
} = useListPage<FAQ>({
  fetchApi: (params) => faqsApi.getFAQs(params as any),
  deleteApi: (id) => faqsApi.deleteFAQ(id),
  defaultFilters: { keyword: '', category: '' },
  defaultPageSize: 200,
  transform: (items: FAQ[]): FAQ[] => {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
    const k = ((filters as any).keyword as string)?.trim().toLowerCase()
    if (!k) return sorted
    return sorted.filter(
      (it) =>
        (pickI18n(it.question as any) || '').toLowerCase().includes(k) ||
        (pickI18n(it.answer as any) || '').toLowerCase().includes(k),
    )
  },
})

// Client-side keyword filter: re-filter without API call
function handleSearch() {
  page.value = 1
  fetchList()
}

function handleCreate() {
  router.push('/admin/interpreting/faqs/create')
}

function handleEdit(id: string) {
  router.push(`/admin/interpreting/faqs/${id}/edit`)
}

async function handleDelete(row: FAQ) {
  const question = pickI18n(row.question as any) || 'this FAQ'
  try {
    await ElMessageBox.confirm(
      `Delete "${question}"?`,
      'Confirm deletion',
      { type: 'warning' },
    )
    await faqsApi.deleteFAQ(row.id)
    ElMessage.success(`Deleted "${question}"`)
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
    await faqsApi.updateSort(a.id, b.sortOrder)
    await faqsApi.updateSort(b.id, tmp)
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
    await faqsApi.updateSort(a.id, b.sortOrder)
    await faqsApi.updateSort(b.id, tmp)
    ElMessage.success('Order updated')
    fetchList()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || 'Failed to update order')
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2>FAQs</h2>
      <el-button type="primary" @click="handleCreate">Add FAQ</el-button>
    </div>

    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="Search questions and answers"
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-select
        v-model="filters.category"
        placeholder="Category"
        clearable
        style="width: 160px"
        @change="handleSearch"
      >
        <el-option label="All" value="" />
        <el-option label="Interpreting" value="interpreting" />
        <el-option label="General" value="general" />
        <el-option label="Routes" value="routes" />
      </el-select>
    </ListToolbar>

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
        <el-table-column label="Question" min-width="280">
          <template #default="{ row }">
            <div class="qa-text">{{ pickI18n(row.question) }}</div>
            <div class="qa-sub">{{ pickI18n(row.question, 'en') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Answer" min-width="320" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="qa-text">{{ pickI18n(row.answer) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Category" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ (FAQCategoryMap as Record<string, string>)[row.category] }}</el-tag>
          </template>
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
        <span class="footer-info">{{ total }} FAQs</span>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.sort-actions { display: flex; align-items: center; gap: 4px; justify-content: center; }
.sort-num { min-width: 20px; text-align: center; font-weight: 500; }
.qa-text { font-size: 14px; }
.qa-sub { font-size: 12px; color: var(--lt-text-secondary, #909399); margin-top: 2px; }
.footer-info { font-size: 12px; color: var(--lt-text-secondary, #909399); }
</style>
