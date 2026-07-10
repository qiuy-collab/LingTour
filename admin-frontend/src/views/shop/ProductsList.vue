<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productsApi } from '@/api/products'
import { collectionsApi } from '@/api/collections'
import type { Product } from '@/types/product'
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
} = useListPage<Product>({
  fetchApi: (params) => productsApi.getProducts(params as any),
  deleteApi: (id) => productsApi.deleteProduct(id),
  defaultFilters: { keyword: '', status: '', collectionId: '' },
})

// Collection options
const collectionOptions = ref<{ id: string; title: string }[]>([])

async function fetchCollections() {
  try {
    const res = await collectionsApi.getCollections({ page: 1, pageSize: 100 } as any)
    collectionOptions.value = (res.data.data.data || []).map((c: any) => ({
      id: c.id,
      title: pickI18n(c.title) || c.slug || c.id,
    }))
  } catch {
    /* keep silent */
  }
}

onMounted(fetchCollections)

// Actions
function handleCreate() {
  router.push('/admin/shop/products/create')
}

function handleEdit(id: string) {
  router.push(`/admin/shop/products/${id}/edit`)
}

async function handleToggleStatus(row: Product) {
  const newStatus = !row.published
  const action = newStatus ? 'publish' : 'unpublish'
  const productName = pickI18n(row.name as any) || 'this product'
  try {
    await ElMessageBox.confirm(`${action === 'publish' ? 'Publish' : 'Unpublish'} "${productName}"?`, 'Confirm status change', {
      type: newStatus ? 'success' : 'warning',
    })
    await productsApi.updateProduct(row.id, { published: newStatus })
    row.published = newStatus
    ElMessage.success(`${productName} ${newStatus ? 'is now on sale' : 'has been taken off sale'}`)
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Failed to update product status')
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h2>Products</h2>
      <el-button type="primary" @click="handleCreate">Add product</el-button>
    </div>

    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="Search by product name or slug"
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-select
        v-model="filters.collectionId"
        placeholder="Collection"
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
        v-model="filters.status"
        placeholder="Status"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option label="On sale" value="on_sale" />
        <el-option label="Off sale" value="off_shelf" />
      </el-select>
    </ListToolbar>

    <el-card shadow="never" class="table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column label="Image" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="resolveMediaUrl(row.image)"
              class="admin-list-thumb"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="Product" min-width="180">
          <template #default="{ row }">
            <div>{{ pickI18n(row.name) }}</div>
            <div class="admin-list-meta">{{ pickI18n(row.name, 'en') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Collection" width="160">
          <template #default="{ row }">
            {{ pickI18n(row.collectionName) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Price" width="120" align="right">
          <template #default="{ row }">
            <span style="font-weight: 600">{{ row.currency }} {{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="Stock" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.stock <= 5 ? 'danger' : row.stock <= 20 ? 'warning' : ''" size="small">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.published ? 'success' : 'info'" size="small">
              {{ row.published ? 'On sale' : 'Off sale' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row.id)">Edit</el-button>
            <el-button
              :type="row.published ? 'warning' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.published ? 'Unpublish' : 'Publish' }}
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row.id, pickI18n(row.name as any))"
            >
              Delete
            </el-button>
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
