<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { ArrowDown, ArrowUp, Delete, Plus } from '@element-plus/icons-vue'
import { citiesApi } from '@/api/cities'
import { routesApi } from '@/api/routes'
import { toI18n } from '@/types/common'
import { extractErrorMessage } from '@/utils/i18n'
import { useDirtyForm } from '@/composables/useDirtyForm'
import type { CityFormData } from '@/types/city'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import FrontendPagePreview from '@/components/FrontendPagePreview.vue'
import EditorPageHeader from '@/components/editor/EditorPageHeader.vue'
import EditorWorkspace from '@/components/editor/EditorWorkspace.vue'
import {
  GUANGDONG_ADCODE_OPTIONS,
  formatAdcodeLabel,
} from '@/constants/guangdongRegions'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => Boolean(route.params.id))
const loading = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const activeChapter = ref('overview')

const routeOptions = ref<Array<{ id: string; slug: string; title: string; cityName: string }>>([])

const rules = {
  slug: [
    { required: true, message: 'Enter a slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug must use kebab-case', trigger: 'blur' },
  ],
  'name.en': [{ required: true, message: 'Enter the city name', trigger: 'blur' }],
}

const form = reactive<any>({
  slug: '',
  name: { zh: '', en: '' },
  regionLabel: { zh: '', en: '' },
  adcode: undefined,
  heroImage: '',
  heroNarrative: { zh: '', en: '' },
  tags: [],
  editorIntro: { zh: '', en: '' },
  galleryImages: [],
  foodTitle: { zh: '', en: '' },
  foodDescription: { zh: '', en: '' },
  foodImages: [],
  sections: [],
  status: 'draft',
  routeSlugs: [],
  relatedCitySlugs: [],
})

const { isDirty, resetDirty, disableDirtyCheck } = useDirtyForm({ form })

const newTag = reactive({ zh: '', en: '' })

function normalizeI18nValue(value: unknown) {
  return toI18n(value)
}

function normalizeTagList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => normalizeI18nValue(item))
    .filter((item) => item.zh.trim() || item.en.trim())
}

function normalizeSection(section: any, index: number) {
  return {
    id: section.id || `section-${index}`,
    title: normalizeI18nValue(section.title),
    body: normalizeI18nValue(section.body),
    image: section.image || '',
    images: Array.isArray(section.images) ? section.images : [],
    statLabel: normalizeI18nValue(section.statLabel),
    statValue: normalizeI18nValue(section.statValue),
    breathImage: section.breathImage || '',
    breathQuote: normalizeI18nValue(section.breathQuote),
    sortOrder: section.sortOrder ?? index,
  }
}

function addTag() {
  if (!newTag.en.trim()) return
  form.tags.push({ zh: '', en: newTag.en.trim() })
  newTag.en = ''
}

function removeTag(index: number) {
  form.tags.splice(index, 1)
}

function addSection() {
  form.sections.push({
    id: `section-${Date.now()}`,
    title: { zh: '', en: '' },
    body: { zh: '', en: '' },
    image: '',
    images: [],
    statLabel: { zh: '', en: '' },
    statValue: { zh: '', en: '' },
    breathImage: '',
    breathQuote: { zh: '', en: '' },
    sortOrder: form.sections.length,
  })
  activeChapter.value = `section-${form.sections.length - 1}`
}

function removeSection(index: number) {
  form.sections.splice(index, 1)
  reindexSections()
  if (form.sections.length === 0) {
    activeChapter.value = 'overview'
    return
  }
  activeChapter.value = `section-${Math.min(index, form.sections.length - 1)}`
}

function moveSection(index: number, delta: -1 | 1) {
  const target = index + delta
  if (target < 0 || target >= form.sections.length) return
  ;[form.sections[index], form.sections[target]] = [form.sections[target], form.sections[index]]
  reindexSections()
}

function reindexSections() {
  form.sections.forEach((section: any, index: number) => {
    section.sortOrder = index
  })
}

const chapterTabs = computed(() => [
  { key: 'overview', label: 'Overview' },
  { key: 'intro', label: 'Intro' },
  ...form.sections.map((section: any, index: number) => ({
    key: `section-${index}`,
    label: section.title?.en?.trim() || section.title?.zh?.trim() || `Section ${index + 1}`,
    badge: `#${index + 1}`,
  })),
  { key: 'food', label: 'Food' },
])

const activeSectionIndex = computed(() => {
  const match = /^section-(\d+)$/.exec(activeChapter.value)
  return match ? Number(match[1]) : -1
})

const activeSection = computed(() =>
  activeSectionIndex.value >= 0 ? form.sections[activeSectionIndex.value] : null,
)

const isSectionChapter = computed(() => activeSectionIndex.value >= 0)

function moveActiveSection(delta: -1 | 1) {
  if (activeSectionIndex.value < 0) return
  const currentIndex = activeSectionIndex.value
  moveSection(currentIndex, delta)
  const targetIndex = currentIndex + delta
  if (targetIndex >= 0 && targetIndex < form.sections.length) {
    activeChapter.value = `section-${targetIndex}`
  }
}

async function loadRouteOptions() {
  const res = await routesApi.getRoutes({ page: 1, pageSize: 200 })
  routeOptions.value = (res.data.data.data || []).map((item: any) => ({
    id: item.id,
    slug: item.slug,
    title: item.title?.en || item.title?.zh || item.slug,
    cityName: item.cityName?.en || item.cityName?.zh || '',
  }))
}

function fillFromApi(data: any) {
  Object.assign(form, {
    slug: data.slug || '',
    name: toI18n(data.name),
    regionLabel: toI18n(data.regionLabel),
    adcode: data.adcode ?? undefined,
    heroImage: data.heroImage || '',
    heroNarrative: toI18n(data.heroNarrative),
    tags: normalizeTagList(data.tags),
    editorIntro: toI18n(data.editorIntro),
    galleryImages: data.galleryImages || [],
    foodTitle: toI18n(data.foodTitle),
    foodDescription: toI18n(data.foodDescription),
    foodImages: data.foodImages || [],
    sections: (data.sections || []).map((section: any, index: number) => normalizeSection(section, index)),
    status: data.published ? 'published' : 'draft',
    routeSlugs: data.routeSlugs || data.routes?.map((item: any) => item.slug) || [],
    relatedCitySlugs: data.relatedCitySlugs || [],
  })
}

function toPayload() {
  return {
    slug: form.slug,
    name: form.name,
    regionLabel: form.regionLabel,
    adcode: form.adcode,
    heroImage: form.heroImage,
    heroNarrative: form.heroNarrative,
    tags: normalizeTagList(form.tags),
    editorIntro: form.editorIntro,
    galleryImages: form.galleryImages,
    foodTitle: form.foodTitle,
    foodDescription: form.foodDescription,
    foodImages: form.foodImages,
    published: form.status === 'published',
    routeSlugs: form.routeSlugs,
    relatedCitySlugs: form.relatedCitySlugs,
    sections: form.sections.map((section: any, index: number) => ({
      title: normalizeI18nValue(section.title),
      body: normalizeI18nValue(section.body),
      image: section.image || '',
      images: section.images || [],
      statLabel: normalizeI18nValue(section.statLabel),
      statValue: normalizeI18nValue(section.statValue),
      breathImage: section.breathImage || '',
      breathQuote: normalizeI18nValue(section.breathQuote),
      sortOrder: index,
    })),
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await loadRouteOptions()
    if (isEdit.value) {
      const res = await citiesApi.getCity(route.params.id as string)
      fillFromApi(res.data.data)
    }
    resetDirty()
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, 'Failed to load city data'))
    router.push('/admin/cities')
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  try {
    await formRef.value?.validate()
  } catch {
    ElMessage.warning('Check the required fields')
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await citiesApi.updateCity(route.params.id as string, toPayload())
      ElMessage.success('City updated')
    } else {
      await citiesApi.createCity(toPayload() as CityFormData)
      ElMessage.success('City created')
    }
    disableDirtyCheck()
    router.push('/admin/cities')
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, 'Save failed'))
  } finally {
    saving.value = false
  }
}

const selectedRouteCards = computed(() =>
  form.routeSlugs
    .map((slug: string) => routeOptions.value.find((item) => item.slug === slug))
    .filter(Boolean),
)
</script>

<template>
  <div class="edit-page" v-loading="loading">
    <EditorPageHeader
      :title="isEdit ? 'Edit City' : 'Create City'"
      back-to="/admin/cities"
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
                <el-input v-model="form.slug" placeholder="zhanjiang" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Map Region">
                <el-select
                  v-model="form.adcode"
                  filterable
                  clearable
                  placeholder="Select a Guangdong map region"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in GUANGDONG_ADCODE_OPTIONS"
                    :key="option.adcode"
                    :label="formatAdcodeLabel(option.adcode)"
                    :value="option.adcode"
                  />
                </el-select>
                <div class="form-hint-text">Used by homepage and route map highlighting.</div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="City Name" prop="name.en">
            <I18nInput v-model="form.name" />
          </el-form-item>
          <el-form-item label="Region Label">
            <I18nInput v-model="form.regionLabel" />
          </el-form-item>
          <el-form-item label="Tags">
            <div class="tag-list">
              <el-tag v-for="(tag, index) in form.tags" :key="index" closable @close="removeTag(Number(index))">
                {{ tag.en || tag.zh }}
              </el-tag>
            </div>
            <div class="inline-row">
              <el-input v-model="newTag.en" placeholder="English tag" />
              <el-button :icon="Plus" @click="addTag">Add</el-button>
            </div>
          </el-form-item>
        </el-card>

        <EditorWorkspace
          v-model="activeChapter"
          eyebrow="City Story Workspace"
          title="City Content"
          description="Edit overview, introduction, sections, and food content."
          :active-label="chapterTabs.find((chapter) => chapter.key === activeChapter)?.label || 'Overview'"
          :tabs="chapterTabs"
        >
          <template #toolbar>
            <div class="chapter-actions">
              <el-button size="small" type="primary" :icon="Plus" @click="addSection">Add Section</el-button>
              <el-button
                size="small"
                :icon="ArrowUp"
                :disabled="!isSectionChapter || activeSectionIndex === 0"
                @click="moveActiveSection(-1)"
              >
                Move Up
              </el-button>
              <el-button
                size="small"
                :icon="ArrowDown"
                :disabled="!isSectionChapter || activeSectionIndex === form.sections.length - 1"
                @click="moveActiveSection(1)"
              >
                Move Down
              </el-button>
              <el-button
                size="small"
                type="danger"
                :icon="Delete"
                :disabled="!isSectionChapter"
                @click="removeSection(activeSectionIndex)"
              >
                Delete
              </el-button>
            </div>
          </template>

          <div v-if="activeChapter === 'overview'" class="workspace-panel">
            <div class="panel-title">Overview</div>
            <el-form-item label="Overview Image">
              <ImageUpload v-model="form.heroImage" module="cities" />
            </el-form-item>
            <el-form-item label="Overview Copy">
              <I18nMarkdownEditor v-model="form.heroNarrative" :rows="6" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'intro'" class="workspace-panel">
            <div class="panel-title">Introduction</div>
            <el-form-item label="Introduction Copy">
              <I18nMarkdownEditor v-model="form.editorIntro" :rows="8" />
            </el-form-item>
            <el-form-item label="Introduction Gallery">
              <ImageUpload v-model="form.galleryImages" multiple :limit="12" module="cities" />
            </el-form-item>
          </div>

          <div v-else-if="isSectionChapter && activeSection" class="workspace-panel">
            <div class="panel-title">
              {{ activeSection.title?.en?.trim() || activeSection.title?.zh?.trim() || `Section ${activeSectionIndex + 1}` }}
            </div>
            <el-form-item label="Section Image">
              <ImageUpload v-model="activeSection.image" module="cities" />
            </el-form-item>
            <el-form-item label="Section Gallery">
              <ImageUpload v-model="activeSection.images" multiple :limit="10" module="cities" />
            </el-form-item>
            <el-form-item label="Section Title">
              <I18nInput v-model="activeSection.title" />
            </el-form-item>
            <el-form-item label="Section Copy">
              <I18nMarkdownEditor v-model="activeSection.body" :rows="8" />
            </el-form-item>
            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="Data Label">
                  <I18nInput v-model="activeSection.statLabel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Data Value">
                  <I18nInput v-model="activeSection.statValue" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="Feature Image">
              <ImageUpload v-model="activeSection.breathImage" module="cities" />
            </el-form-item>
            <el-form-item label="Quote">
              <I18nInput v-model="activeSection.breathQuote" type="textarea" :rows="3" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'food'" class="workspace-panel">
            <div class="panel-title">Food</div>
            <el-form-item label="Food Title">
              <I18nInput v-model="form.foodTitle" />
            </el-form-item>
            <el-form-item label="Food Copy">
              <I18nMarkdownEditor v-model="form.foodDescription" :rows="6" />
            </el-form-item>
            <el-form-item label="Food Gallery">
              <ImageUpload v-model="form.foodImages" multiple :limit="10" module="cities" />
            </el-form-item>
          </div>
        </EditorWorkspace>

        <el-card shadow="never" class="section-card">
          <template #header>Linked Routes</template>
          <el-form-item label="Select Routes">
            <el-select
              v-model="form.routeSlugs"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              placeholder="Select configured routes"
              style="width: 100%"
            >
              <el-option
                v-for="routeItem in routeOptions"
                :key="routeItem.slug"
                :label="`${routeItem.title} (${routeItem.slug})`"
                :value="routeItem.slug"
              />
            </el-select>
            <div class="form-hint-text">Controls linked routes and route-to-city map highlighting.</div>
          </el-form-item>
          <div v-if="selectedRouteCards.length" class="selected-grid">
            <div v-for="routeItem in selectedRouteCards" :key="routeItem.slug" class="selected-card">
              <strong>{{ routeItem.title }}</strong>
              <span>{{ routeItem.cityName || routeItem.slug }}</span>
            </div>
          </div>
          <div v-else class="empty-hint">No linked routes</div>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>Publishing</template>
          <el-form-item label="Status">
            <el-radio-group v-model="form.status">
              <el-radio label="draft">Draft</el-radio>
              <el-radio label="published">Published</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-card>
      </el-form>

      <FrontendPagePreview type="city" :model="form" />
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';

.chapter-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.inline-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
}

.form-hint-text {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
  line-height: 1.5;
}

.empty-hint {
  color: #c0c4cc;
  text-align: center;
  padding: 18px 0 4px;
}

@media (max-width: 1100px) {
  .chapter-actions { justify-content: flex-start; }
  .inline-row { grid-template-columns: 1fr; }
}
</style>
