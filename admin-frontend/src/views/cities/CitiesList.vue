<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { citiesApi } from '@/api/cities'
import type { City } from '@/types/city'
import { pickI18n } from '@/types/common'
import { resolveMediaUrl } from '@/utils/media'
import { useListPage } from '@/composables/useListPage'
import { ListToolbar } from '@/components/list'

const router = useRouter()

// ─── 列表数据 (useListPage) ─────────────
const {
  loading, list, total, page, pageSize,
  filters,
  handlePageChange, handleSizeChange,
  handleSearch, handleReset,
  handleDelete,
} = useListPage<City>({
  fetchApi: async (params) => {
    const res = await citiesApi.getCities(params as any)
    // Hydrate broken i18n names by fetching detail
    const data = res.data?.data
    if (data?.data) {
      data.data = await hydrateBrokenNames(data.data)
    }
    return res
  },
  deleteApi: (id) => citiesApi.deleteCity(id),
  defaultFilters: { keyword: '', status: '' },
})

// ─── 城市名修复 ──────────────────────────
function isReadableName(value: string) {
  const text = value.trim()
  if (!text) return false
  if (text.includes('�')) return false
  return /[一-鿿A-Za-z0-9]/.test(text)
}

function displayCityName(city: City, locale: 'zh' | 'en' = 'zh') {
  return pickI18n(city.name, locale) || (locale === 'zh' ? city.slug : '')
}

async function hydrateBrokenNames(items: City[]) {
  const brokenItems = items.filter((item) => !isReadableName(displayCityName(item)))
  if (!brokenItems.length) return items

  const detailMap = new Map<string, City>()
  await Promise.all(
    brokenItems.map(async (item) => {
      try {
        const res = await citiesApi.getCity(item.id)
        detailMap.set(item.id, res.data.data)
      } catch {
        // Keep list payload as fallback if detail fetch fails.
      }
    }),
  )

  return items.map((item) => detailMap.get(item.id) || item)
}

// ─── 操作 ──────────────────────────────
function handleCreate() {
  router.push('/admin/cities/create')
}

function handleEdit(id: string) {
  router.push(`/admin/cities/${id}/edit`)
}

function regionColor(region: string) {
  const map: Record<string, string> = {
    'Pearl River Delta': '#409EFF',
    'Southern coast': '#67C23A',
    'Eastern coast': '#E6A23C',
  }
  return map[region] || '#909399'
}
</script>

<template>
  <div class="cities-page">
    <div class="page-header">
      <h2>城市管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">新增城市</el-button>
    </div>

    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="搜索城市名/Slug..."
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-select
        v-model="filters.status"
        placeholder="状态"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option label="全部" value="" />
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
      </el-select>
    </ListToolbar>

    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="list" stripe style="width: 100%" row-key="id">
        <el-table-column label="缩略图" width="92">
          <template #default="{ row }">
            <el-image
              :src="resolveMediaUrl(row.heroImage)"
              fit="cover"
              style="width: 52px; height: 52px; border-radius: 6px; background: #f5f7fa"
              :preview-src-list="resolveMediaUrl(row.heroImage) ? [resolveMediaUrl(row.heroImage)] : []"
              preview-teleported
            >
              <template #error>
                <div class="image-fallback">加载失败</div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column label="城市名" min-width="180">
          <template #default="{ row }">
            <div>
              <div class="city-name">{{ displayCityName(row) }}</div>
              <div class="city-name-en">{{ displayCityName(row, 'en') || row.slug }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="slug" label="Slug" width="140" />

        <el-table-column label="地区标签" width="160">
          <template #default="{ row }">
            <el-tag :color="regionColor(pickI18n(row.regionLabel) || '')" effect="dark" size="small">
              {{ pickI18n(row.regionLabel) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="标签" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-for="(tag, idx) in row.tags || []"
              :key="idx"
              size="small"
              style="margin: 2px"
            >
              {{ pickI18n(tag) || tag }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="段落数" width="90" align="center">
          <template #default="{ row }">
            {{ row.sections?.length || 0 }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.published ? 'success' : 'info'" size="small">
              {{ row.published ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" size="small" @click="handleEdit(row.id)">
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" size="small" @click="handleDelete(row.id, displayCityName(row))">
              删除
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
.cities-page {
  padding: 0;
}

.city-name {
  font-weight: 600;
  color: var(--lt-text-primary, #303133);
}

.city-name-en {
  margin-top: 4px;
  font-size: 12px;
  color: var(--lt-text-secondary, #909399);
}

.image-fallback {
  width: 52px;
  height: 52px;
}
</style>
