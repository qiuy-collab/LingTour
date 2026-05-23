<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { collectionsApi } from '@/api/collections'
import type { StoreCollection } from '@/types/collection'
import { pickI18n } from '@/types/common'

const router = useRouter()
const loading = ref(false)
const list = ref<StoreCollection[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

async function fetchList() {
  loading.value = true
  try {
    const res = await collectionsApi.getCollections({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
    } as any)
    list.value = res.data.data.items
    total.value = res.data.data.total
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '加载系列列表失败')
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
  router.push('/admin/shop/collections/create')
}

function handleEdit(id: string) {
  router.push(`/admin/shop/collections/${id}/edit`)
}

async function handleDelete(row: StoreCollection) {
  const title = pickI18n(row.title as any) || '该系列'
  try {
    await ElMessageBox.confirm(
      `确定删除系列「${title}」?该操作不可恢复。`,
      '删除确认',
      { type: 'warning' }
    )
    await collectionsApi.deleteCollection(row.id)
    ElMessage.success(`系列「${title}」已删除`)
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '删除失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>系列管理</h2>
      <el-button type="primary" @click="handleCreate">新增系列</el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索系列名称 / slug"
        clearable
        style="width: 260px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column label="封面" width="80">
        <template #default="{ row }">
          <el-image
            v-if="row.image"
            :src="row.image"
            style="width: 50px; height: 50px; border-radius: 4px"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="系列名称" min-width="180">
        <template #default="{ row }">
          <div>{{ pickI18n(row.title) }}</div>
          <div style="font-size: 12px; color: #909399">{{ pickI18n(row.title, 'en') }}</div>
        </template>
      </el-table-column>
      <el-table-column label="关联路线" width="160">
        <template #default="{ row }">
          {{ pickI18n(row.routeName) || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="productCount" label="商品数" width="80" align="center">
        <template #default="{ row }">
          <el-badge :value="row.productCount" type="primary" />
        </template>
      </el-table-column>
      <el-table-column prop="published" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.published ? 'success' : 'info'" size="small">
            {{ row.published ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
