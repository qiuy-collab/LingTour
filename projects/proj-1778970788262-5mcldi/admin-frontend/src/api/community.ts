import api from './index'
import type { ApiResponse, PaginatedResponse, PageParams } from '@/types/common'
import { pickI18n } from '@/types/common'
import type { CommunityPost, PostStatus } from '@/types/community'

function normalizePost(raw: any): CommunityPost {
  const user = raw.user || {}
  return {
    id: raw.id,
    userName: user.name || raw.userName || 'LingTour User',
    userHandle: user.handle || raw.userHandle || 'guest',
    userAvatar: user.avatar || raw.userAvatar || '',
    image: raw.image || '',
    title: pickI18n(raw.title),
    excerpt: pickI18n(raw.excerpt),
    content: pickI18n(raw.content ?? raw.excerpt),
    location: raw.location || '',
    route: raw.route || '',
    date: (raw.createdAt && typeof raw.createdAt === 'string') ? new Date(raw.createdAt).toLocaleDateString('zh-CN') : '',
    channel: raw.channel,
    mood: raw.mood || '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    saves: raw.saves ?? 0,
    status: raw.status,
    featured: raw.featured ?? false,
    reviewedBy: raw.reviewedBy ?? null,
    reviewedAt: raw.reviewedAt ?? null,
    rejectionReason: raw.rejectionReason ?? null,
    deletedAt: raw.deletedAt ?? null,
  }
}

function normalizeListResponse(res: any) {
  res.data.data.data = (res.data.data.data || []).map(normalizePost)
  return res
}

function normalizeDetailResponse(res: any) {
  res.data.data = normalizePost(res.data.data)
  return res
}

export const communityApi = {
  async getPosts(params: PageParams & { channel?: string; status?: string }) {
    const res = await api.get<ApiResponse<PaginatedResponse<CommunityPost>>>('/community/posts', {
      params: { ...params, limit: params.pageSize },
    })
    return normalizeListResponse(res)
  },

  async getPost(id: string) {
    const res = await api.get<ApiResponse<CommunityPost>>(`/community/posts/${id}`)
    return normalizeDetailResponse(res)
  },

  /** 审核帖子状态（通过/隐藏），可附带拒绝原因 */
  reviewPost(id: string, status: PostStatus, rejectionReason?: string) {
    return api.patch<ApiResponse<CommunityPost>>(`/community/posts/${id}/review`, {
      status,
      reason: rejectionReason,
    })
  },

  /** 切换精选状态 */
  toggleFeatured(id: string, featured: boolean) {
    return api.patch<ApiResponse<CommunityPost>>(`/community/posts/${id}/featured`, { featured })
  },

  /** 软删除帖子 */
  deletePost(id: string) {
    return api.delete<ApiResponse<null>>(`/community/posts/${id}`)
  },

  /** 恢复软删除的帖子 */
  restorePost(id: string) {
    return api.post<ApiResponse<CommunityPost>>(`/community/posts/${id}/restore`)
  },
}
