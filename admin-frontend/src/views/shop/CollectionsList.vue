<script setup lang="ts">
import { useRouter } from 'vue-router'
import { collectionsApi } from '@/api/collections'
import type { StoreCollection } from '@/types/collection'
import { pickI18n } from '@/types/common'
import { useListPage } from '@/composables/useListPage'
import { ListToolbar } from '@/components/list'
import { resolveMediaUrl } from '@/utils/media'

const router = useRouter()

// List data
const {
  loading, list, total, page, pageSize,
  filters,
  handlePageChange, handleSizeChange,
  handleSearch, handleReset,
  handleDelete,
} = useListPage<StoreCollection>({
  fetchApi: (params) => collectionsApi.getCollections(params as any),
  deleteApi: (id) => collectionsApi.deleteCollection(id),
  defaultFilters: { keyword: '' },
})

// Deletion using the localized record name
function handleDeleteCollection(row: StoreCollection) {
  const title = pickI18n(row.title as any) || 'this collection'
  handleDelete(row.id, title)
}

// Actions
function handleCreate() {
  router.push('/admin/shop/collections/create')
}

function handleEdit(id: string) {
  router.push(`/admin/shop/collections/${id}/edit`)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2>Collections</h2>
      <el-button type="primary" @click="handleCreate">Add collection</el-button>
    </div>

    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="Search by collection name or slug"
      @search="handleSearch"
      @reset="handleReset"
    />

    <el-card shadow="never" class="table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column label="Cover" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="resolveMediaUrl(row.image)"
              class="admin-list-thumb"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="Collection" min-width="180">
          <template #default="{ row }">
            <div>{{ pickI18n(row.title) }}</div>
            <div class="admin-list-meta">{{ pickI18n(row.title, 'en') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Linked route" width="160">
          <template #default="{ row }">
            {{ pickI18n(row.routeName) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="productCount" label="Products" width="90" align="center">
          <template #default="{ row }">
            <el-badge :value="row.productCount" type="primary" />
          </template>
        </el-table-column>
        <el-table-column prop="published" label="Status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.published ? 'success' : 'info'" size="small">
              {{ row.published ? 'Published' : 'Draft' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row.id)">Edit</el-button>
            <el-button type="danger" link size="small" @click="handleDeleteCollection(row)">Delete</el-button>
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
</style>
