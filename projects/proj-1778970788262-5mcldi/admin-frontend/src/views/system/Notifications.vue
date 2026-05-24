<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/store/notification'
import { NOTIFICATION_TYPE_LABELS } from '@/types/notification'
import { formatDateTime } from '@/utils/format'
import PageSkeleton from '@/components/PageSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import { Bell, Check, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { notificationApi } from '@/api/notifications'

const router = useRouter()
const notifStore = useNotificationStore()

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filterType = ref('')
const filterRead = ref('')
const isFirstLoad = ref(true)

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: pageSize.value }
    if (filterType.value) params.type = filterType.value
    if (filterRead.value !== '') params.read = filterRead.value === 'read'
    const res = await notifStore.fetchNotifications(params)
    list.value = notifStore.notifications
    total.value = res?.total ?? list.value.length
  } finally {
    loading.value = false
    isFirstLoad.value = false
  }
}

onMounted(() => {
  fetchList()
})

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchList()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchList()
}

function handleFilter() {
  page.value = 1
  fetchList()
}

function handleClick(notif: any) {
  notifStore.markAsRead(notif.id)
  if (notif.link) {
    router.push(notif.link)
  }
}

async function handleMarkAllRead() {
  await notifStore.markAllAsRead()
  ElMessage.success('已全部标记为已读')
  fetchList()
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定删除该通知？', '确认', { type: 'warning' })
    await notificationApi.delete(id)
    ElMessage.success('已删除')
    fetchList()
  } catch (err: any) {
    if (err === 'cancel') return
  }
}

function getTagType(type: string) {
  const map: Record<string, string> = {
    order: 'primary',
    booking: 'success',
    review: 'warning',
    system: 'info',
    audit: 'danger',
  }
  return (map[type] || 'info') as any
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2>通知中心</h2>
      <el-button type="primary" :icon="Check" @click="handleMarkAllRead" :disabled="!notifStore.hasUnread">
        全部已读
      </el-button>
    </div>

    <div class="search-bar">
      <el-select v-model="filterType" placeholder="通知类型" clearable style="width: 130px" @change="handleFilter">
        <el-option v-for="(label, key) in NOTIFICATION_TYPE_LABELS" :key="key" :label="label" :value="key" />
      </el-select>
      <el-select v-model="filterRead" placeholder="已读状态" clearable style="width: 120px" @change="handleFilter">
        <el-option label="未读" value="unread" />
        <el-option label="已读" value="read" />
      </el-select>
    </div>

    <PageSkeleton v-if="isFirstLoad && loading" type="list" :rows="6" />

    <div v-else-if="list.length > 0" class="notif-list">
      <div
        v-for="notif in list"
        :key="notif.id"
        :class="['notif-card', { unread: !notif.read }]"
      >
        <div class="notif-card-left" @click="handleClick(notif)">
          <el-icon class="notif-icon" :size="20"><Bell /></el-icon>
          <div class="notif-content">
            <div class="notif-meta">
              <el-tag :type="getTagType(notif.type)" size="small">
                {{ NOTIFICATION_TYPE_LABELS[notif.type] || notif.type }}
              </el-tag>
              <span class="notif-time">{{ formatDateTime(notif.createdAt) }}</span>
            </div>
            <p class="notif-title">{{ notif.title }}</p>
            <p v-if="notif.body && notif.body !== notif.title" class="notif-body">{{ notif.body }}</p>
          </div>
        </div>
        <div class="notif-actions">
          <el-button
            v-if="!notif.read"
            type="primary"
            link
            size="small"
            @click="notifStore.markAsRead(notif.id)"
          >
            标记已读
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            :icon="Delete"
            @click="handleDelete(notif.id)"
          />
        </div>
      </div>
    </div>

    <EmptyState
      v-else-if="!loading"
      title="暂无通知"
      description="新的订单、预约和审核通知将在此显示"
      :icon="Bell"
    />

    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 4px 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: var(--admin-font-page-title, 20px); }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notif-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.2s;
}

.notif-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.notif-card.unread {
  border-left: 3px solid #409eff;
  background: #f9fbff;
}

.notif-card-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.notif-icon {
  color: #909399;
  margin-top: 2px;
  flex-shrink: 0;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notif-time {
  font-size: 12px;
  color: #c0c4cc;
}

.notif-title {
  font-size: 14px;
  color: #303133;
  margin: 0;
  line-height: 1.4;
}

.notif-body {
  font-size: 13px;
  color: #909399;
  margin: 4px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notif-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
</style>
