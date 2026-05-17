<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { citiesApi } from '@/api/cities'
import type { City } from '@/types/city'
import type { PaginatedResponse } from '@/types/common'

const router = useRouter()

// ─── 列表数据 ──────────────────────────────
const loading = ref(false)
const list = ref<City[]>([])
const total = ref(0)
const pageParams = reactive({ page: 1, pageSize: 10, keyword: '' })

// ─── 获取列表 ──────────────────────────────
async function fetchList() {
  loading.value = true
  try {
    const res = await citiesApi.getCities(pageParams)
    const data: PaginatedResponse<City> = res.data.data
    list.value = data.items
    total.value = data.total
  } catch {
    ElMessage.error('获取城市列表失败')
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
  router.push('/admin/cities/create')
}

function handleEdit(id: string) {
  router.push(`/admin/cities/${id}/edit`)
}

async function handleDelete(city: City) {
  try {
    await citiesApi.deleteCity(city.id)
    ElMessage.success(`已删除城市「${city.name}」`)
    fetchList()
  } catch {
    ElMessage.error('删除失败')
  }
}

// 地区标签颜色映射
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
    <!-- 搜索栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="pageParams.keyword"
          placeholder="搜索城市名/Slug..."
          :prefix-icon="Search"
          clearable
          style="width: 280px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        新增城市
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
        <el-table-column label="缩略图" width="80">
          <template #default="{ row }">
            <el-image
              :src="row.heroImage"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px"
              :preview-src-list="[row.heroImage]"
              preview-teleported
            />
          </template>
        </el-table-column>

        <el-table-column prop="name" label="城市名" min-width="120">
          <template #default="{ row }">
            <div>
              <div class="city-name">{{ row.name }}</div>
              <div class="city-name-en">{{ row.nameEn }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="slug" label="Slug" width="120" />

        <el-table-column label="地区标签" width="160">
          <template #default="{ row }">
            <el-tag
              :color="regionColor(row.regionLabel)"
              effect="dark"
              size="small"
            >
              {{ row.regionLabel }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="标签" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              style="margin: 2px"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="段落数" width="80" align="center">
          <template #default="{ row }">
            {{ row.sections?.length || 0 }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'published' ? 'success' : 'info'"
              size="small"
            >
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
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
            <el-popconfirm
              :title="`确定删除城市「${row.name}」吗？`"
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
.cities-page {
  padding: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.city-name {
  font-weight: 600;
  color: #303133;
}

.city-name-en {
  font-size: 12px;
  color: #909399;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
