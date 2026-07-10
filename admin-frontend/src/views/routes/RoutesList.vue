<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { routesApi } from '@/api/routes'
import type { Route } from '@/types/route'
import { pickI18n } from '@/types/common'
import { formatRouteTagLabel, normalizeRouteTag } from '@/constants/guangdongRegions'
import { useListPage } from '@/composables/useListPage'
import { ListToolbar } from '@/components/list'
import { resolveMediaUrl } from '@/utils/media'

const router = useRouter()

// Culture-tag presentation
const cultureTagMap: Record<string, { label: string; color: string }> = {
  'Bay Area': { label: formatRouteTagLabel('Bay Area'), color: 'var(--lt-route-bay)' },
  Chaoshan: { label: formatRouteTagLabel('Chaoshan'), color: 'var(--lt-route-chaoshan)' },
  Hakka: { label: formatRouteTagLabel('Hakka'), color: 'var(--lt-route-hakka)' },
  Coastal: { label: formatRouteTagLabel('Coastal'), color: 'var(--lt-route-coastal)' },
  Mountain: { label: formatRouteTagLabel('Mountain'), color: 'var(--lt-route-mountain)' },
}

function getCultureTagInfo(tag: string) {
  const normalizedTag = normalizeRouteTag(tag)
  return cultureTagMap[normalizedTag] || { label: normalizedTag, color: 'var(--lt-info)' }
}

// List data
const {
  loading, list, total, page, pageSize,
  filters,
  handlePageChange, handleSizeChange,
  handleSearch, handleReset,
  handleDelete,
} = useListPage<Route>({
  fetchApi: (params) => routesApi.getRoutes(params as any),
  deleteApi: (id) => routesApi.deleteRoute(id),
  defaultFilters: { keyword: '', status: '', cityName: '' },
})

// City options derived from loaded records
const cityOptions = computed(() => {
  const cities = new Set(list.value.map((r) => r.cityName).filter(Boolean))
  return Array.from(cities).sort()
})

// Actions
function handleCreate() {
  router.push('/admin/routes/create')
}

function handleEdit(id: string) {
  router.push(`/admin/routes/${id}/edit`)
}

async function handleToggleStatus(routeItem: Route) {
  try {
    if (routeItem.published) {
      await routesApi.unpublishRoute(routeItem.id)
      routeItem.published = false
      ElMessage.success('Route unpublished')
    } else {
      await routesApi.publishRoute(routeItem.id)
      routeItem.published = true
      ElMessage.success('Route published')
    }
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || 'Failed to update route status')
  }
}
</script>

<template>
  <div class="routes-page">
    <div class="page-header">
      <h2>Routes</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">Add route</el-button>
    </div>

    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="Search by title or slug..."
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-select
        v-model="filters.status"
        placeholder="Status"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option label="All" value="" />
        <el-option label="Draft" value="draft" />
        <el-option label="Published" value="published" />
        <el-option label="Archived" value="archived" />
      </el-select>
      <el-select
        v-model="filters.cityName"
        placeholder="City"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option
          v-for="city in cityOptions"
          :key="city"
          :label="city"
          :value="city"
        />
      </el-select>
    </ListToolbar>

    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        row-key="id"
      >
        <el-table-column label="Cover" width="80">
          <template #default="{ row }">
            <el-image
              :src="resolveMediaUrl(row.coverImage)"
              fit="cover"
              class="admin-list-thumb"
              :preview-src-list="resolveMediaUrl(row.coverImage) ? [resolveMediaUrl(row.coverImage)] : []"
              preview-teleported
            />
          </template>
        </el-table-column>

        <el-table-column label="Title" min-width="180">
          <template #default="{ row }">
            <div>
              <div class="route-title">{{ pickI18n(row.title) }}</div>
              <div class="route-title-en">{{ pickI18n(row.title, 'en') }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="slug" label="Slug" width="130" />

        <el-table-column label="Culture" width="100">
          <template #default="{ row }">
            <el-tag
              :color="getCultureTagInfo(row.cultureTag).color"
              effect="dark"
              size="small"
            >
              {{ getCultureTagInfo(row.cultureTag).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="cityName" label="City" width="100">
          <template #default="{ row }">
            {{ row.cityName }}
          </template>
        </el-table-column>

        <el-table-column prop="duration" label="Duration" width="90">
          <template #default="{ row }">
            {{ row.duration }}
          </template>
        </el-table-column>

        <el-table-column label="Stops" width="80" align="center">
          <template #default="{ row }">
            <el-tag round size="small">{{ row.stops?.length || 0 }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Price" width="90">
          <template #default="{ row }">
            ¥{{ row.price || 0 }}
          </template>
        </el-table-column>

        <el-table-column label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.published ? 'success' : 'info'" size="small">
              {{ row.published ? 'Published' : 'Draft' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="Edit"
              size="small"
              @click="handleEdit(row.id)"
            >
              Edit
            </el-button>
            <el-button
              link
              :type="row.published ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.published ? 'Unpublish' : 'Publish' }}
            </el-button>
            <el-button
              type="danger"
              link
              :icon="Delete"
              size="small"
              @click="handleDelete(row.id, pickI18n(row.title as any))"
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

<style scoped>
.routes-page {
  padding: 0;
}

.route-title {
  font-weight: 600;
  color: var(--lt-text-primary, #303133);
}

.route-title-en {
  font-size: 12px;
  color: var(--lt-text-secondary);
}
</style>
