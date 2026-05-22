<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { banUser, getUser, unbanUser, updateUserProfile } from '@/api/users'
import type {
  ManagedUser,
  ProfileVisibility,
  UpdateUserProfilePayload,
} from '@/types/user'
import {
  LocaleMap,
  UserStatusColorMap,
  UserStatusMap,
  VisibilityMap,
} from '@/types/user'

const route = useRoute()
const router = useRouter()

const user = ref<ManagedUser | null>(null)
const loading = ref(false)
const saving = ref(false)
const form = reactive<UpdateUserProfilePayload>({
  name: '',
  avatarUrl: '',
  country: '',
  homeBase: '',
  travelStyle: '',
  bio: '',
  profileVisibility: 'public',
})

const visibilityOptions: ProfileVisibility[] = ['public', 'community', 'private']

const latestDispatchLabel = computed(() => {
  if (!user.value?.latestDispatchAt) return '-'
  return formatDateTime(user.value.latestDispatchAt)
})

function applyForm(nextUser: ManagedUser) {
  form.name = nextUser.name || ''
  form.avatarUrl = nextUser.avatar || ''
  form.country = nextUser.country || ''
  form.homeBase = nextUser.homeBase || ''
  form.travelStyle = nextUser.travelStyle || ''
  form.bio = nextUser.bio || ''
  form.profileVisibility = nextUser.profileVisibility || 'public'
}

async function fetchUser() {
  const id = route.params.id as string
  if (!id) return
  loading.value = true
  try {
    const res = await getUser(id)
    user.value = res.data.data
    applyForm(res.data.data)
  } catch {
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  if (!user.value) return
  saving.value = true
  try {
    const res = await updateUserProfile(user.value.id, {
      name: form.name?.trim() || undefined,
      avatarUrl: form.avatarUrl?.trim() || undefined,
      country: form.country?.trim() || undefined,
      homeBase: form.homeBase?.trim() || undefined,
      travelStyle: form.travelStyle?.trim() || undefined,
      bio: form.bio?.trim() || undefined,
      profileVisibility: form.profileVisibility || 'public',
    })
    user.value = res.data.data
    applyForm(res.data.data)
    ElMessage.success('资料已更新')
  } catch {
    ElMessage.error('资料更新失败')
  } finally {
    saving.value = false
  }
}

async function handleBan() {
  if (!user.value) return
  try {
    await banUser(user.value.id)
    ElMessage.success(`已封禁用户 ${user.value.name}`)
    fetchUser()
  } catch {
    ElMessage.error('封禁失败')
  }
}

async function handleUnban() {
  if (!user.value) return
  try {
    await unbanUser(user.value.id)
    ElMessage.success(`已解封用户 ${user.value.name}`)
    fetchUser()
  } catch {
    ElMessage.error('解封失败')
  }
}

function goBack() {
  router.push('/admin/users')
}

function formatDateTime(dateStr: string) {
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
    <div class="page-nav">
      <el-button :icon="ArrowLeft" link @click="goBack">返回用户列表</el-button>
    </div>

    <template v-if="user">
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>用户概览</span>
            <div class="header-actions">
              <el-button v-if="user.status === 'active'" type="danger" size="small" @click="handleBan">
                封禁用户
              </el-button>
              <el-button v-else type="success" size="small" @click="handleUnban">
                解封用户
              </el-button>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="6" class="avatar-col">
            <el-avatar :src="user.avatar" :size="100">
              {{ (user.name || user.email).slice(0, 1).toUpperCase() }}
            </el-avatar>
            <h3 class="user-title-name">{{ user.name }}</h3>
            <div class="user-tags">
              <el-tag :type="UserStatusColorMap[user.status] as any" size="small">
                {{ UserStatusMap[user.status] }}
              </el-tag>
              <el-tag size="small" type="info">
                {{ user.role || 'editor' }}
              </el-tag>
            </div>
          </el-col>
          <el-col :xs="24" :sm="18">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户 ID">{{ user.id }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
              <el-descriptions-item label="语言偏好">
                <el-tag size="small" type="info">{{ LocaleMap[user.locale] || user.locale }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">{{ formatDateTime(user.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="登录来源">{{ user.provider || 'password' }}</el-descriptions-item>
              <el-descriptions-item label="成员起始">{{ user.memberSince || '-' }}</el-descriptions-item>
              <el-descriptions-item label="公开范围">
                {{ VisibilityMap[user.profileVisibility || 'public'] }}
              </el-descriptions-item>
              <el-descriptions-item label="主页地域">
                {{ user.country || user.homeBase || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
      </el-card>

      <el-row :gutter="16">
        <el-col :xs="24" :lg="14">
          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="card-header">
                <span>Personal Vault 档案管理</span>
                <el-button type="primary" size="small" :loading="saving" @click="saveProfile">
                  保存资料
                </el-button>
              </div>
            </template>

            <el-form label-position="top" class="profile-form">
              <el-row :gutter="16">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="显示名称">
                    <el-input v-model="form.name" placeholder="输入显示名称" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="头像 URL">
                    <el-input v-model="form.avatarUrl" placeholder="https://..." />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="国家 / 地区">
                    <el-input v-model="form.country" placeholder="例如：中国 / Singapore" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="Home Base">
                    <el-input v-model="form.homeBase" placeholder="例如：广州 / 上海" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="Travel Style">
                <el-input v-model="form.travelStyle" placeholder="例如：Coastal routes and food walks" />
              </el-form-item>

              <el-form-item label="Bio">
                <el-input
                  v-model="form.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="用户在 Personal Vault 中看到的个人说明"
                />
              </el-form-item>

              <el-form-item label="档案可见性">
                <el-segmented v-model="form.profileVisibility" :options="visibilityOptions" block />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="10">
          <el-card shadow="never" class="section-card">
            <template #header>
              <span>社区贡献摘要</span>
            </template>

            <div class="stats-grid">
              <el-statistic title="Dispatch 总数" :value="user.dispatchCount || 0" />
              <el-statistic title="带图 Dispatch" :value="user.photoDispatchCount || 0" />
              <el-statistic title="口译预约" :value="user.bookingsCount" />
              <el-statistic title="商城订单" :value="user.ordersCount" />
            </div>

            <div class="latest-dispatch">
              <div class="latest-label">最近一条 Dispatch</div>
              <div class="latest-title">{{ user.latestDispatchTitle || '暂无社区内容' }}</div>
              <div class="latest-meta">{{ latestDispatchLabel }}</div>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card">
            <template #header>
              <span>收藏记录</span>
            </template>
            <el-empty v-if="user.favorites.length === 0" description="暂无收藏" :image-size="80" />
            <div v-else class="favorites-grid">
              <el-tag v-for="(slug, idx) in user.favorites" :key="idx" size="large" class="favorite-tag">
                {{ slug }}
              </el-tag>
            </div>
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

.info-card,
.section-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
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

.user-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.profile-form {
  padding-top: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.latest-dispatch {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  background: #f7f8fa;
}

.latest-label {
  font-size: 12px;
  color: #909399;
}

.latest-title {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.latest-meta {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.favorites-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.favorite-tag {
  cursor: default;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
