<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/store/notification'
import { formatDateTime } from '@/utils/format'
import { NOTIFICATION_TYPE_LABELS } from '@/types/notification'

const router = useRouter()
const notifStore = useNotificationStore()

onMounted(() => {
  notifStore.startPolling(30000)
  notifStore.fetchNotifications({ page: 1, pageSize: 5 })
})

onBeforeUnmount(() => {
  notifStore.stopPolling()
})

function handleClick(notif: any) {
  notifStore.markAsRead(notif.id)
  if (notif.link) {
    router.push(notif.link)
  } else if (notif.resourceType && notif.resourceId) {
    const routeMap: Record<string, string> = {
      order: '/admin/orders/',
      booking: '/admin/interpreting/bookings',
      community_post: '/admin/community/',
      user: '/admin/users/',
    }
    const base = routeMap[notif.resourceType]
    if (base) {
      router.push(base + (notif.resourceId || ''))
    }
  }
}

function handleViewAll() {
  router.push('/admin/system/notifications')
}

function handleMarkAllRead() {
  notifStore.markAllAsRead()
}
</script>

<template>
  <el-popover placement="bottom-end" :width="360" trigger="click">
    <template #reference>
      <el-badge :value="notifStore.unreadCount" :hidden="!notifStore.hasUnread" :max="99">
        <el-icon class="notification-bell" :size="20"><Bell /></el-icon>
      </el-badge>
    </template>

    <div class="notif-panel">
      <div class="notif-header">
        <span class="notif-title">通知</span>
        <el-button
          v-if="notifStore.hasUnread"
          type="primary"
          link
          size="small"
          @click="handleMarkAllRead"
        >
          全部已读
        </el-button>
      </div>

      <div class="notif-list" v-if="notifStore.notifications.length > 0">
        <div
          v-for="notif in notifStore.notifications"
          :key="notif.id"
          :class="['notif-item', { unread: !notif.read }]"
          @click="handleClick(notif)"
        >
          <div class="notif-item-header">
            <el-tag size="small" :type="notif.type === 'order' ? 'primary' : notif.type === 'booking' ? 'success' : notif.type === 'review' ? 'warning' : 'info'">
              {{ NOTIFICATION_TYPE_LABELS[notif.type] || notif.type }}
            </el-tag>
            <span class="notif-time">{{ formatDateTime(notif.createdAt) }}</span>
          </div>
          <p class="notif-body">{{ notif.title || notif.body }}</p>
        </div>
      </div>
      <div v-else class="notif-empty">暂无通知</div>

      <div class="notif-footer">
        <el-button type="primary" link @click="handleViewAll">查看全部</el-button>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.notification-bell {
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.notification-bell:hover {
  color: #409eff;
}

.notif-panel {
  margin: -12px;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.notif-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.notif-list {
  max-height: 320px;
  overflow-y: auto;
}

.notif-item {
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.15s;
}

.notif-item:hover {
  background: #f5f7fa;
}

.notif-item.unread {
  background: #f0f7ff;
}

.notif-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.notif-time {
  font-size: 11px;
  color: #c0c4cc;
}

.notif-body {
  font-size: 13px;
  color: #606266;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notif-empty {
  padding: 32px 16px;
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
}

.notif-footer {
  padding: 8px 16px;
  text-align: center;
  border-top: 1px solid #ebeef5;
}
</style>
