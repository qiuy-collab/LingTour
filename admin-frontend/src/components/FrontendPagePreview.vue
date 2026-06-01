<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { pickI18n } from '@/types/common'
import { resolveMediaUrl } from '@/utils/media'
import { useEditorLocale } from '@/composables/useEditorLocale'

type PreviewType = 'city' | 'route' | 'product'

const props = defineProps<{
  type: PreviewType
  model: Record<string, any>
  meta?: Record<string, any>
}>()

const { editorLocale } = useEditorLocale()
const iframeRef = ref<HTMLIFrameElement | null>(null)
const frameShellRef = ref<HTMLDivElement | null>(null)

function getDefaultPreviewOrigin() {
  if (typeof window === 'undefined') return 'http://127.0.0.1:3000'

  const current = new URL(window.location.origin)
  if (current.hostname.startsWith('admin.')) {
    return `${current.protocol}//${current.hostname.replace(/^admin\./, '')}${current.port ? `:${current.port}` : ''}`
  }

  return current.origin
}

const previewOrigin =
  (import.meta.env.VITE_SITE_PREVIEW_ORIGIN as string | undefined) || getDefaultPreviewOrigin()
const previewSource = window.location.origin
const previewSessionId =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const previewKey = computed(() => `admin-preview:${props.type}:${previewSessionId}`)
const iframeLoaded = ref(false)
const iframeLoading = ref(true)
const iframeFailed = ref(false)
const frameReloadKey = ref(0)

let postTimer: ReturnType<typeof setTimeout> | null = null
let loadTimeout: ReturnType<typeof setTimeout> | null = null
let resizeObserver: ResizeObserver | null = null
let burstTimers: Array<ReturnType<typeof setTimeout>> = []

const shellWidth = ref(0)
const desktopWidth = 1440
const desktopHeightMap: Record<PreviewType, number> = {
  city: 2200,
  route: 1800,
  product: 1700,
}
const desktopHeight = computed(() => desktopHeightMap[props.type])

function text(value: unknown, fallback = '') {
  return pickI18n(value, editorLocale.value) || fallback
}

function list(values: unknown) {
  return Array.isArray(values) ? values.filter(Boolean) : []
}

function buildCityPreview() {
  const sections = list(props.model.sections).map((section: any, index: number) => {
    const statParts = [text(section?.statLabel), text(section?.statValue)].filter(Boolean)
    return {
      title: text(section?.title, `Section ${index + 1}`),
      body: text(section?.body),
      image: resolveMediaUrl(section?.image),
      stat: statParts.join(' / '),
      breathImage: resolveMediaUrl(section?.breathImage),
      breathQuote: text(section?.breathQuote),
    }
  })

  return {
    slug: props.model.slug || 'preview-city',
    name: text(props.model.name, 'Preview City'),
    adcode: Number(props.model.adcode || 0),
    label: text(props.model.regionLabel, 'Preview Label'),
    summary: text(props.model.editorIntro),
    narrative: text(props.model.heroNarrative),
    image: resolveMediaUrl(props.model.heroImage),
    gallery: list(props.model.galleryImages).map((item) => resolveMediaUrl(item)),
    tags: list(props.model.tags).map((item) => text(item)).filter(Boolean),
    food: text(props.model.foodTitle),
    foodDescription: text(props.model.foodDescription),
    routeSlugs: list(props.model.routeSlugs),
    relatedCitySlugs: list(props.model.relatedCitySlugs),
    foodImages: list(props.model.foodImages).map((item) => resolveMediaUrl(item)),
    sections,
  }
}

function normalizeCulture(value: string) {
  if (value === 'BayArea' || value === 'Guangfu') return 'Bay Area'
  return value || 'Guangfu'
}

function buildRoutePreview() {
  return {
    slug: props.model.slug || 'preview-route',
    title: text(props.model.title, 'Preview Route'),
    culture: normalizeCulture(props.model.cultureTag),
    city: text(props.model.cityName, 'Preview City'),
    citySlugs: list(props.model.citySlugs),
    duration: text(props.model.duration),
    audience: text(props.model.audience),
    summary: text(props.model.summary),
    story: text(props.model.story),
    image: resolveMediaUrl(props.model.coverImage),
    mapViewBox: '0 0 900 600',
    itinerary: list(props.model.stops).map((stop: any) => ({
      time: stop?.time || '',
      stop: text(stop?.stopName, 'Preview Stop'),
      plan: '',
      story: text(stop?.story),
      details: list(stop?.details).map((detail) => text(detail)).filter(Boolean),
      culturalStory: text(stop?.culturalStory),
      lat: Number(stop?.lat || 0),
      lng: Number(stop?.lng || 0),
      placeDetail: undefined,
      meal: text(stop?.meal) || undefined,
      hotel: text(stop?.hotel) || undefined,
      transit: text(stop?.transit) || undefined,
      image: resolveMediaUrl(stop?.image) || undefined,
    })),
  }
}

function buildProductPreview() {
  return {
    slug: props.model.slug || 'preview-product',
    name: text(props.model.name, 'Preview Product'),
    collection: props.meta?.collectionTitle || 'LingTour Goods',
    price: Number(props.model.price || 0),
    currency: props.model.currency || 'SGD',
    tag: text(props.model.tag),
    image: resolveMediaUrl(props.model.image),
    materialNotes: text(props.model.material) || undefined,
    story: text(props.model.story),
    gallery: list(props.model.gallery).map((item) => resolveMediaUrl(item)),
  }
}

const previewPayload = computed(() => {
  if (props.type === 'city') return buildCityPreview()
  if (props.type === 'route') return buildRoutePreview()
  return buildProductPreview()
})

const iframePath = computed(() => {
  const slug = String(previewPayload.value.slug || '').trim()
  if (props.type === 'city') return `/culture/${slug || 'preview-city'}`
  if (props.type === 'route') return `/routes/${slug || 'preview-route'}`
  return `/shop/products/${slug || 'preview-product'}`
})

const iframeSrc = computed(
  () =>
    `${previewOrigin}${iframePath.value}?preview=1&previewKey=${encodeURIComponent(previewKey.value)}&previewSource=${encodeURIComponent(previewSource)}`,
)

const iframeSrcWithReload = computed(() => `${iframeSrc.value}&reloadKey=${frameReloadKey.value}`)

const previewScale = computed(() => {
  if (!shellWidth.value) return 1
  return Math.min(shellWidth.value / desktopWidth, 1)
})

const scaledFrameHeight = computed(() => Math.round(desktopHeight.value * previewScale.value))

function postPreview() {
  if (!iframeLoaded.value) return

  const frame = iframeRef.value?.contentWindow
  if (!frame) return

  frame.postMessage(
    {
      channel: 'lingtour-preview',
      key: previewKey.value,
      type: props.type,
      locale: editorLocale.value,
      source: previewSource,
      data: previewPayload.value,
      timestamp: Date.now(),
    },
    previewOrigin,
  )
}

function postPreviewBurst() {
  burstTimers.forEach((timer) => clearTimeout(timer))
  burstTimers = []

  const delays = [0, 200, 600, 1200, 2400]
  delays.forEach((delay) => {
    const timer = setTimeout(() => {
      postPreview()
    }, delay)
    burstTimers.push(timer)
  })
}

function schedulePostPreview() {
  if (postTimer) clearTimeout(postTimer)
  postTimer = setTimeout(() => {
    postPreviewBurst()
  }, 180)
}

function startLoadTimeout() {
  if (loadTimeout) clearTimeout(loadTimeout)
  loadTimeout = setTimeout(() => {
    if (!iframeLoaded.value) {
      iframeLoading.value = false
      iframeFailed.value = true
    }
  }, 6000)
}

function handleFrameLoad() {
  iframeLoaded.value = true
  iframeLoading.value = false
  iframeFailed.value = false
  if (loadTimeout) clearTimeout(loadTimeout)
  postPreviewBurst()
}

function reloadFrame() {
  iframeLoaded.value = false
  iframeLoading.value = true
  iframeFailed.value = false
  frameReloadKey.value += 1
  startLoadTimeout()
}

watch(previewPayload, schedulePostPreview, { deep: true })
watch(editorLocale, schedulePostPreview)
watch(iframeSrc, () => {
  iframeLoaded.value = false
  iframeLoading.value = true
  iframeFailed.value = false
  startLoadTimeout()
})

onMounted(() => {
  if (!frameShellRef.value || typeof ResizeObserver === 'undefined') return

  shellWidth.value = frameShellRef.value.clientWidth
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    shellWidth.value = entry?.contentRect.width || frameShellRef.value?.clientWidth || 0
  })
  resizeObserver.observe(frameShellRef.value)
  startLoadTimeout()
})

onBeforeUnmount(() => {
  if (postTimer) clearTimeout(postTimer)
  if (loadTimeout) clearTimeout(loadTimeout)
  burstTimers.forEach((timer) => clearTimeout(timer))
  resizeObserver?.disconnect()
})
</script>

<template>
  <aside class="frontend-preview">
    <div class="preview-toolbar">
      <div>
        <strong>真实前台预览</strong>
        <p>{{ iframePath }}</p>
      </div>
      <div class="toolbar-actions">
        <span class="toolbar-locale-hint">跟随顶部编辑语言</span>
        <a :href="iframeSrcWithReload" target="_blank" rel="noreferrer">打开新窗口</a>
      </div>
    </div>

    <div ref="frameShellRef" class="preview-frame-shell" :style="{ height: `${scaledFrameHeight}px` }">
      <div v-if="iframeLoading" class="preview-state">
        <el-skeleton :rows="6" animated />
        <p>前台预览加载中...</p>
      </div>

      <div v-else-if="iframeFailed" class="preview-state preview-state-error">
        <strong>前台预览加载失败</strong>
        <p>当前预览地址是 {{ previewOrigin }}，请确认前台站点已经启动。</p>
        <div class="preview-state-actions">
          <el-button size="small" type="primary" @click="reloadFrame">重试</el-button>
          <a :href="iframeSrcWithReload" target="_blank" rel="noreferrer">新窗口打开</a>
        </div>
      </div>

      <iframe
        :key="frameReloadKey"
        ref="iframeRef"
        :src="iframeSrcWithReload"
        class="preview-frame"
        title="Frontend page preview"
        :style="{
          width: `${desktopWidth}px`,
          height: `${desktopHeight}px`,
          transform: `scale(${previewScale})`,
        }"
        @load="handleFrameLoad"
      />
    </div>
  </aside>
</template>

<style scoped>
.frontend-preview {
  position: sticky;
  top: 20px;
  align-self: start;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.preview-toolbar strong {
  display: block;
  font-size: 14px;
  color: #303133;
}

.preview-toolbar p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
  word-break: break-all;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-locale-hint {
  font-size: 12px;
  color: #909399;
}

.toolbar-actions a {
  color: #409eff;
  font-size: 12px;
  text-decoration: none;
}

.preview-frame-shell {
  position: relative;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(17, 25, 35, 0.08);
  width: 100%;
}

.preview-state {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.96);
}

.preview-state p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}

.preview-state-error strong {
  color: #303133;
  font-size: 16px;
}

.preview-state-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-state-actions a {
  color: #409eff;
  font-size: 13px;
  text-decoration: none;
}

.preview-frame {
  display: block;
  border: 0;
  background: #fff;
  transform-origin: top left;
}

@media (max-width: 1100px) {
  .frontend-preview {
    position: static;
  }
}

@media (max-width: 767px) {
  /* Preview panel hidden on mobile, accessible via drawer */
  .frontend-preview {
    display: none;
  }
}
</style>
