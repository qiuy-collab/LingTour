<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { modesApi } from '@/api/modes'
import type { ServiceMode } from '@/types/interpreting'
import { pickI18n } from '@/types/common'

const router = useRouter()
const loading = ref(false)
const list = ref<ServiceMode[]>([])
const total = ref(0)

async function fetchList() {
  loading.value = true
  try {
    // 服务模式数量较少且有"上移/下移"操作,需要全量加载用于排序交换
    const res = await modesApi.getModes({ page: 1, pageSize: 200 })
    list.value = res.data.data.items.sort((a, b) => a.sortOrder - b.sortOrder)
    total.value = res.data.data.total
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '加载服务模式失败')
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  router.push('/admin/interpreting/modes/create')
}

function handleEdit(id: string) {
  router.push(`/admin/interpreting/modes/${id}/edit`)
}

async function handleDelete(row: ServiceMode) {
  const title = pickI18n(row.title as any) || '该模式'
  try {
    await ElMessageBox.confirm(
      `确定删除模式「${title}」?该操作不可恢复。`,
      '删除确认',
      { type: 'warning' }
    )
    await modesApi.deleteMode(row.id)
    ElMessage.success(`模式「${title}」已删除`)
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
    await modesApi.updateSort(a.id, b.sortOrder)
    await modesApi.updateSort(b.id, tmp)
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
    await modesApi.updateSort(a.id, b.sortOrder)
    await modesApi.updateSort(b.id, tmp)
    ElMessage.success('排序已更新')
    fetchList()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '排序更新失败')
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
      <el-table-column label="模式名称" min-width="180">
        <template #default="{ row }">
          <div>{{ pickI18n(row.title) }}</div>
          <div style="font-size: 12px; color: #909399">{{ pickI18n(row.title, 'en') }}</div>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="180">
        <template #default="{ row }">
          <div>{{ pickI18n(row.price) }}</div>
        </template>
      </el-table-column>
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
        <template #default="{ row }">{{ pickI18n(row.bestFor) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row, $index }">
          <el-button size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button size="small" @click="handleMoveUp($index)" :disabled="$index === 0">上移</el-button>
          <el-button size="small" @click="handleMoveDown($index)" :disabled="$index === list.length - 1">下移</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="footer-info" v-if="total > 0">
      共 {{ total }} 条服务模式
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.sort-actions { display: flex; align-items: center; gap: 4px; justify-content: center; }
.sort-num { min-width: 20px; text-align: center; font-weight: 500; }
.footer-info { margin-top: 16px; font-size: 12px; color: #909399; text-align: right; }
</style>
