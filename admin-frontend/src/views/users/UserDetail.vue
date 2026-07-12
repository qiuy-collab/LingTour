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
import { formatDateTime } from '@/utils/format'
import { extractErrorMessage } from '@/utils/i18n'

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
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, 'Failed to load user details'))
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  if (!user.value) return
  if (!form.name?.trim()) {
    ElMessage.warning('Enter a display name')
    return
  }
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
    ElMessage.success('Profile updated')
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, 'Failed to update profile'))
  } finally {
    saving.value = false
  }
}

async function handleBan() {
  if (!user.value) return
  try {
    await banUser(user.value.id)
    ElMessage.success(`Banned ${user.value.name}`)
    fetchUser()
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, 'Failed to ban user'))
  }
}

async function handleUnban() {
  if (!user.value) return
  try {
    await unbanUser(user.value.id)
    ElMessage.success(`Unbanned ${user.value.name}`)
    fetchUser()
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, 'Failed to unban user'))
  }
}

function goBack() {
  router.push('/admin/users')
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div class="user-detail-page" v-loading="loading">
    <div class="page-nav">
      <el-button :icon="ArrowLeft" link @click="goBack">Back to users</el-button>
    </div>

    <template v-if="user">
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>User overview</span>
            <div class="header-actions">
              <el-button v-if="user.status === 'active'" type="danger" size="small" @click="handleBan">
                Ban user
              </el-button>
              <el-button v-else type="success" size="small" @click="handleUnban">
                Unban user
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
              <el-descriptions-item label="User ID">{{ user.id }}</el-descriptions-item>
              <el-descriptions-item label="Email">{{ user.email }}</el-descriptions-item>
              <el-descriptions-item label="Locale">
                <el-tag size="small" type="info">{{ LocaleMap[user.locale] || user.locale }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Joined">{{ formatDateTime(user.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="Sign-in provider">{{ user.provider || 'password' }}</el-descriptions-item>
              <el-descriptions-item label="Member since">{{ user.memberSince || '-' }}</el-descriptions-item>
              <el-descriptions-item label="Visibility">
                {{ VisibilityMap[user.profileVisibility || 'public'] }}
              </el-descriptions-item>
              <el-descriptions-item label="Home base">
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
                <span>Personal Vault profile</span>
                <el-button type="primary" size="small" :loading="saving" @click="saveProfile">
                  Save profile
                </el-button>
              </div>
            </template>

            <el-form label-position="top" class="profile-form">
              <el-row :gutter="16">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="Display name">
                    <el-input v-model="form.name" placeholder="Enter a display name" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="Avatar URL">
                    <el-input v-model="form.avatarUrl" placeholder="https://..." />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="Country / region">
                    <el-input v-model="form.country" placeholder="For example: China or Singapore" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="Home Base">
                    <el-input v-model="form.homeBase" placeholder="For example: Guangzhou or Shanghai" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="Travel Style">
                <el-input v-model="form.travelStyle" placeholder="For example: coastal routes and food walks" />
              </el-form-item>

              <el-form-item label="Bio">
                <el-input
                  v-model="form.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="Profile note shown in Personal Vault"
                />
              </el-form-item>

              <el-form-item label="Profile visibility">
                <el-segmented v-model="form.profileVisibility" :options="visibilityOptions" block />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="10">
          <el-card shadow="never" class="section-card">
            <template #header>
              <span>Community contribution</span>
            </template>

            <div class="stats-grid">
              <el-statistic title="Dispatches" :value="user.dispatchCount || 0" />
              <el-statistic title="Photo dispatches" :value="user.photoDispatchCount || 0" />
              <el-statistic title="Bookings" :value="user.bookingsCount" />
              <el-statistic title="Shop orders" :value="user.ordersCount" />
            </div>

            <div class="latest-dispatch">
              <div class="latest-label">Latest dispatch</div>
              <div class="latest-title">{{ user.latestDispatchTitle || 'No community posts yet' }}</div>
              <div class="latest-meta">{{ latestDispatchLabel }}</div>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card">
            <template #header>
              <span>Saved items</span>
            </template>
            <el-empty v-if="user.favorites.length === 0" description="No saved items" :image-size="80" />
            <div v-else class="favorites-grid">
              <el-tag v-for="(slug, idx) in user.favorites" :key="idx" size="large" class="favorite-tag">
                {{ slug }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <el-empty v-else-if="!loading" description="User not found" :image-size="120" />
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
