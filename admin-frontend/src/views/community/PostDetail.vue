<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import type { CommunityPost, PostStatus, PostChannel } from '@/types/community'
import { PostChannelMap, PostChannelColorMap, PostStatusMap, PostStatusColorMap } from '@/types/community'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const post = ref<CommunityPost | null>(null)

async function fetchPost() {
  loading.value = true
  try {
    const res = await communityApi.getPost(route.params.id as string)
    post.value = res.data.data
  } catch {
    ElMessage.error('帖子不存在')
    router.push('/admin/community')
  } finally {
    loading.value = false
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

async function handleReview(status: PostStatus) {
  if (!post.value) return
  try {
    await communityApi.reviewPost(post.value.id, status)
    ElMessage.success(status === 'published' ? '审核通过' : '已隐藏')
    await fetchPost()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function handleDelete() {
  if (!post.value) return
  try {
    await communityApi.deletePost(post.value.id)
    ElMessage.success('帖子已删除')
    router.push('/admin/community')
  } catch {
    ElMessage.error('删除失败')
  }
}

function handleBack() {
  router.push('/admin/community')
}

onMounted(() => { fetchPost() })
</script>

<template>
  <div class="detail-page" v-loading="loading">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="handleBack">返回列表</el-button>
      <h2>帖子详情</h2>
    </div>

    <template v-if="post">
      <!-- 帖子主体 -->
      <el-card shadow="never" class="post-card">
        <!-- 图片 -->
        <div v-if="post.image" class="post-image-wrap">
          <el-image
            :src="post.image"
            fit="cover"
            style="width: 100%; max-height: 400px; border-radius: 8px"
            preview-teleported
          />
        </div>

        <!-- 标题 -->
        <h1 class="post-title">{{ post.title }}</h1>

        <!-- 元数据行 -->
        <div class="post-meta">
          <div class="post-user">
            <el-avatar v-if="post.userAvatar" :src="post.userAvatar" :size="36" />
            <div>
              <div class="post-user-name">{{ post.userName }}</div>
              <div class="post-user-handle">@{{ post.userHandle }}</div>
            </div>
          </div>
          <div class="post-info">
            <el-tag :type="getChannelType(post.channel)" size="small" effect="plain">
              {{ getChannelLabel(post.channel) }}
            </el-tag>
            <span class="post-meta-item">{{ post.date }}</span>
            <span class="post-meta-item">{{ post.location }}</span>
            <span v-if="post.route" class="post-meta-item">路线: {{ post.route }}</span>
            <span v-if="post.mood" class="post-meta-item">心情: {{ post.mood }}</span>
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="post.tags.length" class="post-tags">
          <el-tag
            v-for="tag in post.tags"
            :key="tag"
            size="small"
            style="margin-right: 6px"
          >
            #{{ tag }}
          </el-tag>
        </div>

        <!-- 摘要 -->
        <div class="post-excerpt">
          <em>「{{ post.excerpt }}」</em>
        </div>

        <!-- 正文 -->
        <div class="post-content">
          {{ post.content }}
        </div>

        <!-- 互动数据 -->
        <el-divider />
        <div class="post-interactions">
          <div class="interaction-item">👍 点赞 {{ post.likes }}</div>
          <div class="interaction-item">💬 评论 {{ post.comments }}</div>
          <div class="interaction-item">⭐ 收藏 {{ post.saves }}</div>
        </div>
      </el-card>

      <!-- 审核操作区 -->
      <el-card shadow="never" class="action-card">
        <template #header>
          <span class="card-title">审核操作</span>
        </template>
        <div style="margin-bottom: 12px">
          <span>当前状态：</span>
          <el-tag :type="getStatusType(post.status)" size="default">
            {{ getStatusLabel(post.status) }}
          </el-tag>
        </div>
        <div class="action-buttons">
          <template v-if="post.status === 'pending_review'">
            <el-button type="success" @click="handleReview('published')">审核通过</el-button>
            <el-button type="warning" @click="handleReview('hidden')">隐藏帖子</el-button>
          </template>
          <template v-if="post.status === 'published'">
            <el-button type="warning" @click="handleReview('hidden')">隐藏帖子</el-button>
          </template>
          <template v-if="post.status === 'hidden'">
            <el-button type="success" @click="handleReview('published')">恢复发布</el-button>
          </template>
          <el-popconfirm title="确定删除该帖子？此操作不可恢复" @confirm="handleDelete">
            <template #reference>
              <el-button type="danger">删除帖子</el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 40px;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.page-header h2 { margin: 0; font-size: 20px; color: #303133; }

.post-card { margin-bottom: 20px; }
.post-image-wrap { margin-bottom: 20px; }
.post-title { font-size: 22px; margin: 0 0 16px; color: #303133; line-height: 1.4; }

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.post-user { display: flex; align-items: center; gap: 10px; }
.post-user-name { font-size: 14px; font-weight: 500; color: #303133; }
.post-user-handle { font-size: 12px; color: #909399; }
.post-info { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.post-meta-item { font-size: 13px; color: #606266; }

.post-tags { margin-bottom: 16px; }
.post-excerpt {
  padding: 12px 16px;
  background: #f5f7fa;
  border-left: 3px solid #409eff;
  margin-bottom: 20px;
  border-radius: 0 4px 4px 0;
  color: #606266;
  font-size: 14px;
}
.post-content {
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 14px;
  color: #303133;
}
.post-interactions {
  display: flex;
  gap: 32px;
  font-size: 14px;
  color: #606266;
}
.interaction-item { display: flex; align-items: center; gap: 4px; }

.action-card { margin-bottom: 20px; }
.card-title { font-weight: 600; font-size: 15px; }
.action-buttons { display: flex; gap: 10px; }
</style>
