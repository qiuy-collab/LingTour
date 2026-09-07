<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { citiesApi } from '@/api/cities'
import { routesApi } from '@/api/routes'
import { pickI18n, type I18nObject } from '@/types/common'
import { extractErrorMessage } from '@/utils/i18n'
import { useDirtyForm } from '@/composables/useDirtyForm'
import type { City, CityFormData } from '@/types/city'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import MediaAssetInput from '@/components/media/MediaAssetInput.vue'
import FrontendPagePreview from '@/components/FrontendPagePreview.vue'
import FrontendPreviewDrawer from '@/components/editor/FrontendPreviewDrawer.vue'
import EditorPageHeader from '@/components/editor/EditorPageHeader.vue'
import { GUANGDONG_ADCODE_OPTIONS, formatAdcodeLabel } from '@/constants/guangdongRegions'
import { isIncompleteVideoMedia, legacyImageForMedia, resolvePrimaryMedia } from '@/types/media'

const router = useRouter()
const route = useRoute()
const savedId = ref(typeof route.params.id === 'string' ? route.params.id : '')
const loading = ref(true)
const saving = ref(false)
const publishing = ref(false)
const uploading = ref(false)
const busy = computed(() => loading.value || saving.value || publishing.value || uploading.value)
const mobilePreviewVisible = ref(false)
const formRef = ref<FormInstance>()
const published = ref(false)
const publishedAt = ref<string | null>(null)
const savedAt = ref('')
const saveError = ref('')
const loadError = ref('')
const newTag = ref('')
const routeOptions = ref<Array<{ slug: string; title: string }>>([])
const cityOptions = ref<Array<{ slug: string; name: string }>>([])
const optionsError = ref('')
// Legacy article structures are read for the real preview only and never submitted.
const legacy = ref<Partial<City>>({})

const form = reactive<CityFormData & { heroMedia: NonNullable<CityFormData['heroMedia']> | null }>({
  slug: '',
  name: { zh: '', en: '' },
  regionLabel: { zh: '', en: '' },
  adcode: null,
  heroImage: '',
  heroMedia: null,
  tags: [],
  editorIntro: { zh: '', en: '' },
  contentMarkdown: '',
  routeSlugs: [],
  relatedCitySlugs: [],
})
const { isDirty, resetDirty } = useDirtyForm({ form, initializeOnMount: false })
const previewModel = computed(() => ({ ...legacy.value, ...form, publishedAt: publishedAt.value }))
const rules: FormRules = {
  slug: [
    { required: true, message: '请输入 Slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug 必须是 kebab-case 格式', trigger: 'blur' },
  ],
  'name.en': [{ required: true, whitespace: true, message: '请输入城市名称', trigger: 'blur' }],
  contentMarkdown: [{ max: 200000, message: '正文不能超过 200000 字符', trigger: 'change' }],
}
const saveState = computed(() => isDirty.value ? '未保存' : savedAt.value ? `已保存 ${formatTime(savedAt.value)}` : '新草稿')

function formatTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('zh-CN')
}
function cityI18n(value: unknown): I18nObject {
  if (typeof value === 'string') return { en: value, zh: '' }
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  return { en: typeof data.en === 'string' ? data.en : '', zh: typeof data.zh === 'string' ? data.zh : '' }
}
function normalizeTags(value: unknown): I18nObject[] {
  return Array.isArray(value) ? value.map(cityI18n).filter(tag => tag.en.trim() || tag.zh.trim()) : []
}
function addTag() {
  if (!newTag.value.trim() || busy.value) return
  form.tags.push({ zh: '', en: newTag.value.trim() })
  newTag.value = ''
}
function fillFromApi(data: City) {
  legacy.value = {
    heroNarrative: data.heroNarrative,
    galleryImages: data.galleryImages || [],
    galleryMedia: data.galleryMedia || [],
    foodTitle: data.foodTitle,
    foodDescription: data.foodDescription,
    foodImages: data.foodImages || [],
    sections: data.sections || [],
  }
  Object.assign(form, {
    slug: data.slug || '',
    name: cityI18n(data.name),
    regionLabel: cityI18n(data.regionLabel),
    adcode: data.adcode ?? null,
    heroImage: data.heroImage || '',
    heroMedia: resolvePrimaryMedia(data.heroMedia, data.heroImage || ''),
    tags: normalizeTags(data.tags),
    editorIntro: cityI18n(data.editorIntro),
    contentMarkdown: typeof data.contentMarkdown === 'string' ? data.contentMarkdown : '',
    routeSlugs: data.routeSlugs || [],
    relatedCitySlugs: data.relatedCitySlugs || [],
  })
  published.value = Boolean(data.published)
  publishedAt.value = data.publishedAt ?? null
  savedAt.value = data.updatedAt || data.createdAt || ''
}
function toPayload(): CityFormData {
  const heroMedia = resolvePrimaryMedia(form.heroMedia, form.heroImage)
  // Explicit allowlist: never send publication state or legacy sections/food.
  return {
    slug: form.slug,
    name: { ...form.name },
    regionLabel: { ...form.regionLabel },
    adcode: form.adcode ?? null,
    heroImage: legacyImageForMedia(heroMedia, form.heroImage),
    heroMedia,
    tags: normalizeTags(form.tags),
    editorIntro: { ...form.editorIntro },
    contentMarkdown: form.contentMarkdown,
    routeSlugs: [...(form.routeSlugs || [])],
    relatedCitySlugs: [...(form.relatedCitySlugs || [])],
  }
}
watch(() => form.heroMedia, value => {
  form.heroImage = legacyImageForMedia(value, '')
}, { deep: true })

async function loadOptions() {
  optionsError.value = ''
  const [routes, cities] = await Promise.allSettled([
    routesApi.getRoutes({ page: 1, pageSize: 200 }),
    citiesApi.getCities({ page: 1, pageSize: 100 }),
  ])
  if (routes.status === 'fulfilled') {
    routeOptions.value = (routes.value.data.data.data || []).map((item: { slug: string; title: unknown }) => ({
      slug: item.slug, title: pickI18n(item.title, 'en') || item.slug,
    }))
  }
  if (cities.status === 'fulfilled') {
    cityOptions.value = (cities.value.data.data.data || []).map((item: City) => ({
      slug: item.slug, name: pickI18n(item.name, 'en') || item.slug,
    }))
  }
  if (routes.status === 'rejected' || cities.status === 'rejected') optionsError.value = '部分关联选项加载失败，已有链接会保留。'
}
async function loadCity() {
  loading.value = true
  loadError.value = ''
  try {
    if (savedId.value) {
      const response = await citiesApi.getCity(savedId.value)
      fillFromApi(response.data.data)
    }
    await nextTick()
    resetDirty()
  } catch (error) {
    loadError.value = extractErrorMessage(error, '加载城市数据失败，请重试')
  } finally {
    loading.value = false
  }
}
onMounted(() => { void loadCity(); void loadOptions() })

async function validate(requireBody: boolean) {
  try { await formRef.value?.validate() } catch {
    ElMessage.warning('请检查名称、Slug 和正文长度')
    return false
  }
  if (requireBody && !form.contentMarkdown.trim()) {
    ElMessage.warning('发布前请填写 Markdown 正文')
    return false
  }
  if (requireBody && isIncompleteVideoMedia(form.heroMedia)) {
    ElMessage.warning('发布前请补全封面视频文件和封面图')
    return false
  }
  return true
}
async function persist(): Promise<boolean> {
  saving.value = true
  saveError.value = ''
  try {
    const response = savedId.value
      ? await citiesApi.updateCity(savedId.value, toPayload())
      : await citiesApi.createCity(toPayload())
    const data = response.data.data
    savedId.value = data.id
    published.value = Boolean(data.published)
    publishedAt.value = data.publishedAt ?? null
    savedAt.value = data.updatedAt || new Date().toISOString()
    await nextTick()
    resetDirty()
    return true
  } catch (error) {
    saveError.value = extractErrorMessage(error, '保存失败，编辑内容已保留，请重试')
    ElMessage.error(saveError.value)
    return false
  } finally {
    saving.value = false
  }
}
async function syncEditorAddress() {
  if (savedId.value && route.params.id !== savedId.value) await router.replace(`/admin/cities/${savedId.value}/edit`)
}
async function handleSave() {
  if (busy.value || loadError.value || !(await validate(published.value))) return
  if (await persist()) {
    ElMessage.success(published.value ? '已保存，已发布页面同步更新' : '草稿已保存，尚未发布')
    await syncEditorAddress()
  }
}
async function handlePublish() {
  if (busy.value || loadError.value || !(await validate(true))) return
  try {
    await ElMessageBox.confirm('将保存当前内容并发布到前台，确定继续吗？', '发布城市内容', {
      confirmButtonText: '保存并发布', cancelButtonText: '取消', type: 'warning',
    })
  } catch { return }
  publishing.value = true
  try {
    if (!(await persist())) return
    const response = await citiesApi.publishCity(savedId.value)
    published.value = true
    publishedAt.value = response.data.data.publishedAt ?? null
    saveError.value = ''
    ElMessage.success('城市内容已发布')
  } catch (error) {
    saveError.value = extractErrorMessage(error, '草稿已保存，但发布失败，请重试发布')
    ElMessage.error(saveError.value)
  } finally {
    publishing.value = false
  }
  await syncEditorAddress()
}
async function handleUnpublish() {
  if (busy.value || !savedId.value) return
  try {
    await ElMessageBox.confirm('撤回后前台将不可访问。当前未保存的编辑内容会保留。', '撤回发布', {
      confirmButtonText: '撤回发布', cancelButtonText: '取消', type: 'warning',
    })
  } catch { return }
  publishing.value = true
  try {
    const response = await citiesApi.unpublishCity(savedId.value)
    published.value = false
    publishedAt.value = response.data.data.publishedAt ?? null
    saveError.value = ''
    ElMessage.success('已撤回发布，内容现在为草稿')
  } catch (error) {
    saveError.value = extractErrorMessage(error, '撤回发布失败，请重试')
    ElMessage.error(saveError.value)
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <div class="edit-page culture-editor" v-loading="loading">
    <EditorPageHeader
      :title="savedId ? '编辑城市文化' : '新增城市文化'"
      back-to="/admin/cities"
      :saving="saving || publishing"
      :dirty="isDirty"
      :save-label="published ? '保存修改' : '保存草稿'"
      @save="handleSave"
      @preview="mobilePreviewVisible = true"
    >
      <template #actions>
        <el-button v-if="published" :disabled="busy" @click="handleUnpublish">撤回发布</el-button>
        <el-button v-else :disabled="busy || Boolean(loadError)" :loading="publishing" @click="handlePublish">发布</el-button>
      </template>
    </EditorPageHeader>
    <div class="publication-status" role="status">
      <el-tag :type="published ? 'success' : 'info'">{{ published ? '已发布' : '草稿' }}</el-tag>
      <span>{{ saveState }}</span>
      <span v-if="publishedAt">发布时间 {{ formatTime(publishedAt) }}</span>
      <span v-if="published">保存修改会更新已发布页面</span>
    </div>
    <el-alert v-if="saveError" :title="saveError" type="error" show-icon :closable="false" class="editor-alert" />
    <div v-if="loadError" class="load-error">
      <el-alert :title="loadError" type="error" show-icon :closable="false" />
      <el-button @click="loadCity">重新加载</el-button>
    </div>
    <el-form v-else ref="formRef" :model="form" :rules="rules" :disabled="busy" :inert="saving || publishing" label-position="top" @submit.prevent="handleSave">
      <section class="metadata-section" aria-label="基础信息">
        <el-form-item label="城市名称（英文）" prop="name.en" class="title-field">
          <el-input v-model="form.name.en" placeholder="输入城市名称" />
        </el-form-item>
        <el-form-item label="摘要（英文）">
          <el-input v-model="form.editorIntro.en" type="textarea" :rows="3" placeholder="简要介绍这座城市的文化与旅行亮点" />
        </el-form-item>
        <div class="metadata-grid">
          <div>
            <el-form-item label="Slug" prop="slug"><el-input v-model="form.slug" placeholder="zhanjiang" /></el-form-item>
            <el-form-item label="地区标签（英文）"><el-input v-model="form.regionLabel.en" /></el-form-item>
            <el-form-item label="地图地区">
              <el-select v-model="form.adcode" filterable clearable placeholder="选择广东地图对应地区">
                <el-option v-for="option in GUANGDONG_ADCODE_OPTIONS" :key="option.adcode" :label="formatAdcodeLabel(option.adcode)" :value="option.adcode" />
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="封面媒体">
            <MediaAssetInput v-model="form.heroMedia" :legacy-image="form.heroImage" module="cities" entity-type="city" :entity-id="savedId || undefined" />
          </el-form-item>
        </div>
        <el-form-item label="标签（英文）">
          <div class="tags-field">
            <div v-if="form.tags.length" class="tag-list">
              <el-tag v-for="(tag, index) in form.tags" :key="index" :closable="!busy" @close="form.tags.splice(index, 1)">{{ tag.en || tag.zh }}</el-tag>
            </div>
            <div class="tag-input"><el-input v-model="newTag" placeholder="输入标签" @keydown.enter.prevent="addTag" /><el-button :icon="Plus" @click="addTag">添加</el-button></div>
          </div>
        </el-form-item>
      </section>
      <el-alert v-if="legacy.sections?.length && !form.contentMarkdown" title="此记录保留旧版章节。填写 Markdown 正文后，前台将优先展示新正文；保存不会删除旧章节或风味内容。" type="info" show-icon :closable="false" />
      <el-form-item prop="contentMarkdown" class="markdown-form-item">
        <MarkdownEditor v-model="form.contentMarkdown" :disabled="saving || publishing" :entity-id="savedId || undefined" @save="handleSave" @uploading-change="uploading = $event">
          <template #preview><FrontendPagePreview type="city" :model="previewModel" mobile-mode /></template>
        </MarkdownEditor>
      </el-form-item>
      <section class="metadata-section" aria-label="关联内容">
        <h3>关联内容</h3>
        <div v-if="optionsError" class="options-error"><span>{{ optionsError }}</span><el-button link @click="loadOptions">重试</el-button></div>
        <div class="metadata-grid">
          <el-form-item label="关联路线">
            <el-select v-model="form.routeSlugs" multiple filterable collapse-tags collapse-tags-tooltip placeholder="选择现有路线">
              <el-option v-for="item in routeOptions" :key="item.slug" :label="`${item.title} (${item.slug})`" :value="item.slug" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联城市">
            <el-select v-model="form.relatedCitySlugs" multiple filterable collapse-tags collapse-tags-tooltip placeholder="选择关联城市">
              <el-option v-for="item in cityOptions.filter(item => item.slug !== form.slug)" :key="item.slug" :label="`${item.name} (${item.slug})`" :value="item.slug" />
            </el-select>
          </el-form-item>
        </div>
      </section>
    </el-form>
    <FrontendPreviewDrawer v-model="mobilePreviewVisible" type="city" :model="previewModel" />
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';
.culture-editor { min-width: 0; }
.publication-status { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; color: var(--lt-text-secondary); font-size: 12px; }
.metadata-section { padding: 24px; background: var(--lt-bg-card); border: 1px solid var(--lt-border-light); border-radius: var(--lt-radius-md); }
.metadata-section h3 { margin: 0 0 20px; font-size: 16px; color: var(--lt-text-primary); }
.metadata-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; }
.metadata-grid > * { min-width: 0; }
.metadata-section :deep(.el-select) { width: 100%; }
.title-field :deep(.el-input__inner) { font-size: 25px; font-weight: 600; min-height: 48px; }
.title-field :deep(.el-input__wrapper) { box-shadow: none; border-bottom: 1px solid var(--lt-border-color); border-radius: 0; padding-inline: 0; }
.title-field :deep(.el-input__wrapper.is-focus) { border-color: var(--lt-primary); }
.tags-field { width: 100%; }
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.tag-input { display: grid; grid-template-columns: minmax(0, 360px) auto; gap: 8px; justify-content: start; }
.markdown-form-item :deep(.el-form-item__content) { display: block; min-width: 0; }
.editor-alert { margin-bottom: 16px; }
.load-error, .options-error { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.options-error { color: var(--lt-text-secondary); font-size: 13px; margin-bottom: 16px; }
@media (max-width: 767px) {
  .metadata-section { padding: 16px; }
  .metadata-grid { grid-template-columns: minmax(0, 1fr); gap: 0; }
  .culture-editor :deep(.el-button) { min-height: 44px; }
  .metadata-section :deep(input), .metadata-section :deep(textarea) { font-size: 16px; }
  .tag-input { grid-template-columns: minmax(0, 1fr) auto; }
}
</style>
