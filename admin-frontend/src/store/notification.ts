import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { notificationApi } from '@/api/notifications'
import type { Notification, NotificationFilter } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const lastError = ref('')
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const hasUnread = computed(() => unreadCount.value > 0)

  async function fetchUnreadCount() {
    try {
      lastError.value = ''
      const response = await notificationApi.getUnreadCount()
      const data = response.data?.data ?? response.data
      unreadCount.value = data?.count ?? data ?? 0
      return unreadCount.value
    } catch {
      lastError.value = '通知接口暂时不可用'
      return unreadCount.value
    }
  }

  async function fetchNotifications(params: NotificationFilter = { page: 1, pageSize: 20 }) {
    loading.value = true
    try {
      lastError.value = ''
      const response = await notificationApi.getList(params)
      const data = response.data?.data ?? response.data
      notifications.value = data?.data ?? data ?? []
      return data
    } catch {
      notifications.value = []
      lastError.value = '通知接口暂时不可用'
      return undefined
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: string) {
    try {
      await notificationApi.markAsRead(id)
      const item = notifications.value.find((notification) => notification.id === id)
      if (item && !item.read) {
        item.read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      return true
    } catch {
      lastError.value = '通知状态更新失败'
      return false
    }
  }

  async function markAllAsRead() {
    try {
      await notificationApi.markAllAsRead()
      notifications.value.forEach((notification) => (notification.read = true))
      unreadCount.value = 0
      return true
    } catch {
      lastError.value = '通知状态更新失败'
      return false
    }
  }

  function startPolling(intervalMs = 30000) {
    stopPolling()
    fetchUnreadCount()
    pollTimer = setInterval(fetchUnreadCount, intervalMs)
  }

  function stopPolling() {
    if (!pollTimer) return
    clearInterval(pollTimer)
    pollTimer = null
  }

  return {
    notifications,
    unreadCount,
    hasUnread,
    loading,
    lastError,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
  }
})
