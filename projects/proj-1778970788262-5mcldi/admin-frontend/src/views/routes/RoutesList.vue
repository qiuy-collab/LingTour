<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { routesApi } from '@/api/routes'
import type { Route } from '@/types/route'
import type { PaginatedResponse } from '@/types/common'
import { pickI18n } from '@/types/common'
import { formatRouteTagLabel, normalizeRouteTag } from '@/constants/guangdongRegions'

const router = useRouter()

// ─── 文化标签映射 ──────────────────────────
const cultureTagMap: Record<string, { label: string; color: string }> = {
  'Bay Area': { label: formatRouteTagLabel('Bay Area'), color: '#409EFF' },
  Chaoshan: { label: formatRouteTagLabel('Chaoshan'), color: '#E6A23C' },
  Hakka: { label: formatRouteTagLabel('Hakka'), color: '#67C23A' },
  Coastal: { label: formatRouteTagLabel('Coastal'), color: '#00B5AD' },
  Mountain: { label: formatRouteTagLabel('Mountain'), color: '#FF5722' },
}

function getCultureTagInfo(tag: string) {
  const normalizedTag = normalizeRouteTag(tag)
  return cultureTagMap[normalizedTag] || { label: normalizedTag, color: '#909399' }
}

// ─── 列表数据 ──────────────────────────────
const loading = ref(false)
const list = ref<Route[]>([])
const total = ref(0)
const pageParams = reactive({ page: 1, pageSize: 10, keyword: '', status: '', cityName: '' })

async function fetchList() {
  loading.value = true
  try {
    const res = await routesApi.getRoutes(pageParams)
    const data: PaginatedResponse<Route> = res.data.data
    list.value = data.items
    total.value = data.total
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '获取路线列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)

watch(
  () => [pageParams.page, pageParams.pageSize],
  () => fetchList()
)

function handleSearch() {
  pageParams.page = 1
  fetchList()
}

// ─── 操作 ──────────────────────────────
function handleCreate() {
  router.push('/admin/routes/create')
}

function handleEdit(id: string) {
  router.push(`/admin/routes/${id}/edit`)
}

async function handleDelete(routeItem: Route) {
  const title = pickI18n(routeItem.title as any) || '该路线'
  try {
    await ElMessageBox.confirm(
      `确定删除路线「${title}」?该操作不可恢复。`,
      '删除确认',
      { type: 'warning' }
    )
    await routesApi.deleteRoute(routeItem.id)
    ElMessage.success(`已删除路线「${title}」`)
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '删除失败')
  }
}

async function handleToggleStatus(routeItem: Route) {
  try {
    if (routeItem.published) {
      await routesApi.unpublishRoute(routeItem.id)
      routeItem.published = false
      ElMessage.success('已下架')
    } else {
      await routesApi.publishRoute(routeItem.id)
      routeItem.published = true
      ElMessage.success('已发布')
    }
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '状态更新失败')
  }
}

// ─── 城市选项（从列表中提取） ────────────
const cityOptions = computed(() => {
  const cities = new Set(list.value.map((r) => r.cityName).filter(Boolean))
  return Array.from(cities).sort()
})
</script>

<template>
  <div class="routes-page">
    <div class="page-header">
      <h2>路线管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">新增路线</el-button>
    </div>

    <!-- 搜索筛选栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="pageParams.keyword"
          placeholder="搜索标题/Slug..."
          :prefix-icon="Search"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="pageParams.status"
          placeholder="状态筛选"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已下架" value="archived" />
        </el-select>
        <el-select
          v-model="pageParams.cityName"
          placeholder="城市筛选"
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
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <!-- 列表表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        row-key="id"
      >
        <el-table-column label="封面" width="80">
          <template #default="{ row }">
            <el-image
              :src="row.coverImage"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px"
              :preview-src-list="[row.coverImage]"
              preview-teleported
            />
          </template>
        </el-table-column>

        <el-table-column label="标题" min-width="180">
          <template #default="{ row }">
            <div>
              <div class="route-title">{{ pickI18n(row.title) }}</div>
              <div class="route-title-en">{{ pickI18n(row.title, 'en') }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="slug" label="Slug" width="130" />

        <el-table-column label="文化标签" width="100">
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

        <el-table-column prop="cityName" label="城市" width="100">
          <template #default="{ row }">
            {{ row.cityName }}
          </template>
        </el-table-column>

        <el-table-column prop="duration" label="时长" width="90">
          <template #default="{ row }">
            {{ row.duration }}
          </template>
        </el-table-column>

        <el-table-column label="站点数" width="80" align="center">
          <template #default="{ row }">
            <el-tag round size="small">{{ row.stops?.length || 0 }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="价格" width="90">
          <template #default="{ row }">
            ¥{{ row.price || 0 }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.published ? 'success' : 'info'" size="small">
              {{ row.published ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="Edit"
              size="small"
              @click="handleEdit(row.id)"
            >
              编辑
            </el-button>
            <el-button
              link
              :type="row.published ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.published ? '下架' : '发布' }}
            </el-button>
            <el-button type="danger" link :icon="Delete" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pageParams.page"
          v-model:page-size="pageParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
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
  color: #909399;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
