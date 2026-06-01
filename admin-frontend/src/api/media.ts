// 媒体库 API
import api from './index'

export interface MediaFile {
  filename: string
  url: string
  size: number
  createdAt: string
  modifiedAt?: string
  // Fields from media_files table (when using queryMedia)
  id?: string
  original_name?: string | null
  mime_type?: string | null
  size_bytes?: number | null
  module?: string | null
  uploaded_by?: string | null
  entity_type?: string | null
  entity_id?: string | null
}

export interface MediaListResponse {
  items: MediaFile[]
  total: number
  page: number
  limit: number
}

export interface MediaQueryParams {
  page?: number
  limit?: number
  module?: string
  entityType?: string
  entityId?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

/** 获取媒体文件列表 (disk scan, backward compatible) */
export function getMediaFiles(params: { page?: number; limit?: number; module?: string }) {
  return api.get('/upload/files', { params })
}

/** 查询媒体文件 (media_files table with filters) */
export function queryMediaFiles(params: MediaQueryParams) {
  return api.get('/upload/media', { params })
}

/** 获取孤立文件 (磁盘上但不在 media_files 表中) */
export function getOrphanFiles() {
  return api.get('/upload/media/orphans')
}

/** 删除媒体文件 */
export function deleteMediaFile(filename: string) {
  return api.delete(`/upload/files/${encodeURIComponent(filename)}`)
}

/** 上传文件（支持进度回调） */
export function uploadMediaFile(
  file: File,
  module?: string,
  entityType?: string,
  entityId?: string,
  onProgress?: (percent: number) => void,
) {
  const formData = new FormData()
  if (module) formData.append('module', module)
  if (entityType) formData.append('entityType', entityType)
  if (entityId) formData.append('entityId', entityId)
  formData.append('file', file)
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => {
          if (e.total) onProgress(Math.round((e.loaded * 100) / e.total))
        }
      : undefined,
  })
}
