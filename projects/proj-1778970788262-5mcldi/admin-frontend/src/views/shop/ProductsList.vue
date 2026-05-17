<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productsApi } from '@/api/products'
import type { Product } from '@/types/product'

const router = useRouter()
const loading = ref(false)
const list = ref<Product[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const statusFilter = ref('')
const collectionIdFilter = ref('')

// 系列选项（从现有列表提取）
const collectionOptions = ref<{ id: string; title: string }[]>([])

async function fetchList() {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
    }
    if (statusFilter.value) params.status = statusFilter.value
    if (collectionIdFilter.value) params.collectionId = collectionIdFilter.value
    const res = await productsApi.getProducts(params)
    list.value = res.data.data.items
    total.value = res.data.data.total
    // 提取系列选项
    const seen = new Set(collectionOptions.value.map((c) => c.id))
    for (const p of list.value) {
      const cid = p.collectionId || ''
      if (cid && !seen.has(cid)) {
        seen.add(cid)
        collectionOptions.value.push({ id: cid, title: p.collectionName || '' })
      }
    }
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
  router.push('/admin/shop/products/create')
}

function handleEdit(id: string) {
  router.push(`/admin/shop/products/${id}/edit`)
}

async function handleToggleStatus(row: Product) {
  const newStatus = !row.published
  const label = newStatus ? '上架' : '下架'
  try {
    // 假设后端 updateProduct 包含 published 字段的更新
    await productsApi.updateProduct(row.id, { published: newStatus })
    row.published = newStatus
    ElMessage.success(`${row.name} 已${label}`)
  } catch {
    ElMessage.error('操作失败')
  }
}

async function handleDelete(id: string, name: string) {
  try {
    await productsApi.deleteProduct(id)
    ElMessage.success(`商品「${name}」已删除`)
    fetchList()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>商品管理</h2>
      <el-button type="primary" @click="handleCreate">新增商品</el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索商品名称 / slug"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select
        v-model="collectionIdFilter"
        placeholder="所属系列"
        clearable
        style="width: 160px"
        @change="handleSearch"
      >
        <el-option
          v-for="col in collectionOptions"
          :key="col.id"
          :label="col.title"
          :value="col.id"
        />
      </el-select>
      <el-select
        v-model="statusFilter"
        placeholder="状态"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option label="在售" value="on_sale" />
        <el-option label="下架" value="off_shelf" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column label="主图" width="80">
        <template #default="{ row }">
          <el-image
            v-if="row.image"
            :src="row.image"
            style="width: 50px; height: 50px; border-radius: 4px"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="商品名称" min-width="180">
        <template #default="{ row }">
          <div>{{ row.name || '' }}</div>
          <div style="font-size: 12px; color: #909399">{{ row.nameEn || '' }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="collectionName" label="所属系列" width="140" />
      <el-table-column label="价格" width="120" align="right">
        <template #default="{ row }">
          <span style="font-weight: 600">{{ row.currency }} {{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.stock <= 5 ? 'danger' : row.stock <= 20 ? 'warning' : ''" size="small">
            {{ row.stock }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.published ? 'success' : 'info'" size="small">
            {{ row.published ? '在售' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row.id)">编辑</el-button>
          <el-button
            size="small"
            :type="row.published ? 'warning' : 'success'"
            @click="handleToggleStatus(row)"
          >
            {{ row.published ? '下架' : '上架' }}
          </el-button>
          <el-popconfirm
            title="确定删除该商品？"
            @confirm="handleDelete(row.id, row.name)"
          >
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
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
