<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { pickI18n } from '@/types/common'

type PreviewType = 'city' | 'route' | 'product'
type PreviewLocale = 'zh' | 'en'

const props = defineProps<{
  type: PreviewType
  model: Record<string, any>
  meta?: Record<string, any>
}>()

const locale = ref<PreviewLocale>('zh')
const iframeRef = ref<HTMLIFrameElement | null>(null)

const previewOrigin = (import.meta.env.VITE_SITE_PREVIEW_ORIGIN as string | undefined) || 'http://127.0.0.1:3000'
const previewSource = window.location.origin
const previewSessionId =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
const previewKey = computed(() => `admin-preview:${props.type}:${previewSessionId}`)

function text(value: unknown, fallback = '') {
  return pickI18n(value, locale.value) || fallback
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
      image: section?.image || '',
      stat: statParts.join(' / '),
      breathImage: section?.breathImage || '',
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
    image: props.model.heroImage || '',
    gallery: list(props.model.galleryImages),
    tags: list(props.model.tags).map((item) => text(item)).filter(Boolean),
    food: text(props.model.foodTitle),
    foodDescription: text(props.model.foodDescription),
    routeSlugs: list(props.model.routeSlugs),
    relatedCitySlugs: list(props.model.relatedCitySlugs),
    foodImages: list(props.model.foodImages),
    sections,
  }
}

function normalizeCulture(value: string) {
  if (value === 'BayArea') return 'Bay Area'
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
    image: props.model.coverImage || '',
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
      image: stop?.image || undefined,
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
    image: props.model.image || '',
    materialNotes: text(props.model.material) || undefined,
    story: text(props.model.story),
    gallery: list(props.model.gallery),
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

function postPreview() {
  const frame = iframeRef.value?.contentWindow
  if (!frame) return

  frame.postMessage(
    {
      channel: 'lingtour-preview',
      key: previewKey.value,
      type: props.type,
      locale: locale.value,
      source: previewSource,
      data: previewPayload.value,
      timestamp: Date.now(),
    },
    previewOrigin,
  )
}

watch(previewPayload, postPreview, { deep: true })
watch(locale, postPreview)
</script>

<template>
  <aside class="frontend-preview">
    <div class="preview-toolbar">
      <div>
        <strong>真实前台预览</strong>
        <p>{{ iframePath }}</p>
      </div>
      <div class="toolbar-actions">
        <el-segmented
          v-model="locale"
          :options="[
            { label: '中文', value: 'zh' },
            { label: 'EN', value: 'en' },
          ]"
          size="small"
        />
        <a :href="iframeSrc" target="_blank" rel="noreferrer">打开新窗口</a>
      </div>
    </div>

    <div class="preview-frame-shell">
      <iframe ref="iframeRef" :src="iframeSrc" class="preview-frame" title="Frontend page preview" @load="postPreview" />
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

.toolbar-actions a {
  color: #409eff;
  font-size: 12px;
  text-decoration: none;
}

.preview-frame-shell {
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(17, 25, 35, 0.08);
}

.preview-frame {
  display: block;
  width: 100%;
  height: min(78vh, 980px);
  border: 0;
  background: #fff;
}

@media (max-width: 1100px) {
  .frontend-preview {
    position: static;
  }

  .preview-frame {
    height: 70vh;
  }
}
</style>
