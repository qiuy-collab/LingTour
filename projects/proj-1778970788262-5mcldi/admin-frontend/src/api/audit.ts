import request from './index'
import type { AuditLogFilter } from '@/types/audit'

export const auditApi = {
  /** Get paginated audit logs */
  getList(params: AuditLogFilter) {
    return request.get('/audit-logs', { params })
  },

  /** Get single audit log detail */
  getDetail(id: string) {
    return request.get(`/audit-logs/${id}`)
  },

  /** Get audit log statistics */
  getStats() {
    return request.get('/audit-logs/stats')
  },
}
