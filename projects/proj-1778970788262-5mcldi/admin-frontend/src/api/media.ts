// 媒体库 API
import api from './index'

export interface MediaFile {
  filename: string
  url: string
  size: number
  createdAt: string
  modifiedAt: string
}

export interface MediaListResponse {
  items: MediaFile[]
  total: number
  page: number
  limit: number
}

/** 获取媒体文件列表 */
export function getMediaFiles(params: { page?: number; limit?: number; module?: string }) {
  return api.get('/upload/files', { params })
}

/** 删除媒体文件 */
export function deleteMediaFile(filename: string) {
  return api.delete(`/upload/files/${encodeURIComponent(filename)}`)
}

/** 上传文件 */
export function uploadMediaFile(file: File, module?: string) {
  const formData = new FormData()
  if (module) formData.append('module', module)
  formData.append('file', file)
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
