function getDefaultSiteOrigin() {
  if (typeof window === 'undefined') return 'http://127.0.0.1:3000'

  const current = new URL(window.location.origin)
  if (current.hostname.startsWith('admin.')) {
    return `${current.protocol}//${current.hostname.replace(/^admin\./, '')}${current.port ? `:${current.port}` : ''}`
  }

  return current.origin
}

const configuredMediaOrigin =
  (import.meta.env.VITE_MEDIA_ORIGIN as string | undefined) ||
  (import.meta.env.VITE_API_ORIGIN as string | undefined) ||
  'http://localhost:8000'

const configuredSiteOrigin =
  (import.meta.env.VITE_SITE_ORIGIN as string | undefined) ||
  (import.meta.env.VITE_SITE_PREVIEW_ORIGIN as string | undefined) ||
  getDefaultSiteOrigin()

const backendPathPrefixes = ['/uploads/', '/static/', '/media/', '/files/']
const sitePathPrefixes = ['/editorial/']

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

  if (sitePathPrefixes.some((prefix) => url.startsWith(prefix))) {
    return new URL(url, configuredSiteOrigin).toString()
  }

  return new URL(url, window.location.origin).toString()
}
