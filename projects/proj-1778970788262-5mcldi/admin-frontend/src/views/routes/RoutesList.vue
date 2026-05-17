<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { routesApi } from '@/api/routes'
import type { Route } from '@/types/route'
import type { PaginatedResponse } from '@/types/common'

const router = useRouter()

// ─── 文化标签映射 ──────────────────────────
const cultureTagMap: Record<string, { label: string; color: string }> = {
  Guangfu: { label: '广府', color: '#409EFF' },
  Chaoshan: { label: '潮汕', color: '#E6A23C' },
  Hakka: { label: '客家', color: '#67C23A' },
  Coastal: { label: '滨海', color: '#00B5AD' },
  BayArea: { label: '湾区', color: '#9C27B0' },
  Mountain: { label: '山川', color: '#FF5722' },
}

function getCultureTagInfo(tag: string) {
  return cultureTagMap[tag] || { label: tag, color: '#909399' }
}

const statusMap: Record<string, { label: string; type: 'info' | 'success' | 'danger' }> = {
  draft: { label: '草稿', type: 'info' },
  published: { label: '已发布', type: 'success' },
  archived: { label: '已下架', type: 'danger' },
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
  } catch {
    ElMessage.error('获取路线列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)

watch(
  () => pageParams.page,
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
  try {
    await routesApi.deleteRoute(routeItem.id)
    ElMessage.success(`已删除路线「${routeItem.title}」`)
    fetchList()
  } catch {
    ElMessage.error('删除失败')
  }
}

async function handleToggleStatus(routeItem: Route) {
  const newStatus = routeItem.status === 'published' ? 'archived' : 'published'
  try {
    await routesApi.updateRouteStatus(routeItem.id, newStatus)
    routeItem.status = newStatus as Route['status']
    ElMessage.success(newStatus === 'published' ? '已上架' : '已下架')
  } catch {
    ElMessage.error('状态更新失败')
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
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        新增路线
      </el-button>
    </div>

    <!-- 列表表格 -->
    <el-card shadow="never">
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

        <el-table-column prop="title" label="标题" min-width="180">
          <template #default="{ row }">
            <div>
              <div class="route-title">{{ row.title }}</div>
              <div class="route-title-en">{{ row.titleEn }}</div>
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

        <el-table-column prop="cityName" label="城市" width="80" />

        <el-table-column prop="duration" label="时长" width="90" />

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
            <el-tag :type="statusMap[row.status]?.type || 'info'" size="small">
              {{ statusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
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
              :type="row.status === 'published' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'published' ? '下架' : '上架' }}
            </el-button>
            <el-popconfirm
              :title="`确定删除路线「${row.title}」吗？`"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link :icon="Delete" size="small">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.route-title {
  font-weight: 600;
  color: #303133;
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
