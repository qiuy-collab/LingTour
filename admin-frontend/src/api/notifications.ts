import request from './index'
import type { NotificationFilter } from '@/types/notification'

export const notificationApi = {
  /** Get paginated notifications */
  getList(params: NotificationFilter) {
    return request.get('/notifications', { params })
  },

  /** Get unread count */
  getUnreadCount() {
    return request.get('/notifications/unread-count')
  },

  /** Mark a single notification as read */
  markAsRead(id: string) {
    return request.patch(`/notifications/${id}/read`)
  },

  /** Mark all notifications as read */
  markAllAsRead() {
    return request.patch('/notifications/read-all')
  },

  /** Delete a notification */
  delete(id: string) {
    return request.delete(`/notifications/${id}`)
  },
}
