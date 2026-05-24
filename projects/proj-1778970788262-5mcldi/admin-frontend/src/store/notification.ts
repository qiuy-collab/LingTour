import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi } from '@/api/notifications'
import type { Notification } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const hasUnread = computed(() => unreadCount.value > 0)

  async function fetchUnreadCount() {
    try {
      const res = await notificationApi.getUnreadCount()
      const data = res.data?.data ?? res.data
      unreadCount.value = data?.count ?? data ?? 0
    } catch {
      // Silently fail — don't disrupt user workflow
    }
  }

  async function fetchNotifications(params?: { page?: number; pageSize?: number }) {
    loading.value = true
    try {
      const res = await notificationApi.getList(params || { page: 1, pageSize: 20 })
      const data = res.data?.data ?? res.data
      notifications.value = data?.items ?? data ?? []
      return data
    } catch {
      notifications.value = []
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: string) {
    try {
      await notificationApi.markAsRead(id)
      const item = notifications.value.find((n) => n.id === id)
      if (item && !item.read) {
        item.read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch {
      // ignore
    }
  }

  async function markAllAsRead() {
    try {
      await notificationApi.markAllAsRead()
      notifications.value.forEach((n) => (n.read = true))
      unreadCount.value = 0
    } catch {
      // ignore
    }
  }

  function startPolling(intervalMs = 30000) {
    stopPolling()
    fetchUnreadCount()
    pollTimer = setInterval(fetchUnreadCount, intervalMs)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    notifications,
    unreadCount,
    hasUnread,
    loading,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
  }
})
