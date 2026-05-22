<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { ArrowDown, ArrowUp, Delete, Plus } from '@element-plus/icons-vue'
import { routesApi } from '@/api/routes'
import { citiesApi } from '@/api/cities'
import { toI18n, toI18nArray, pickI18n } from '@/types/common'
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

const selectedCityCards = computed(() =>
  form.citySlugs
    .map((slug: string) => cityOptions.value.find((item) => item.slug === slug))
    .filter(Boolean),
)

const stopOutline = computed(() =>
  form.stops.map((stop: any, index: number) => ({
    index,
    name: pickI18n(stop.stopName) || `站点 ${index + 1}`,
    time: stop.time || '未设时间',
    details: Array.isArray(stop.details) ? stop.details.filter((item: any) => item?.zh || item?.en).length : 0,
  })),
)

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
}

function removeStop(index: number) {
  form.stops.splice(index, 1)
  reindexStops()
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

function addDetail(stop: any) {
  stop.details.push({ zh: '', en: '' })
}

function removeDetail(stop: any, index: number) {
  stop.details.splice(index, 1)
}

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

function optionalI18n(value: any) {
  return value?.zh || value?.en ? value : undefined
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
  } catch {
    ElMessage.error('加载路线数据失败')
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
    ElMessage.error(error?.response?.data?.message || '保存失败')
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
        <el-button @click="router.push('/admin/routes')">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <el-card shadow="never" class="section-card">
          <template #header>1. 基本信息</template>
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
              <el-button link type="primary" @click="applySelectedCitiesToDisplayName">用关联城市生成展示名</el-button>
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
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>2. 顶部展示信息</template>
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
          <el-form-item label="发布状态">
            <el-switch v-model="form.published" active-text="已发布" inactive-text="草稿" />
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-header">
              <span>3. 行程站点</span>
              <el-button size="small" type="primary" :icon="Plus" @click="addStop">添加站点</el-button>
            </div>
          </template>

          <div v-if="stopOutline.length" class="outline-list">
            <div v-for="item in stopOutline" :key="item.index" class="outline-card">
              <strong>{{ item.name }}</strong>
              <span>{{ item.time }}</span>
              <em>{{ item.details }} 个要点</em>
            </div>
          </div>

          <div v-for="(stop, index) in form.stops" :id="`route-stop-${index}`" :key="stop.id" class="repeat-item">
            <div class="repeat-header">
              <div>
                <strong>{{ pickI18n(stop.stopName) || `站点 ${Number(index) + 1}` }}</strong>
                <p>{{ stop.time || '未设置时间' }}</p>
              </div>
              <div>
                <el-button text :icon="ArrowUp" :disabled="Number(index) === 0" @click="moveStop(Number(index), -1)" />
                <el-button text :icon="ArrowDown" :disabled="Number(index) === form.stops.length - 1" @click="moveStop(Number(index), 1)" />
                <el-button text type="danger" :icon="Delete" @click="removeStop(Number(index))" />
              </div>
            </div>

            <el-row :gutter="12">
              <el-col :span="8">
                <el-form-item label="时间">
                  <el-input v-model="stop.time" placeholder="08:30" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="纬度">
                  <el-input-number v-model="stop.lat" :precision="6" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="经度">
                  <el-input-number v-model="stop.lng" :precision="6" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="站点名称">
              <I18nInput v-model="stop.stopName" />
            </el-form-item>
            <el-form-item label="站点故事">
              <I18nMarkdownEditor v-model="stop.story" :rows="5" />
            </el-form-item>
            <el-form-item label="文化解读">
              <I18nMarkdownEditor v-model="stop.culturalStory" :rows="5" />
            </el-form-item>
            <el-form-item label="站点图片">
              <ImageUpload v-model="stop.image" />
            </el-form-item>

            <el-form-item label="站点要点">
              <div class="detail-list">
                <div v-for="(_, detailIndex) in stop.details" :key="detailIndex" class="detail-row">
                  <I18nInput v-model="stop.details[detailIndex]" />
                  <el-button type="danger" text :icon="Delete" @click="removeDetail(stop, Number(detailIndex))" />
                </div>
                <el-button size="small" :icon="Plus" @click="addDetail(stop)">添加要点</el-button>
              </div>
            </el-form-item>

            <el-row :gutter="12">
              <el-col :span="8">
                <el-form-item label="餐食安排">
                  <I18nInput v-model="stop.meal" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="住宿安排">
                  <I18nInput v-model="stop.hotel" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="交通方式">
                  <I18nInput v-model="stop.transit" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <el-empty v-if="form.stops.length === 0" description="还没有站点，先添加第一站" :image-size="60" />
        </el-card>
      </el-form>

      <FrontendPagePreview type="route" :model="form" />
    </div>
  </div>
</template>

<style scoped>
.edit-page {
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.editor-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(620px, 46vw);
  gap: 20px;
  align-items: start;
}

.section-card {
  margin-bottom: 16px;
}

.card-header,
.repeat-header,
.field-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header,
.repeat-header,
.field-actions {
  justify-content: space-between;
}

.field-hint {
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}

.selected-grid,
.outline-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.selected-card,
.outline-card {
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  padding: 12px;
  background: #f8fbff;
}

.selected-card strong,
.outline-card strong {
  display: block;
  color: #303133;
}

.selected-card span,
.outline-card span,
.outline-card em {
  display: block;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  font-style: normal;
}

.repeat-item {
  padding: 14px;
  margin-bottom: 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafbfc;
}

.repeat-header p {
  margin: 4px 0 0;
  color: #909399;
  font-size: 12px;
}

.detail-list {
  width: 100%;
  display: grid;
  gap: 10px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: start;
}

@media (max-width: 1100px) {
  .editor-shell {
    grid-template-columns: 1fr;
  }
}
</style>
