<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { faqsApi } from '@/api/faqs'
import { FAQCategoryMap } from '@/types/interpreting'
import type { FAQ } from '@/types/interpreting'
import { pickI18n } from '@/types/common'

const router = useRouter()
const loading = ref(false)
const list = ref<FAQ[]>([])
const total = ref(0)
const categoryFilter = ref('')
const keyword = ref('')

async function fetchList() {
  loading.value = true
  try {
    // FAQ 列表数量较少且有"上移/下移"操作,需要全量加载用于排序交换
    const res = await faqsApi.getFAQs({
      page: 1,
      pageSize: 200,
      category: categoryFilter.value,
    } as any)
    let items = res.data.data.items.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    if (keyword.value) {
      const k = keyword.value.toLowerCase()
      items = items.filter((it: any) =>
        (pickI18n(it.question) || '').toLowerCase().includes(k) ||
        (pickI18n(it.answer) || '').toLowerCase().includes(k)
      )
    }
    list.value = items
    total.value = res.data.data.total
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '加载FAQ失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  fetchList()
}

function handleCreate() {
  router.push('/admin/interpreting/faqs/create')
}

function handleEdit(id: string) {
  router.push(`/admin/interpreting/faqs/${id}/edit`)
}

async function handleDelete(row: FAQ) {
  const question = pickI18n(row.question as any) || '该FAQ'
  try {
    await ElMessageBox.confirm(
      `确定删除FAQ「${question}」?`,
      '删除确认',
      { type: 'warning' }
    )
    await faqsApi.deleteFAQ(row.id)
    ElMessage.success(`FAQ「${question}」已删除`)
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '删除失败')
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
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '排序更新失败')
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
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '排序更新失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div>
    <div class="page-header">
      <h2>常见问题管理</h2>
      <el-button type="primary" @click="handleCreate">新增FAQ</el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索问题/答案"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select v-model="categoryFilter" placeholder="分类筛选" clearable style="width: 160px" @change="handleSearch">
        <el-option label="全部" value="" />
        <el-option label="口译服务" value="interpreting" />
        <el-option label="通用问题" value="general" />
        <el-option label="路线相关" value="routes" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-card shadow="never" class="table-card">
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
            <div class="qa-text">{{ pickI18n(row.question) }}</div>
            <div class="qa-sub">{{ pickI18n(row.question, 'en') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="答案" min-width="320" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="qa-text">{{ pickI18n(row.answer) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ (FAQCategoryMap as Record<string, string>)[row.category] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row, $index }">
            <el-button type="primary" link size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleMoveUp($index)" :disabled="$index === 0">上移</el-button>
            <el-button type="primary" link size="small" @click="handleMoveDown($index)" :disabled="$index === list.length - 1">下移</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap" v-if="total > 0">
        <span class="footer-info">共 {{ total }} 条 FAQ</span>
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
