<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { modesApi } from '@/api/modes'
import type { ServiceMode } from '@/types/interpreting'

const router = useRouter()
const loading = ref(false)
const list = ref<ServiceMode[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

async function fetchList() {
  loading.value = true
  try {
    const res = await modesApi.getModes({ page: page.value, pageSize: 999 })
    list.value = res.data.data.items.sort((a, b) => a.sortOrder - b.sortOrder)
    total.value = res.data.data.total
  } finally {
    loading.value = false
  }
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
  router.push('/admin/interpreting/modes/create')
}

function handleEdit(id: string) {
  router.push(`/admin/interpreting/modes/${id}/edit`)
}

async function handleDelete(id: string, title: string) {
  try {
    await modesApi.deleteMode(id)
    ElMessage.success(`模式「${title}」已删除`)
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
    await modesApi.updateSort(a.id, b.sortOrder)
    await modesApi.updateSort(b.id, tmp)
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
    await modesApi.updateSort(a.id, b.sortOrder)
    await modesApi.updateSort(b.id, tmp)
    ElMessage.success('排序已更新')
    fetchList()
  } catch {
    ElMessage.error('排序更新失败')
  }
}

function getAccentLabel(accent: string) {
  return accent === 'light' ? '浅色' : '深色'
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>服务模式管理</h2>
      <el-button type="primary" @click="handleCreate">新增模式</el-button>
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
      <el-table-column prop="title" label="模式名称" min-width="160">
        <template #default="{ row }">
          <div>{{ row.title || '' }}</div>
          <div style="font-size: 12px; color: #909399">{{ row.titleEn || '' }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" width="130" />
      <el-table-column label="推荐" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.featured" type="danger" size="small">推荐</el-tag>
          <span v-else style="color: #c0c4cc">—</span>
        </template>
      </el-table-column>
      <el-table-column label="色调" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.accent === 'dark' ? '' : 'info'" size="small" effect="plain">
            {{ getAccentLabel(row.accent) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="适用场景" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">{{ row.bestFor || '' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row, $index }">
          <el-button size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button size="small" @click="handleMoveUp($index)" :disabled="$index === 0">上移</el-button>
          <el-button size="small" @click="handleMoveDown($index)" :disabled="$index === list.length - 1">下移</el-button>
          <el-popconfirm title="确定删除该模式？" @confirm="handleDelete(row.id, row.title)">
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
.sort-actions { display: flex; align-items: center; gap: 4px; justify-content: center; }
.sort-num { min-width: 20px; text-align: center; font-weight: 500; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
