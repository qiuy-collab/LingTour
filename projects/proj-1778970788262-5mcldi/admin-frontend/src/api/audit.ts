import request from './index'
import type { AuditLogFilter, AuditStats } from '@/types/audit'

function emptyListResponse(page = 1, pageSize = 20) {
  return {
    data: {
      code: 200,
      data: {
        items: [],
        total: 0,
        page,
        pageSize,
        unavailable: true,
      },
      message: 'audit logs unavailable',
    },
  }
}

function emptyStatsResponse(): { data: { code: number; data: AuditStats & { unavailable: boolean }; message: string } } {
  return {
    data: {
      code: 200,
      data: {
        total: 0,
        last7Days: 0,
        actionBreakdown: [],
        resourceBreakdown: [],
        unavailable: true,
      },
      message: 'audit stats unavailable',
    },
  }
}

export const auditApi = {
  async getList(params: AuditLogFilter) {
    try {
      return await request.get('/audit-logs', { params })
    } catch (error: any) {
      if ([404, 405, 501].includes(error?.response?.status)) {
        return emptyListResponse(params.page, params.pageSize)
      }
      throw error
    }
  },

  async getDetail(id: string) {
    try {
      return await request.get(`/audit-logs/${id}`)
    } catch (error: any) {
      if ([404, 405, 501].includes(error?.response?.status)) {
        return {
          data: {
            code: 200,
            data: null,
            message: 'audit detail unavailable',
          },
        }
      }
      throw error
    }
  },

  async getStats() {
    try {
      return await request.get('/audit-logs/stats')
    } catch (error: any) {
      if ([404, 405, 501].includes(error?.response?.status)) {
        return emptyStatsResponse()
      }
      throw error
    }
  },
}
