import api from './index'
import type { ApiResponse, PaginatedResponse } from '@/types/common'
import type { CommunityBrief, CommunityBriefPayload } from '@/types/community-brief'

export function getCommunityBriefs() {
  return api.get<ApiResponse<PaginatedResponse<CommunityBrief>>>('/community/briefs', {
    params: { rawI18n: true },
  })
}

export function createCommunityBrief(payload: CommunityBriefPayload) {
  return api.post<ApiResponse<CommunityBrief>>('/community/briefs', payload)
}

export function updateCommunityBrief(id: string, payload: CommunityBriefPayload) {
  return api.put<ApiResponse<CommunityBrief>>(`/community/briefs/${id}`, payload)
}

export function deleteCommunityBrief(id: string) {
  return api.delete<ApiResponse<null>>(`/community/briefs/${id}`)
}
