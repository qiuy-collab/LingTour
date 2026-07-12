<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { communityApi } from '@/api/community'
import type { CommunityPost, PostChannel, PostStatus } from '@/types/community'
import { PostChannelMap, PostChannelColorMap, PostStatusMap, PostStatusColorMap } from '@/types/community'
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
} = useListPage<CommunityPost>({
  fetchApi: (params) => communityApi.getPosts(params as any),
  defaultFilters: { keyword: '', channel: '', status: '' },
})

// Actions
function handleViewDetail(post: CommunityPost) {
  router.push(`/admin/community/${post.id}`)
}

async function handleReview(post: CommunityPost, status: PostStatus, rejectionReason?: string) {
  const isPublish = status === 'published'
  const actionText = isPublish ? 'approve' : 'hide'
  try {
    await ElMessageBox.confirm(
      `${actionText === 'approve' ? 'Approve' : 'Hide'} "${post.title || 'this post'}"?`,
      'Confirm action',
      { type: isPublish ? 'success' : 'warning' }
    )
    await communityApi.reviewPost(post.id, status, rejectionReason)
    ElMessage.success(isPublish ? 'Post approved' : 'Post hidden')
    handleSearch()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Action failed')
  }
}

async function handleToggleFeatured(post: CommunityPost) {
  try {
    await communityApi.toggleFeatured(post.id, !post.featured)
    ElMessage.success(post.featured ? 'Removed from featured posts' : 'Marked as featured')
    handleSearch()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || 'Action failed')
  }
}

async function handleDelete(post: CommunityPost) {
  try {
    await ElMessageBox.confirm(
      `Delete "${post.title || 'this post'}"? It can be restored later.`,
      'Confirm deletion',
      { type: 'warning' }
    )
    await communityApi.deletePost(post.id)
    ElMessage.success('Post deleted')
    handleSearch()
  } catch (err: any) {
    if (err?.response) ElMessage.error(err.response.data?.message || 'Deletion failed')
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
</script>

<template>
  <div>
    <div class="page-header">
      <h2>Community posts</h2>
    </div>

    <ListToolbar
      v-model="filters.keyword"
      search-placeholder="Search by title or author"
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-select
        v-model="filters.channel"
        placeholder="Channel"
        clearable
        style="width: 150px"
        @change="handleSearch"
      >
        <el-option label="All channels" value="" />
        <el-option label="Field Notes" value="FieldNotes" />
        <el-option label="Food Map" value="FoodMap" />
        <el-option label="Hidden Stop" value="HiddenStop" />
        <el-option label="Culture Desk" value="CultureDesk" />
      </el-select>
      <el-select
        v-model="filters.status"
        placeholder="Status"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="All statuses" value="" />
        <el-option label="Published" value="published" />
        <el-option label="Pending review" value="pending_review" />
        <el-option label="Hidden" value="hidden" />
      </el-select>
    </ListToolbar>

    <el-card shadow="never" class="table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column label="Image" width="90">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="resolveMediaUrl(row.image)"
              class="admin-list-thumb"
              fit="cover"
              preview-teleported
            />
            <span v-else class="admin-list-empty">No image</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="Title" min-width="180" show-overflow-tooltip />
        <el-table-column label="Author" width="150">
          <template #default="{ row }">
            <div class="admin-list-inline">
              <el-avatar v-if="row.userAvatar" :src="row.userAvatar" :size="28" />
              <div>
                <div style="font-size: 13px">{{ row.userName }}</div>
                <div class="admin-list-meta-compact">@{{ row.userHandle }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Channel" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getChannelType(row.channel)" size="small">
              {{ getChannelLabel(row.channel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="Date" width="110" align="center" />
        <el-table-column label="Engagement" width="130" align="center">
          <template #default="{ row }">
            <span class="admin-list-note">{{ formatInteractions(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Featured" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.featured" type="warning" size="small">★</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">Details</el-button>
            <template v-if="row.status === 'pending_review'">
              <el-button type="success" link size="small" @click="handleReview(row, 'published')">
                Approve
              </el-button>
              <el-button type="warning" link size="small" @click="handleReview(row, 'hidden')">
                Hide
              </el-button>
            </template>
            <template v-if="row.status === 'published'">
              <el-button type="warning" link size="small" @click="handleReview(row, 'hidden')">
                Hide
              </el-button>
            </template>
            <template v-if="row.status === 'hidden'">
              <el-button type="success" link size="small" @click="handleReview(row, 'published')">
                Restore
              </el-button>
            </template>
            <el-button
              :type="row.featured ? 'info' : 'warning'"
              link
              size="small"
              @click="handleToggleFeatured(row)"
            >
              {{ row.featured ? 'Unfeature' : 'Feature' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">Delete</el-button>
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
