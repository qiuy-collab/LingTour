<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { ArrowDown, ArrowUp, Delete, Plus } from '@element-plus/icons-vue'
import { routesApi } from '@/api/routes'
import { citiesApi } from '@/api/cities'
import { toI18n, toI18nArray, pickI18n } from '@/types/common'
import { optionalI18n, extractErrorMessage } from '@/utils/i18n'
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
const activeChapter = ref('basic')

const rules = {
  slug: [
    { required: true, message: '请输入 Slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug 必须是 kebab-case', trigger: 'blur' },
  ],
  'title.zh': [{ required: true, message: '请输入路线标题', trigger: 'blur' }],
}

const cultureOptions = [
  { value: 'Guangfu', label: '广府' },
  { value: 'Chaoshan', label: '潮汕' },
  { value: 'Hakka', label: '客家' },
  { value: 'Coastal', label: '滨海' },
  { value: 'BayArea', label: '湾区' },
  { value: 'Mountain', label: '山地' },
]

const form = reactive<any>({
  slug: '',
  title: { zh: '', en: '' },
  cultureTag: 'Guangfu',
  cityName: { zh: '', en: '' },
  citySlugs: [],
  duration: { zh: '', en: '' },
  audience: { zh: '', en: '' },
  summary: { zh: '', en: '' },
  story: { zh: '', en: '' },
  coverImage: '',
  stops: [],
  published: false,
})

const cityOptions = ref<Array<{ slug: string; name: string; nameZh: string; nameEn: string }>>([])

function createStop() {
  return {
    id: `stop-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    sortOrder: form.stops.length,
    time: '',
    stopName: { zh: '', en: '' },
    story: { zh: '', en: '' },
    culturalStory: { zh: '', en: '' },
    details: [],
    image: '',
    lat: 0,
    lng: 0,
    meal: { zh: '', en: '' },
    hotel: { zh: '', en: '' },
    transit: { zh: '', en: '' },
  }
}

function addStop() {
  form.stops.push(createStop())
  activeChapter.value = `stop-${form.stops.length - 1}`
}

function removeStop(index: number) {
  form.stops.splice(index, 1)
  reindexStops()
  if (form.stops.length === 0) {
    activeChapter.value = 'basic'
    return
  }
  activeChapter.value = `stop-${Math.min(index, form.stops.length - 1)}`
}

function moveStop(index: number, delta: -1 | 1) {
  const target = index + delta
  if (target < 0 || target >= form.stops.length) return
  ;[form.stops[index], form.stops[target]] = [form.stops[target], form.stops[index]]
  reindexStops()
}

function moveActiveStop(delta: -1 | 1) {
  if (activeStopIndex.value < 0) return
  const currentIndex = activeStopIndex.value
  moveStop(currentIndex, delta)
  const targetIndex = currentIndex + delta
  if (targetIndex >= 0 && targetIndex < form.stops.length) {
    activeChapter.value = `stop-${targetIndex}`
  }
}

function reindexStops() {
  form.stops.forEach((stop: any, index: number) => {
    stop.sortOrder = index
  })
}

function addDetail(stop: any) {
  stop.details.push({ zh: '', en: '' })
}

function removeDetail(stop: any, index: number) {
  stop.details.splice(index, 1)
}

const chapterTabs = computed(() => [
  { key: 'basic', label: 'Basic' },
  { key: 'hero', label: 'Hero' },
  ...form.stops.map((stop: any, index: number) => ({
    key: `stop-${index}`,
    label: pickI18n(stop.stopName) || `Stop ${index + 1}`,
    badge: `#${index + 1}`,
  })),
  { key: 'publish', label: 'Publish' },
])

const activeStopIndex = computed(() => {
  const match = /^stop-(\d+)$/.exec(activeChapter.value)
  return match ? Number(match[1]) : -1
})

const activeStop = computed(() =>
  activeStopIndex.value >= 0 ? form.stops[activeStopIndex.value] : null,
)

const isStopChapter = computed(() => activeStopIndex.value >= 0)

const selectedCityCards = computed(() =>
  form.citySlugs
    .map((slug: string) => cityOptions.value.find((item) => item.slug === slug))
    .filter(Boolean),
)

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
    cultureTag: data.cultureTag || 'Guangfu',
    cityName: toI18n(data.cityName),
    citySlugs: Array.isArray(data.citySlugs) ? data.citySlugs : [],
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
      lat: stop.lat ?? 0,
      lng: stop.lng ?? 0,
      meal: toI18n(stop.meal),
      hotel: toI18n(stop.hotel),
      transit: toI18n(stop.transit),
    })),
  })
}

function toPayload() {
  return {
    slug: form.slug,
    title: form.title,
    cultureTag: form.cultureTag,
    cityName: form.cityName,
    citySlugs: form.citySlugs,
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
      story: stop.story,
      culturalStory: stop.culturalStory,
      details: stop.details.filter((detail: any) => detail.zh || detail.en),
      image: stop.image,
      lat: Number(stop.lat || 0),
      lng: Number(stop.lng || 0),
      meal: optionalI18n(stop.meal),
      hotel: optionalI18n(stop.hotel),
      transit: optionalI18n(stop.transit),
    })),
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const cityRes = await citiesApi.getCities({ page: 1, pageSize: 200 })
    cityOptions.value = (cityRes.data.data.items || []).map((item: any) => ({
      slug: item.slug,
      name: pickI18n(item.name),
      nameZh: item.name?.zh || '',
      nameEn: item.name?.en || '',
    }))

    if (isEdit.value) {
      const res = await routesApi.getRoute(route.params.id as string)
      fillFromApi(res.data.data)
    }
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, '加载路线数据失败'))
    router.push('/admin/routes')
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

  if (form.stops.length === 0) {
    ElMessage.error('请至少添加一个站点')
    return
  }

  for (let index = 0; index < form.stops.length; index += 1) {
    const stop = form.stops[index]
    const lat = Number(stop.lat || 0)
    const lng = Number(stop.lng || 0)
    if (lat < -90 || lat > 90) {
      ElMessage.error(`第 ${index + 1} 个站点纬度需在 -90 到 90 之间`)
      return
    }
    if (lng < -180 || lng > 180) {
      ElMessage.error(`第 ${index + 1} 个站点经度需在 -180 到 180 之间`)
      return
    }
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await routesApi.updateRoute(route.params.id as string, toPayload())
      ElMessage.success('路线更新成功')
    } else {
      await routesApi.createRoute(toPayload())
      ElMessage.success('路线创建成功')
    }
    router.push('/admin/routes')
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, '保存失败'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="edit-page" v-loading="loading">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑路线' : '新增路线' }}</h2>
      <div>
        <el-button @click="router.push('/admin/routes')">返回</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <el-card shadow="never" class="section-card chapter-workspace">
          <template #header>
            <div class="chapter-toolbar">
              <div class="chapter-intro">
                <div class="chapter-eyebrow">Route Builder</div>
                <div class="chapter-headline">
                  <h3>路线工作台</h3>
                  <span class="chapter-active-pill">
                    {{ chapterTabs.find((chapter) => chapter.key === activeChapter)?.label || 'Basic' }}
                  </span>
                </div>
                <p>先选当前章节，再集中维护路线头图、站点和发布状态，站点操作统一放在右侧工具区。</p>
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
                <el-button size="small" type="primary" :icon="Plus" @click="addStop">新增站点</el-button>
                <el-button
                  size="small"
                  :icon="ArrowUp"
                  :disabled="!isStopChapter || activeStopIndex === 0"
                  @click="moveActiveStop(-1)"
                >
                  上移
                </el-button>
                <el-button
                  size="small"
                  :icon="ArrowDown"
                  :disabled="!isStopChapter || activeStopIndex === form.stops.length - 1"
                  @click="moveActiveStop(1)"
                >
                  下移
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  :disabled="!isStopChapter"
                  @click="removeStop(activeStopIndex)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="activeChapter === 'basic'" class="chapter-panel">
            <div class="chapter-title">基础信息</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Slug" prop="slug">
                  <el-input v-model="form.slug" placeholder="lingnan-coastal-route" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="文化标签">
                  <el-select v-model="form.cultureTag" style="width: 100%">
                    <el-option v-for="item in cultureOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="路线标题" prop="title.zh">
              <I18nInput v-model="form.title" />
            </el-form-item>
            <el-form-item label="关联城市">
              <el-select
                v-model="form.citySlugs"
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                placeholder="选择路线经过或关联的城市"
                style="width: 100%"
              >
                <el-option
                  v-for="city in cityOptions"
                  :key="city.slug"
                  :label="`${city.name} (${city.slug})`"
                  :value="city.slug"
                />
              </el-select>
              <div class="field-actions">
                <span class="field-hint">前台会基于这些城市做路线关联和联动展示。</span>
                <el-button link type="primary" @click="applySelectedCitiesToDisplayName">生成展示城市名</el-button>
              </div>
            </el-form-item>
            <div v-if="selectedCityCards.length" class="selected-grid">
              <div v-for="city in selectedCityCards" :key="city.slug" class="selected-card">
                <strong>{{ city.nameZh || city.name }}</strong>
                <span>{{ city.nameEn || city.slug }}</span>
              </div>
            </div>
            <el-form-item label="前台显示城市名">
              <I18nInput v-model="form.cityName" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'hero'" class="chapter-panel">
            <div class="chapter-title">顶部展示</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="时长">
                  <I18nInput v-model="form.duration" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="适合人群">
                  <I18nInput v-model="form.audience" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="路线封面">
              <ImageUpload v-model="form.coverImage" />
            </el-form-item>
            <el-form-item label="路线摘要">
              <I18nInput v-model="form.summary" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="路线总述">
              <I18nMarkdownEditor v-model="form.story" :rows="8" />
            </el-form-item>
          </div>

          <div v-else-if="isStopChapter && activeStop" class="chapter-panel">
            <div class="chapter-title">{{ pickI18n(activeStop.stopName) || `站点 ${activeStopIndex + 1}` }}</div>
            <el-row :gutter="12">
              <el-col :span="8">
                <el-form-item label="时间">
                  <el-input v-model="activeStop.time" placeholder="08:30" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="纬度">
                  <el-input-number v-model="activeStop.lat" :min="-90" :max="90" :precision="6" :step="0.0001" style="width: 100%" />
                  <div class="form-hint-text">范围 -90 ~ 90</div>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="经度">
                  <el-input-number v-model="activeStop.lng" :min="-180" :max="180" :precision="6" :step="0.0001" style="width: 100%" />
                  <div class="form-hint-text">范围 -180 ~ 180</div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="站点名称">
              <I18nInput v-model="activeStop.stopName" />
            </el-form-item>
            <el-form-item label="站点故事">
              <I18nMarkdownEditor v-model="activeStop.story" :rows="5" />
            </el-form-item>
            <el-form-item label="文化解读">
              <I18nMarkdownEditor v-model="activeStop.culturalStory" :rows="5" />
            </el-form-item>
            <el-form-item label="站点图片">
              <ImageUpload v-model="activeStop.image" />
            </el-form-item>
            <el-form-item label="站点要点">
              <div class="detail-list">
                <div v-for="(_, detailIndex) in activeStop.details" :key="detailIndex" class="detail-row">
                  <I18nInput v-model="activeStop.details[detailIndex]" />
                  <el-button type="danger" text :icon="Delete" @click="removeDetail(activeStop, Number(detailIndex))" />
                </div>
                <el-button size="small" :icon="Plus" @click="addDetail(activeStop)">添加要点</el-button>
              </div>
            </el-form-item>
            <el-row :gutter="12">
              <el-col :span="8">
                <el-form-item label="餐食安排">
                  <I18nInput v-model="activeStop.meal" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="住宿安排">
                  <I18nInput v-model="activeStop.hotel" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="交通方式">
                  <I18nInput v-model="activeStop.transit" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div v-else-if="activeChapter === 'publish'" class="chapter-panel">
            <div class="chapter-title">发布设置</div>
            <el-form-item label="发布状态">
              <el-switch v-model="form.published" active-text="已发布" inactive-text="草稿" />
            </el-form-item>
          </div>
        </el-card>
      </el-form>

      <FrontendPagePreview type="route" :model="form" />
    </div>
  </div>
</template>

<style scoped>
.edit-page { padding-bottom: 40px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.page-header h2 { margin: 0; font-size: 20px; }
.editor-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(620px, 46vw); gap: 20px; align-items: start; }
.section-card { margin-bottom: 16px; }
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
.chapter-title { margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #303133; }
.field-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; }
.field-hint { color: #909399; font-size: 12px; line-height: 1.5; }
.selected-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; margin-bottom: 12px; }
.selected-card { border: 1px solid #dcdfe6; border-radius: 10px; padding: 12px; background: #f8fbff; }
.selected-card strong { display: block; color: #303133; }
.selected-card span { display: block; margin-top: 4px; color: #909399; font-size: 12px; }
.detail-list { width: 100%; display: grid; gap: 10px; }
.detail-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: start; }
.form-hint-text { font-size: 11px; color: #909399; margin-top: 2px; }
@media (max-width: 1100px) {
  .editor-shell { grid-template-columns: 1fr; }
  .chapter-toolbar { grid-template-columns: 1fr; }
  .chapter-actions { justify-content: flex-start; }
}
</style>
