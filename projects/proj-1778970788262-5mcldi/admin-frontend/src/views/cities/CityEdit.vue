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
import type { CityFormData } from '@/types/city'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import FrontendPagePreview from '@/components/FrontendPagePreview.vue'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => Boolean(route.params.id))
const loading = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const activeChapter = ref('overview')

const cityOptions = ref<Array<{ id: string; slug: string; name: string }>>([])
const routeOptions = ref<Array<{ id: string; slug: string; title: string; cityName: string }>>([])

const rules = {
  slug: [
    { required: true, message: '请输入 Slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug 必须为 kebab-case 格式', trigger: 'blur' },
  ],
  'name.zh': [{ required: true, message: '请输入城市名称', trigger: 'blur' }],
}

const form = reactive<any>({
  slug: '',
  name: { zh: '', en: '' },
  regionLabel: { zh: '', en: '' },
  adcode: 0,
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
    statLabel: normalizeI18nValue(section.statLabel),
    statValue: normalizeI18nValue(section.statValue),
    breathImage: section.breathImage || '',
    breathQuote: normalizeI18nValue(section.breathQuote),
    sortOrder: section.sortOrder ?? index,
  }
}

function addTag() {
  if (!newTag.zh.trim() && !newTag.en.trim()) return
  form.tags.push({ zh: newTag.zh.trim(), en: newTag.en.trim() })
  newTag.zh = ''
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
    label: section.title?.zh?.trim() || section.title?.en?.trim() || `Section ${index + 1}`,
    badge: `#${index + 1}`,
  })),
  { key: 'food', label: 'Food' },
  { key: 'related', label: 'Routes' },
  { key: 'publish', label: 'Publish' },
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

async function loadCityOptions() {
  const res = await citiesApi.getCities({ page: 1, pageSize: 200 })
  cityOptions.value = (res.data.data.items || []).map((item: any) => ({
    id: item.id,
    slug: item.slug,
    name: item.name?.zh || item.name?.en || item.slug,
  }))
}

async function loadRouteOptions() {
  const res = await routesApi.getRoutes({ page: 1, pageSize: 200 })
  routeOptions.value = (res.data.data.items || []).map((item: any) => ({
    id: item.id,
    slug: item.slug,
    title: item.title?.zh || item.title?.en || item.slug,
    cityName: item.cityName?.zh || item.cityName?.en || '',
  }))
}

function fillFromApi(data: any) {
  Object.assign(form, {
    slug: data.slug || '',
    name: toI18n(data.name),
    regionLabel: toI18n(data.regionLabel),
    adcode: data.adcode || 0,
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
    await Promise.all([loadCityOptions(), loadRouteOptions()])
    if (isEdit.value) {
      const res = await citiesApi.getCity(route.params.id as string)
      fillFromApi(res.data.data)
    }
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, '加载城市数据失败'))
    router.push('/admin/cities')
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  try {
    await formRef.value?.validate()
  } catch {
    ElMessage.warning('请检查必填项')
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await citiesApi.updateCity(route.params.id as string, toPayload())
      ElMessage.success('城市更新成功')
    } else {
      await citiesApi.createCity(toPayload() as CityFormData)
      ElMessage.success('城市创建成功')
    }
    router.push('/admin/cities')
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, '保存失败'))
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
    <div class="page-header">
      <h2>{{ isEdit ? '编辑城市' : '新增城市' }}</h2>
      <div>
        <el-button @click="router.push('/admin/cities')">返回</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <el-card shadow="never" class="section-card">
          <template #header>基础信息</template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Slug" prop="slug">
                <el-input v-model="form.slug" placeholder="guangzhou" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="行政区划代码">
                <el-input-number v-model="form.adcode" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="城市名称" prop="name.zh">
            <I18nInput v-model="form.name" />
          </el-form-item>
          <el-form-item label="地区标签">
            <I18nInput v-model="form.regionLabel" />
          </el-form-item>
          <el-form-item label="标签">
            <div class="tag-list">
              <el-tag v-for="(tag, index) in form.tags" :key="index" closable @close="removeTag(Number(index))">
                {{ tag.zh || tag.en }} / {{ tag.en || tag.zh }}
              </el-tag>
            </div>
            <div class="inline-row">
              <el-input v-model="newTag.zh" placeholder="中文标签" />
              <el-input v-model="newTag.en" placeholder="English tag" />
              <el-button :icon="Plus" @click="addTag">添加</el-button>
            </div>
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card chapter-workspace">
          <template #header>
            <div class="chapter-toolbar">
              <div class="chapter-intro">
                <div class="chapter-eyebrow">City Story Workspace</div>
                <div class="chapter-headline">
                  <h3>章节工作台</h3>
                  <span class="chapter-active-pill">
                    {{ chapterTabs.find((chapter) => chapter.key === activeChapter)?.label || 'Overview' }}
                  </span>
                </div>
                <p>按章节切换城市内容，减少长表单滚动，Section 的新增、排序和删除也集中在这里处理。</p>
              </div>
              <div class="chapter-tabs">
                <button
                  v-for="chapter in chapterTabs"
                  :key="chapter.key"
                  type="button"
                  class="chapter-tab"
                  :class="{ active: activeChapter === chapter.key }"
                  @click="activeChapter = chapter.key"
                >
                  {{ chapter.label }}
                </button>
              </div>
              <div class="chapter-actions">
                <el-button size="small" type="primary" :icon="Plus" @click="addSection">新增 Section</el-button>
                <el-button
                  size="small"
                  :icon="ArrowUp"
                  :disabled="!isSectionChapter || activeSectionIndex === 0"
                  @click="moveActiveSection(-1)"
                >
                  上移
                </el-button>
                <el-button
                  size="small"
                  :icon="ArrowDown"
                  :disabled="!isSectionChapter || activeSectionIndex === form.sections.length - 1"
                  @click="moveActiveSection(1)"
                >
                  下移
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  :disabled="!isSectionChapter"
                  @click="removeSection(activeSectionIndex)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="activeChapter === 'overview'" class="chapter-panel">
            <div class="chapter-title">Overview（图文）</div>
            <el-form-item label="Overview 主图">
              <ImageUpload v-model="form.heroImage" />
            </el-form-item>
            <el-form-item label="Overview 文案">
              <I18nMarkdownEditor v-model="form.heroNarrative" :rows="6" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'intro'" class="chapter-panel">
            <div class="chapter-title">Intro（图文）</div>
            <el-form-item label="Intro 正文">
              <I18nMarkdownEditor v-model="form.editorIntro" :rows="8" />
            </el-form-item>
            <el-form-item label="Intro 图片组">
              <ImageUpload v-model="form.galleryImages" multiple :limit="12" />
            </el-form-item>
          </div>

          <div v-else-if="isSectionChapter && activeSection" class="chapter-panel">
            <div class="chapter-title">
              {{ activeSection.title?.zh?.trim() || activeSection.title?.en?.trim() || `Section ${activeSectionIndex + 1}` }}
            </div>
            <el-form-item label="Section 图片">
              <ImageUpload v-model="activeSection.image" />
            </el-form-item>
            <el-form-item label="Section 标题">
              <I18nInput v-model="activeSection.title" />
            </el-form-item>
            <el-form-item label="Section 正文">
              <I18nMarkdownEditor v-model="activeSection.body" :rows="8" />
            </el-form-item>
            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="数据标签">
                  <I18nInput v-model="activeSection.statLabel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="数据内容">
                  <I18nInput v-model="activeSection.statValue" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="呼吸图">
              <ImageUpload v-model="activeSection.breathImage" />
            </el-form-item>
            <el-form-item label="引语">
              <I18nInput v-model="activeSection.breathQuote" type="textarea" :rows="3" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'food'" class="chapter-panel">
            <div class="chapter-title">Food（图文）</div>
            <el-form-item label="Food 标题">
              <I18nInput v-model="form.foodTitle" />
            </el-form-item>
            <el-form-item label="Food 正文">
              <I18nMarkdownEditor v-model="form.foodDescription" :rows="6" />
            </el-form-item>
            <el-form-item label="Food 图片组">
              <ImageUpload v-model="form.foodImages" multiple :limit="10" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'related'" class="chapter-panel">
            <div class="chapter-title">关联路线</div>
            <el-form-item label="选择现有路线">
              <el-select
                v-model="form.routeSlugs"
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                placeholder="直接选择已配置路线"
                style="width: 100%"
              >
                <el-option
                  v-for="routeItem in routeOptions"
                  :key="routeItem.id"
                  :label="`${routeItem.title} (${routeItem.slug})`"
                  :value="routeItem.slug"
                />
              </el-select>
              <p class="field-hint">选中的路线会在前台城市页中作为延伸阅读或联动入口出现，便于从城市继续进入具体路线。</p>
            </el-form-item>
            <div v-if="selectedRouteCards.length" class="selected-city-grid">
              <div v-for="routeItem in selectedRouteCards" :key="routeItem.slug" class="selected-city-card">
                <strong>{{ routeItem.title }}</strong>
                <span>{{ routeItem.cityName || routeItem.slug }}</span>
              </div>
            </div>
            <el-empty v-else description="还没有关联路线" :image-size="56" />
          </div>

          <div v-else-if="activeChapter === 'publish'" class="chapter-panel">
            <div class="chapter-title">发布状态</div>
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio value="draft">草稿</el-radio>
                <el-radio value="published">已发布</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </el-card>
      </el-form>

      <FrontendPagePreview type="city" :model="form" />
    </div>
  </div>
</template>

<style scoped>
.edit-page { padding-bottom: 40px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.page-header h2 { margin: 0; font-size: 20px; }
.editor-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(620px, 46vw); gap: 20px; align-items: start; }
.section-card { margin-bottom: 16px; }
.inline-row, .tag-list { display: flex; align-items: center; gap: 8px; }
.inline-row { width: 100%; }
.inline-row .el-input { max-width: 260px; }
.tag-list { flex-wrap: wrap; min-height: 28px; margin-bottom: 8px; }
.field-hint { margin: 8px 0 0; color: #909399; font-size: 12px; line-height: 1.5; }
.selected-city-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
.selected-city-card { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; background: #f8fbff; }
.selected-city-card strong { display: block; color: #303133; }
.selected-city-card span { display: block; margin-top: 4px; color: #909399; font-size: 12px; }
.chapter-workspace :deep(.el-card__header) { padding-bottom: 18px; }
.chapter-workspace :deep(.el-card__body) { padding-top: 18px; }
.chapter-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px 18px;
  align-items: start;
}
.chapter-intro {
  grid-column: 1 / -1;
  padding: 18px 20px;
  border: 1px solid #d9ecff;
  border-radius: 18px;
  background:
    radial-gradient(circle at top left, rgba(64, 158, 255, 0.16), transparent 34%),
    linear-gradient(135deg, #f7fbff 0%, #ffffff 65%);
}
.chapter-eyebrow {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #409eff;
}
.chapter-headline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.chapter-headline h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: #1f2a37;
}
.chapter-active-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(64, 158, 255, 0.12);
  color: #1767c6;
  font-size: 12px;
  font-weight: 600;
}
.chapter-intro p {
  margin: 10px 0 0;
  max-width: 720px;
  color: #5b6472;
  font-size: 13px;
  line-height: 1.6;
}
.chapter-tabs { display: flex; flex-wrap: wrap; gap: 10px; }
.chapter-tab {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  border: 1px solid #d7deea;
  background: #fff;
  color: #526071;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}
.chapter-tab:hover {
  border-color: #b9d9ff;
  box-shadow: 0 8px 20px rgba(31, 42, 55, 0.06);
  transform: translateY(-1px);
}
.chapter-tab.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #eff7ff 0%, #f7fbff 100%);
  color: #1767c6;
  box-shadow: 0 10px 24px rgba(64, 158, 255, 0.14);
}
.chapter-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; flex-shrink: 0; }
.chapter-panel { min-height: 320px; }
.chapter-title {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
@media (max-width: 1100px) {
  .editor-shell { grid-template-columns: 1fr; }
  .chapter-toolbar { grid-template-columns: 1fr; }
  .chapter-actions { justify-content: flex-start; }
}
</style>
