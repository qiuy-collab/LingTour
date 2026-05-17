// ============================================
// 社区帖子管理 API
// ============================================
import api from './index'
import type { ApiResponse, PaginatedResponse, PageParams } from '@/types/common'
import type { CommunityPost, PostStatus } from '@/types/community'

export const communityApi = {
  getPosts(params: PageParams & { channel?: string; status?: string }) {
    return api.get<ApiResponse<PaginatedResponse<CommunityPost>>>('/community/posts', { params })
  },

  getPost(id: string) {
    return api.get<ApiResponse<CommunityPost>>(`/community/posts/${id}`)
  },

  reviewPost(id: string, status: PostStatus) {
    return api.patch<ApiResponse<CommunityPost>>(`/community/posts/${id}/review`, { status })
  },

  toggleFeatured(id: string, featured: boolean) {
    return api.patch<ApiResponse<CommunityPost>>(`/community/posts/${id}/featured`, { featured })
  },

  deletePost(id: string) {
    return api.delete<ApiResponse<null>>(`/community/posts/${id}`)
  },
}
