<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { communityApi } from '@/api/community'
import type { CommunityPost, PostChannel, PostStatus } from '@/types/community'
import { PostChannelMap, PostChannelColorMap, PostStatusMap, PostStatusColorMap } from '@/types/community'

const router = useRouter()

// ─── 数据 ──────────────────────────────
const loading = ref(false)
const list = ref<CommunityPost[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const channelFilter = ref('')
const statusFilter = ref('')
const keyword = ref('')

async function fetchList() {
  loading.value = true
  try {
    const res = await communityApi.getPosts({
      page: page.value,
      pageSize: pageSize.value,
      channel: channelFilter.value,
      status: statusFilter.value,
      keyword: keyword.value || undefined,
    } as any)
    list.value = res.data.data.items
    total.value = res.data.data.total
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '加载帖子列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handlePageChange(p: number) { page.value = p; fetchList() }
function handleSizeChange(s: number) { pageSize.value = s; page.value = 1; fetchList() }

// ─── 操作 ──────────────────────────────
function handleViewDetail(post: CommunityPost) {
  router.push(`/admin/community/${post.id}`)
}

async function handleReview(post: CommunityPost, status: PostStatus, rejectionReason?: string) {
  const isPublish = status === 'published'
  const actionText = isPublish ? '审核通过' : '隐藏帖子'
  try {
    await ElMessageBox.confirm(
      `确定${actionText}「${post.title || '该帖子'}」?`,
      `${actionText}确认`,
      { type: isPublish ? 'success' : 'warning' }
    )
    await communityApi.reviewPost(post.id, status, rejectionReason)
    ElMessage.success(isPublish ? '审核通过' : '已隐藏')
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '操作失败')
  }
}

async function handleToggleFeatured(post: CommunityPost) {
  try {
    await communityApi.toggleFeatured(post.id, !post.featured)
    ElMessage.success(post.featured ? '已取消精选' : '已设为精选')
    fetchList()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '操作失败')
  }
}

async function handleDelete(post: CommunityPost) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${post.title || '该帖子'}」?为软删除,可在后台恢复。`,
      '删除确认',
      { type: 'warning' }
    )
    await communityApi.deletePost(post.id)
    ElMessage.success('帖子已删除(软删除)')
    fetchList()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || '删除失败')
  }
}

function getChannelLabel(channel: string): string {
  return PostChannelMap[channel as PostChannel] || channel
}
function getChannelType(channel: string): string {
  return PostChannelColorMap[channel as PostChannel] || ''
}
function getStatusLabel(status: string): string {
  return PostStatusMap[status as PostStatus] || status
}
function getStatusType(status: string): string {
  return PostStatusColorMap[status as PostStatus] || 'info'
}

function formatInteractions(post: CommunityPost): string {
  return `👍${post.likes} 💬${post.comments} ⭐${post.saves}`
}

onMounted(() => { fetchList() })
</script>

<template>
  <div>
    <div class="page-header">
      <h2>社区帖子管理</h2>
    </div>

    <!-- 筛选栏 -->
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索标题/作者"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select
        v-model="channelFilter"
        placeholder="频道筛选"
        clearable
        style="width: 150px"
        @change="handleSearch"
      >
        <el-option label="全部频道" value="" />
        <el-option label="田野笔记" value="FieldNotes" />
        <el-option label="美食地图" value="FoodMap" />
        <el-option label="秘境停靠" value="HiddenStop" />
        <el-option label="文化台" value="CultureDesk" />
      </el-select>
      <el-select
        v-model="statusFilter"
        placeholder="状态筛选"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="全部状态" value="" />
        <el-option label="已发布" value="published" />
        <el-option label="待审核" value="pending_review" />
        <el-option label="已隐藏" value="hidden" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column label="图片" width="90">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="row.image"
              style="width: 50px; height: 50px; border-radius: 4px"
              fit="cover"
              preview-teleported
            />
            <span v-else style="color: #c0c4cc">无图</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="用户" width="150">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-avatar v-if="row.userAvatar" :src="row.userAvatar" :size="28" />
              <div>
                <div style="font-size: 13px">{{ row.userName }}</div>
                <div style="font-size: 11px; color: #909399">@{{ row.userHandle }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="频道" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getChannelType(row.channel)" size="small">
              {{ getChannelLabel(row.channel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="110" align="center" />
        <el-table-column label="互动" width="130" align="center">
          <template #default="{ row }">
            <span style="font-size: 12px; color: #606266">{{ formatInteractions(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="精选" width="70" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.featured" type="warning" size="small">★</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button>
            <template v-if="row.status === 'pending_review'">
              <el-button type="success" link size="small" @click="handleReview(row, 'published')">
                通过
              </el-button>
              <el-button type="warning" link size="small" @click="handleReview(row, 'hidden')">
                隐藏
              </el-button>
            </template>
            <template v-if="row.status === 'published'">
              <el-button type="warning" link size="small" @click="handleReview(row, 'hidden')">
                隐藏
              </el-button>
            </template>
            <template v-if="row.status === 'hidden'">
              <el-button type="success" link size="small" @click="handleReview(row, 'published')">
                恢复
              </el-button>
            </template>
            <el-button
              :type="row.featured ? 'info' : 'warning'"
              link
              size="small"
              @click="handleToggleFeatured(row)"
            >
              {{ row.featured ? '取消精选' : '精选' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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
