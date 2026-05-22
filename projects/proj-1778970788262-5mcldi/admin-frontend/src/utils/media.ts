const configuredMediaOrigin =
  (import.meta.env.VITE_MEDIA_ORIGIN as string | undefined) ||
  (import.meta.env.VITE_API_ORIGIN as string | undefined) ||
  'http://localhost:8000'

const backendPathPrefixes = ['/uploads/', '/static/', '/media/', '/files/']

export function resolveMediaUrl(value: unknown): string {
  if (typeof value !== 'string') return ''

  const url = value.trim()
  if (!url) return ''

  if (/^https?:\/\//i.test(url) || /^data:/i.test(url) || /^blob:/i.test(url)) {
    return url
  }

  if (url.startsWith('//')) {
    return `${window.location.protocol}${url}`
  }

  if (backendPathPrefixes.some((prefix) => url.startsWith(prefix))) {
    return new URL(url, configuredMediaOrigin).toString()
  }

  return new URL(url, window.location.origin).toString()
}
