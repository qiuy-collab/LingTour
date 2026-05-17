<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUser, banUser, unbanUser } from '@/api/users'
import type { ManagedUser } from '@/types/user'
import { UserStatusMap, UserStatusColorMap, LocaleMap } from '@/types/user'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const user = ref<ManagedUser | null>(null)
const loading = ref(false)

async function fetchUser() {
  const id = route.params.id as string
  if (!id) return
  loading.value = true
  try {
    const res = await getUser(id)
    user.value = res.data.data
  } catch {
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

async function handleBan() {
  if (!user.value) return
  try {
    await banUser(user.value.id)
    ElMessage.success(`已封禁用户「${user.value.name}」`)
    fetchUser()
  } catch {
    ElMessage.error('封禁失败')
  }
}

async function handleUnban() {
  if (!user.value) return
  try {
    await unbanUser(user.value.id)
    ElMessage.success(`已解封用户「${user.value.name}」`)
    fetchUser()
  } catch {
    ElMessage.error('解封失败')
  }
}

function goBack() {
  router.push('/admin/users')
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div class="user-detail-page" v-loading="loading">
    <!-- 顶部导航 -->
    <div class="page-nav">
      <el-button :icon="ArrowLeft" link @click="goBack">返回用户列表</el-button>
    </div>

    <template v-if="user">
      <!-- 用户基本信息卡片 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>用户基本信息</span>
            <div class="header-actions">
              <template v-if="user.status === 'active'">
                <el-button type="danger" size="small" @click="handleBan">封禁用户</el-button>
              </template>
              <template v-else>
                <el-button type="success" size="small" @click="handleUnban">解封用户</el-button>
              </template>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="6" class="avatar-col">
            <el-avatar :src="user.avatar" :size="100" />
            <h3 class="user-title-name">{{ user.name }}</h3>
            <el-tag :type="UserStatusColorMap[user.status] as any" size="small">
              {{ UserStatusMap[user.status] }}
            </el-tag>
          </el-col>
          <el-col :xs="24" :sm="18">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户ID">{{ user.id }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
              <el-descriptions-item label="语言偏好">
                <el-tag size="small" type="info">{{ LocaleMap[user.locale] || user.locale }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">{{ formatDate(user.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="口译预约次数">
                <el-tag size="small" type="primary">{{ user.bookingsCount }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="商城订单次数">
                <el-tag size="small" type="warning">{{ user.ordersCount }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>

      <!-- 收藏列表 -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <span>收藏列表（{{ user.favorites.length }} 项）</span>
        </template>
        <el-empty v-if="user.favorites.length === 0" description="暂无收藏" :image-size="80" />
        <div v-else class="favorites-grid">
          <el-tag
            v-for="(slug, idx) in user.favorites"
            :key="idx"
            size="large"
            class="favorite-tag"
          >
            {{ slug }}
          </el-tag>
        </div>
      </el-card>

      <!-- 活动摘要 -->
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-card shadow="never" class="section-card">
            <template #header>
              <span>预约活动</span>
            </template>
            <el-statistic title="累计口译预约" :value="user.bookingsCount" />
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-card shadow="never" class="section-card">
            <template #header>
              <span>消费活动</span>
            </template>
            <el-statistic title="累计商城订单" :value="user.ordersCount" />
          </el-card>
        </el-col>
      </el-row>
    </template>

    <el-empty v-else-if="!loading" description="用户不存在" :image-size="120" />
  </div>
</template>

<style scoped>
.user-detail-page {
  padding: 0;
}

.page-nav {
  margin-bottom: 16px;
}

.info-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.avatar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.user-title-name {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.section-card {
  margin-bottom: 16px;
}

.favorites-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.favorite-tag {
  cursor: default;
}
</style>
