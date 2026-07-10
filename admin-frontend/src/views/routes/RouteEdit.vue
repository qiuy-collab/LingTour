<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { ArrowDown, ArrowUp, Delete, Plus } from '@element-plus/icons-vue'
import { routesApi } from '@/api/routes'
import { citiesApi } from '@/api/cities'
import { homeApi } from '@/api/home'
import { pickI18n, toI18n, toI18nArray } from '@/types/common'
import { extractErrorMessage, optionalI18n } from '@/utils/i18n'
import { useDirtyForm } from '@/composables/useDirtyForm'
import { usePublishCheck } from '@/composables/usePublishCheck'
import { ElMessageBox } from 'element-plus'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import FrontendPagePreview from '@/components/FrontendPagePreview.vue'
import EditorPageHeader from '@/components/editor/EditorPageHeader.vue'
import EditorWorkspace, { type EditorWorkspaceTab } from '@/components/editor/EditorWorkspace.vue'
import {
  DEFAULT_ROUTE_REGIONS,
  ROUTE_TAG_OPTIONS,
  formatRouteRegionLabel,
  formatRouteTagLabel,
  normalizeRouteTag,
} from '@/constants/guangdongRegions'
import type { RouteRegionConfig } from '@/types/home'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => Boolean(route.params.id))
const loading = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const activeWorkspace = ref('hero')

const rules = {
  slug: [
    { required: true, message: 'Enter a slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug must use kebab-case', trigger: 'blur' },
  ],
  'title.en': [{ required: true, message: 'Enter the route title', trigger: 'blur' }],
}

const form = reactive<any>({
  slug: '',
  title: { zh: '', en: '' },
  cultureTag: 'Bay Area',
  cityName: { zh: '', en: '' },
  citySlugs: [],
  routeRegionKey: '',
  duration: { zh: '', en: '' },
  audience: { zh: '', en: '' },
  summary: { zh: '', en: '' },
  story: { zh: '', en: '' },
  coverImage: '',
  stops: [],
  published: false,
})

const cityOptions = ref<Array<{ slug: string; name: string; nameZh: string; nameEn: string }>>([])
const routeRegionOptions = ref<RouteRegionConfig[]>(DEFAULT_ROUTE_REGIONS.map((item) => ({ ...item })))

const { isDirty, resetDirty, disableDirtyCheck } = useDirtyForm({ form })
const { check: runPublishCheck } = usePublishCheck()

function createStop() {
  return {
    id: `stop-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    sortOrder: form.stops.length,
    time: '',
    stopName: { zh: '', en: '' },
    story: { zh: '', en: '' },
    culturalStory: { zh: '', en: '' },
    details: [],
    image: '',
    images: [],
    lat: 0,
    lng: 0,
    meal: { zh: '', en: '' },
    hotel: { zh: '', en: '' },
    transit: { zh: '', en: '' },
    plan: '',
  }
}

function addStop() {
  form.stops.push(createStop())
  activeWorkspace.value = `stop-${form.stops.length - 1}`
}

function removeStop(index: number) {
  form.stops.splice(index, 1)
  reindexStops()
  activeWorkspace.value = form.stops.length ? `stop-${Math.min(index, form.stops.length - 1)}` : 'hero'
}

function moveStop(index: number, delta: -1 | 1) {
  const target = index + delta
  if (target < 0 || target >= form.stops.length) return
  ;[form.stops[index], form.stops[target]] = [form.stops[target], form.stops[index]]
  reindexStops()
}

function reindexStops() {
  form.stops.forEach((stop: any, index: number) => {
    stop.sortOrder = index
  })
}

function moveActiveStop(delta: -1 | 1) {
  if (activeStopIndex.value < 0) return
  const currentIndex = activeStopIndex.value
  moveStop(currentIndex, delta)
  const targetIndex = currentIndex + delta
  if (targetIndex >= 0 && targetIndex < form.stops.length) {
    activeWorkspace.value = `stop-${targetIndex}`
  }
}

function addDetail(stop: any) {
  stop.details.push({ zh: '', en: '' })
}

function removeDetail(stop: any, index: number | string) {
  stop.details.splice(Number(index), 1)
}

const workspaceTabs = computed<EditorWorkspaceTab[]>(() => [
  { key: 'hero', label: 'Route Summary' },
  { key: 'story', label: 'Route Story' },
  ...form.stops.map((stop: any, index: number) => ({
    key: `stop-${index}`,
    label: pickI18n(stop.stopName, 'en') || `Stop ${index + 1}`,
    badge: `#${index + 1}`,
  })),
])

const activeStopIndex = computed(() => {
  const match = /^stop-(\d+)$/.exec(activeWorkspace.value)
  return match ? Number(match[1]) : -1
})

const activeStop = computed(() => (activeStopIndex.value >= 0 ? form.stops[activeStopIndex.value] : null))
const selectedCityCards = computed(() =>
  form.citySlugs
    .map((slug: string) => cityOptions.value.find((item) => item.slug === slug))
    .filter(Boolean),
)

const activeWorkspaceLabel = computed(() => {
  return workspaceTabs.value.find((item) => item.key === activeWorkspace.value)?.label || 'Route Summary'
})

function applySelectedCitiesToDisplayName() {
  if (!selectedCityCards.value.length) return
  form.cityName = {
    zh: selectedCityCards.value.map((item: any) => item.nameZh || item.name).join(' / '),
    en: selectedCityCards.value.map((item: any) => item.nameEn || item.name).join(' / '),
  }
}

function fillFromApi(data: any) {
  Object.assign(form, {
    slug: data.slug || '',
    title: toI18n(data.title),
    cultureTag: normalizeRouteTag(data.cultureTag),
    cityName: toI18n(data.cityName),
    citySlugs: Array.isArray(data.citySlugs) ? data.citySlugs : [],
    routeRegionKey: data.routeRegionKey || '',
    duration: toI18n(data.duration),
    audience: toI18n(data.audience),
    summary: toI18n(data.summary),
    story: toI18n(data.story),
    coverImage: data.coverImage || '',
    published: data.published ?? false,
    stops: (data.stops || []).map((stop: any, index: number) => ({
      id: stop.id || `stop-${index}`,
      sortOrder: stop.sortOrder ?? index,
      time: stop.time || '',
      stopName: toI18n(stop.stopName),
      story: toI18n(stop.story),
      culturalStory: toI18n(stop.culturalStory),
      details: toI18nArray(stop.details),
      image: stop.image || '',
      images: Array.isArray(stop.images) ? stop.images : [],
      lat: stop.lat ?? 0,
      lng: stop.lng ?? 0,
      meal: toI18n(stop.meal),
      hotel: toI18n(stop.hotel),
      transit: toI18n(stop.transit),
      plan: stop.plan || '',
    })),
  })
}

function toPayload() {
  return {
    slug: form.slug,
    title: form.title,
    cultureTag: normalizeRouteTag(form.cultureTag),
    cityName: form.cityName,
    citySlugs: form.citySlugs,
    routeRegionKey: form.routeRegionKey || undefined,
    duration: form.duration,
    audience: form.audience,
    summary: form.summary,
    story: form.story,
    coverImage: form.coverImage,
    published: form.published,
    stops: form.stops.map((stop: any, index: number) => ({
      sortOrder: index,
      time: stop.time,
      stopName: stop.stopName,
      story: optionalI18n(stop.story),
      culturalStory: optionalI18n(stop.culturalStory),
      details: stop.details.filter((detail: any) => detail.zh || detail.en),
      image: stop.image,
      images: stop.images || [],
      lat: Number(stop.lat || 0),
      lng: Number(stop.lng || 0),
      meal: optionalI18n(stop.meal),
      hotel: optionalI18n(stop.hotel),
      transit: optionalI18n(stop.transit),
      plan: stop.plan || '',
    })),
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const [cityRes, homeRes] = await Promise.all([
      citiesApi.getCities({ page: 1, pageSize: 200 }),
      homeApi.getHomeConfig(),
    ])

    cityOptions.value = (cityRes.data.data.data || []).map((item: any) => ({
      slug: item.slug,
      name: pickI18n(item.name),
      nameZh: item.name?.zh || '',
      nameEn: item.name?.en || '',
    }))

    routeRegionOptions.value = homeRes.data.data.routeRegions?.length
      ? homeRes.data.data.routeRegions
      : DEFAULT_ROUTE_REGIONS.map((item) => ({ ...item }))

    if (isEdit.value) {
      const res = await routesApi.getRoute(route.params.id as string)
      fillFromApi(res.data.data)
    }

    if (!form.stops.length) {
      addStop()
      form.stops = []
      activeWorkspace.value = 'hero'
    }

    resetDirty()
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, 'Failed to load route data'))
    router.push('/admin/routes')
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  try {
    await formRef.value?.validate()
  } catch {
    ElMessage.warning('Complete the required fields')
    return
  }

  // ── Publish pre-check: only when switching to published ──
  if (form.published) {
    const result = runPublishCheck('route', form)

    if (!result.canPublish) {
      ElMessage.error(result.errors[0])
      return
    }

    if (result.warnings.length) {
      try {
        await ElMessageBox.confirm(
          result.warnings.join('\n'),
          'Publish warning',
          {
            confirmButtonText: 'Publish anyway',
            cancelButtonText: 'Review changes',
            type: 'warning',
          },
        )
      } catch {
        return // user cancelled
      }
    }
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await routesApi.updateRoute(route.params.id as string, toPayload())
      ElMessage.success('Route updated')
    } else {
      await routesApi.createRoute(toPayload())
      ElMessage.success('Route created')
    }
    disableDirtyCheck()
    router.push('/admin/routes')
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, 'Save failed'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="edit-page" v-loading="loading">
    <EditorPageHeader
      :title="isEdit ? 'Edit Route' : 'Create Route'"
      back-to="/admin/routes"
      :saving="saving"
      :dirty="isDirty"
      @save="handleSave"
    />

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <el-card shadow="never" class="section-card">
          <template #header>Basic Information</template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Slug" prop="slug">
                <el-input v-model="form.slug" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Route Title" prop="title.en">
                <I18nInput v-model="form.title" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="Culture Tag">
                <el-select v-model="form.cultureTag" style="width: 100%">
                  <el-option
                    v-for="item in ROUTE_TAG_OPTIONS"
                    :key="item.value"
                    :label="formatRouteTagLabel(item.value)"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Route Region">
                <el-select v-model="form.routeRegionKey" clearable style="width: 100%">
                  <el-option
                    v-for="item in routeRegionOptions"
                    :key="item.key"
                    :label="formatRouteRegionLabel(item)"
                    :value="item.key"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Publishing Status">
                <el-switch v-model="form.published" active-text="Published" inactive-text="Draft" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>Route Assignment</template>
          <el-form-item label="Linked Cities">
            <el-select
              v-model="form.citySlugs"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              style="width: 100%"
            >
              <el-option
                v-for="item in cityOptions"
                :key="item.slug"
                :label="`${item.name} (${item.slug})`"
                :value="item.slug"
              />
            </el-select>
          </el-form-item>
          <div v-if="selectedCityCards.length" class="selected-grid">
            <div v-for="city in selectedCityCards" :key="city.slug" class="selected-card">
              <strong>{{ city.nameZh || city.name }}</strong>
              <span>{{ city.slug }}</span>
            </div>
          </div>
          <div class="link-row">
            <el-button text @click="applySelectedCitiesToDisplayName">Use linked cities as display name</el-button>
          </div>
          <el-form-item label="Display City Name">
            <I18nInput v-model="form.cityName" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Duration">
                <I18nInput v-model="form.duration" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Audience">
                <I18nInput v-model="form.audience" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>Cover Image</template>
          <el-form-item label="Route Cover">
            <ImageUpload v-model="form.coverImage" module="routes" />
          </el-form-item>
        </el-card>

        <EditorWorkspace
          v-model="activeWorkspace"
          eyebrow="Route Story Workspace"
          title="Route Content"
          description="Edit the route summary, story, and itinerary stops."
          :active-label="activeWorkspaceLabel"
          :tabs="workspaceTabs"
        >
          <template #toolbar>
            <div class="workspace-actions" v-if="activeStop">
              <el-button :icon="Plus" @click="addStop">Add Stop</el-button>
              <el-button :icon="ArrowUp" @click="moveActiveStop(-1)">Move Up</el-button>
              <el-button :icon="ArrowDown" @click="moveActiveStop(1)">Move Down</el-button>
              <el-button type="danger" :icon="Delete" @click="removeStop(activeStopIndex)">Delete</el-button>
            </div>
            <div class="workspace-actions" v-else>
              <el-button :icon="Plus" @click="addStop">Add Stop</el-button>
            </div>
          </template>

          <div v-if="activeWorkspace === 'hero'" class="workspace-panel">
            <div class="panel-title">Route Summary</div>
            <el-form-item label="Summary">
              <I18nMarkdownEditor v-model="form.summary" :rows="6" />
            </el-form-item>
          </div>

          <div v-else-if="activeWorkspace === 'story'" class="workspace-panel">
            <div class="panel-title">Route Story</div>
            <el-form-item label="Story">
              <I18nMarkdownEditor v-model="form.story" :rows="10" />
            </el-form-item>
          </div>

          <div v-else-if="activeStop" class="workspace-panel">
            <div class="panel-title">Stop {{ activeStopIndex + 1 }}</div>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="Time">
                  <el-input v-model="activeStop.time" placeholder="08:30" />
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="Stop Name">
                  <I18nInput v-model="activeStop.stopName" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="Stop Image">
              <ImageUpload v-model="activeStop.image" module="routes" />
            </el-form-item>
            <el-form-item label="Stop Gallery">
              <ImageUpload v-model="activeStop.images" multiple :limit="10" module="routes" />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Latitude">
                  <el-input-number v-model="activeStop.lat" :precision="6" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Longitude">
                  <el-input-number v-model="activeStop.lng" :precision="6" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="On-site Story">
              <I18nMarkdownEditor v-model="activeStop.story" :rows="6" />
            </el-form-item>
            <el-form-item label="Cultural Context">
              <I18nMarkdownEditor v-model="activeStop.culturalStory" :rows="6" />
            </el-form-item>
            <el-form-item label="Stop Details">
              <div class="detail-list">
                <div v-for="(_, index) in activeStop.details" :key="index" class="detail-row">
                  <I18nInput v-model="activeStop.details[index]" />
                  <el-button text type="danger" @click="removeDetail(activeStop, index)">Delete</el-button>
                </div>
                <el-button :icon="Plus" @click="addDetail(activeStop)">Add Detail</el-button>
              </div>
            </el-form-item>
            <el-form-item label="Itinerary Plan">
              <el-input
                v-model="activeStop.plan"
                type="textarea"
                :rows="2"
                placeholder="Brief itinerary or experience notes for this stop"
              />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="Dining">
                  <I18nInput v-model="activeStop.meal" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Accommodation">
                  <I18nInput v-model="activeStop.hotel" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Transport">
                  <I18nInput v-model="activeStop.transit" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </EditorWorkspace>
      </el-form>

      <FrontendPagePreview type="route" :model="form" />
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';

.link-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.workspace-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-list {
  display: grid;
  gap: 10px;
}

.detail-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
}
</style>
