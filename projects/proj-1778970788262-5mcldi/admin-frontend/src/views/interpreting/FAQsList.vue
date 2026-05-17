<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { faqsApi } from '@/api/faqs'
import { FAQCategoryMap } from '@/types/interpreting'
import type { FAQ } from '@/types/interpreting'

const router = useRouter()
const loading = ref(false)
const list = ref<FAQ[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const categoryFilter = ref('')

async function fetchList() {
  loading.value = true
  try {
    const res = await faqsApi.getFAQs({
      page: page.value,
      pageSize: 999,
      category: categoryFilter.value,
    })
    list.value = res.data.data.items.sort((a, b) => a.sortOrder - b.sortOrder)
    total.value = res.data.data.total
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

function handleCreate() {
  router.push('/admin/interpreting/faqs/create')
}

function handleEdit(id: string) {
  router.push(`/admin/interpreting/faqs/${id}/edit`)
}

async function handleDelete(id: string, question: string) {
  try {
    await faqsApi.deleteFAQ(id)
    ElMessage.success(`FAQ「${question}」已删除`)
    fetchList()
  } catch {
    ElMessage.error('删除失败')
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
    ElMessage.success('排序已更新')
    fetchList()
  } catch {
    ElMessage.error('排序更新失败')
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
    ElMessage.success('排序已更新')
    fetchList()
  } catch {
    ElMessage.error('排序更新失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>常见问题管理</h2>
      <el-button type="primary" @click="handleCreate">新增FAQ</el-button>
    </div>

    <div class="search-bar">
      <el-select v-model="categoryFilter" placeholder="分类筛选" clearable style="width: 160px" @change="handleSearch">
        <el-option label="全部" value="" />
        <el-option label="口译服务" value="interpreting" />
        <el-option label="通用问题" value="general" />
        <el-option label="路线相关" value="routes" />
      </el-select>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column label="排序" width="80" align="center">
        <template #default="{ row, $index }">
          <div class="sort-actions">
            <el-button size="small" text :disabled="$index === 0" @click="handleMoveUp($index)">↑</el-button>
            <span class="sort-num">{{ row.sortOrder }}</span>
            <el-button size="small" text :disabled="$index === list.length - 1" @click="handleMoveDown($index)">↓</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="问题" min-width="280">
        <template #default="{ row }">
          <div class="qa-text">{{ row.question }}</div>
          <div class="qa-sub">{{ row.questionEn }}</div>
        </template>
      </el-table-column>
      <el-table-column label="答案" min-width="320" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="qa-text">{{ row.answer }}</div>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="120" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ (FAQCategoryMap as Record<string, string>)[row.category] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row, $index }">
          <el-button size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button size="small" @click="handleMoveUp($index)" :disabled="$index === 0">上移</el-button>
          <el-button size="small" @click="handleMoveDown($index)" :disabled="$index === list.length - 1">下移</el-button>
          <el-popconfirm title="确定删除该FAQ？" @confirm="handleDelete(row.id, row.question)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
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
  </div>
</template>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.sort-actions { display: flex; align-items: center; gap: 4px; justify-content: center; }
.sort-num { min-width: 20px; text-align: center; font-weight: 500; }
.qa-text { font-size: 14px; }
.qa-sub { font-size: 12px; color: #909399; margin-top: 2px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
