import type { I18nObject } from './common'

export type MediaType = 'image' | 'video'

export interface MediaAsset {
  type: MediaType
  url: string
  poster?: string
  alt?: I18nObject
}

export function isMediaAsset(value: unknown): value is MediaAsset {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<MediaAsset>
  return (
    (candidate.type === 'image' || candidate.type === 'video') &&
    typeof candidate.url === 'string' &&
    Boolean(candidate.url.trim())
  )
}

export function resolvePrimaryMedia(value: unknown, legacyImage = ''): MediaAsset | null {
  if (isMediaAsset(value)) return { ...value }
  if (value && typeof value === 'object') {
    const candidate = value as Partial<MediaAsset>
    if (
      (candidate.type === 'image' || candidate.type === 'video') &&
      typeof candidate.url === 'string'
    ) {
      return { ...candidate } as MediaAsset
    }
  }
  return legacyImage.trim() ? { type: 'image', url: legacyImage } : null
}

export function resolveMediaGallery(value: unknown, legacyImages: string[] = []): MediaAsset[] {
  const authored = Array.isArray(value)
    ? value.filter(isMediaAsset).map((item) => ({ ...item }))
    : []
  if (authored.length) return authored
  return legacyImages
    .filter((url) => typeof url === 'string' && Boolean(url.trim()))
    .map((url) => ({ type: 'image', url }))
}

export function legacyImageForMedia(asset: MediaAsset | null | undefined, fallback = '') {
  if (!asset) return fallback
  if (asset.type === 'image') return asset.url || fallback
  return asset.poster || fallback
}

export function isIncompleteVideoMedia(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<MediaAsset>
  return candidate.type === 'video' && (!candidate.url?.trim() || !candidate.poster?.trim())
}
