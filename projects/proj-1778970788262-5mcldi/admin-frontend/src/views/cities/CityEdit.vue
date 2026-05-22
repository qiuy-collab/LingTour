<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { ArrowDown, ArrowUp, Delete, Plus } from '@element-plus/icons-vue'
import { citiesApi } from '@/api/cities'
import { toI18n } from '@/types/common'
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
const cityOptions = ref<Array<{ id: string; slug: string; name: string }>>([])
const originalSectionsSnapshot = ref('')

const rules = {
  slug: [
    { required: true, message: '请输入 Slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug 必须为 kebab-case 格式（如 guang-zhou）', trigger: 'blur' },
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

function serializeSections(sections: any[]) {
  return JSON.stringify(
    sections.map((section: any, index: number) => ({
      title: normalizeI18nValue(section.title),
      body: normalizeI18nValue(section.body),
      image: section.image || '',
      statLabel: normalizeI18nValue(section.statLabel),
      statValue: normalizeI18nValue(section.statValue),
      breathImage: section.breathImage || '',
      breathQuote: normalizeI18nValue(section.breathQuote),
      sortOrder: section.sortOrder ?? index,
    })),
  )
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
}

function removeSection(index: number) {
  form.sections.splice(index, 1)
  reindexSections()
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

async function loadCityOptions() {
  const res = await citiesApi.getCities({ page: 1, pageSize: 200 })
  cityOptions.value = (res.data.data.items || []).map((item: any) => ({
    id: item.id,
    slug: item.slug,
    name: item.name?.zh || item.name?.en || item.slug,
  }))
}

function fillFromApi(data: any) {
  const normalizedSections = (data.sections || []).map((section: any, index: number) =>
    normalizeSection(section, index),
  )
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
    sections: normalizedSections,
    status: data.published ? 'published' : 'draft',
    routeSlugs: data.routeSlugs || data.routes?.map((item: any) => item.slug) || [],
    relatedCitySlugs: data.relatedCitySlugs || [],
  })
  originalSectionsSnapshot.value = serializeSections(normalizedSections)
}

function toPayload(options?: { includeSections?: boolean }) {
  const payload: Partial<CityFormData> = {
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
  }
  if (options?.includeSections) {
    payload.sections = form.sections.map((section: any, index: number) => ({
      title: normalizeI18nValue(section.title),
      body: normalizeI18nValue(section.body),
      image: section.image || '',
      statLabel: normalizeI18nValue(section.statLabel),
      statValue: normalizeI18nValue(section.statValue),
      breathImage: section.breathImage || '',
      breathQuote: normalizeI18nValue(section.breathQuote),
      sortOrder: index,
    }))
  }
  return payload
}

onMounted(async () => {
  loading.value = true
  try {
    await loadCityOptions()
    if (isEdit.value) {
      const res = await citiesApi.getCity(route.params.id as string)
      fillFromApi(res.data.data)
    }
  } catch {
    ElMessage.error('加载城市数据失败')
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
    const sectionsChanged =
      isEdit.value && serializeSections(form.sections) !== originalSectionsSnapshot.value
    if (isEdit.value) {
      if (sectionsChanged) {
        ElMessage.error('当前后端暂不支持保存城市 Section 变更，请先保存其他字段')
        return
      }
      await citiesApi.updateCity(route.params.id as string, toPayload({ includeSections: false }))
      ElMessage.success('城市更新成功')
    } else {
      await citiesApi.createCity(toPayload({ includeSections: true }) as CityFormData)
      ElMessage.success('城市创建成功')
    }
    router.push('/admin/cities')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const availableRelatedCities = computed(() =>
  cityOptions.value.filter((item) => item.slug !== form.slug),
)

const selectedRelatedCityCards = computed(() =>
  form.relatedCitySlugs
    .map((slug: string) => availableRelatedCities.value.find((item) => item.slug === slug))
    .filter(Boolean),
)
</script>

<template>
  <div class="edit-page" v-loading="loading">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑城市' : '新增城市' }}</h2>
      <div>
        <el-button @click="router.push('/admin/cities')">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <el-card id="section-basic" shadow="never" class="section-card">
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

        <el-card id="section-overview" shadow="never" class="section-card">
          <template #header>1. Overview（图文）</template>
          <el-form-item label="Overview 主图">
            <ImageUpload v-model="form.heroImage" />
          </el-form-item>
          <el-form-item label="Overview 文案">
            <I18nMarkdownEditor v-model="form.heroNarrative" :rows="6" />
          </el-form-item>
        </el-card>

        <el-card id="section-intro" shadow="never" class="section-card">
          <template #header>2. Intro（图文）</template>
          <el-form-item label="Intro 正文">
            <I18nMarkdownEditor v-model="form.editorIntro" :rows="8" />
          </el-form-item>
          <el-form-item label="Intro 图片组">
            <ImageUpload v-model="form.galleryImages" multiple :limit="12" />
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-header">
              <span>3. Section（可变数组）</span>
              <el-button size="small" type="primary" :icon="Plus" @click="addSection">添加 Section</el-button>
            </div>
          </template>
          <div v-for="(section, index) in form.sections" :id="`city-section-${index}`" :key="section.id" class="repeat-item">
            <div class="repeat-header">
              <strong>Section {{ Number(index) + 1 }}</strong>
              <div>
                <el-button text :icon="ArrowUp" :disabled="Number(index) === 0" @click="moveSection(Number(index), -1)" />
                <el-button text :icon="ArrowDown" :disabled="Number(index) === form.sections.length - 1" @click="moveSection(Number(index), 1)" />
                <el-button text type="danger" :icon="Delete" @click="removeSection(Number(index))" />
              </div>
            </div>

            <el-form-item label="Section 图片">
              <ImageUpload v-model="section.image" />
            </el-form-item>
            <el-form-item label="Section 标题">
              <I18nInput v-model="section.title" />
            </el-form-item>
            <el-form-item label="Section 正文（按 Markdown 渲染）">
              <I18nMarkdownEditor v-model="section.body" :rows="8" />
            </el-form-item>
            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="段尾固定小字标题">
                  <I18nInput v-model="section.statLabel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="段尾固定小字内容">
                  <I18nInput v-model="section.statValue" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="Section 间隔图">
              <ImageUpload v-model="section.breathImage" />
            </el-form-item>
            <el-form-item label="Section 间隔引语">
              <I18nInput v-model="section.breathQuote" type="textarea" :rows="3" />
            </el-form-item>
          </div>
          <el-empty v-if="form.sections.length === 0" description="暂无 Section" :image-size="60" />
        </el-card>

        <el-card id="section-food" shadow="never" class="section-card">
          <template #header>4. Food（图文）</template>
          <el-form-item label="Food 标题">
            <I18nInput v-model="form.foodTitle" />
          </el-form-item>
          <el-form-item label="Food 正文">
            <I18nMarkdownEditor v-model="form.foodDescription" :rows="6" />
          </el-form-item>
          <el-form-item label="Food 图片组">
            <ImageUpload v-model="form.foodImages" multiple :limit="10" />
          </el-form-item>
        </el-card>

        <el-card id="section-related-cities" shadow="never" class="section-card">
          <template #header>5. 经过的城市</template>
          <el-form-item label="选择现有城市">
            <el-select
              v-model="form.relatedCitySlugs"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              placeholder="直接选择已有城市"
              style="width: 100%"
            >
              <el-option
                v-for="city in availableRelatedCities"
                :key="city.id"
                :label="`${city.name} (${city.slug})`"
                :value="city.slug"
              />
            </el-select>
            <p class="field-hint">选中的城市会在前台真实预览里显示为联动卡片，并在地图上高亮。</p>
          </el-form-item>
          <div v-if="selectedRelatedCityCards.length" class="selected-city-grid">
            <div v-for="city in selectedRelatedCityCards" :key="city.slug" class="selected-city-card">
              <strong>{{ city.name }}</strong>
              <span>{{ city.slug }}</span>
            </div>
          </div>
          <el-empty v-else description="还没有选择经过的城市" :image-size="56" />
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>发布状态</template>
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio value="draft">草稿</el-radio>
              <el-radio value="published">已发布</el-radio>
            </el-radio-group>
          </el-form-item>
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
.card-header, .repeat-header, .inline-row, .tag-list { display: flex; align-items: center; gap: 8px; }
.card-header, .repeat-header { justify-content: space-between; }
.inline-row { width: 100%; }
.inline-row .el-input { max-width: 260px; }
.tag-list { flex-wrap: wrap; min-height: 28px; margin-bottom: 8px; }
.repeat-item { padding: 14px; margin-bottom: 14px; border: 1px solid #ebeef5; border-radius: 8px; background: #fafbfc; }
.field-hint { margin: 8px 0 0; color: #909399; font-size: 12px; line-height: 1.5; }
.selected-city-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
.selected-city-card { border: 1px solid #dcdfe6; border-radius: 8px; padding: 12px; background: #f8fbff; }
.selected-city-card strong { display: block; color: #303133; }
.selected-city-card span { display: block; margin-top: 4px; color: #909399; font-size: 12px; }
@media (max-width: 1100px) { .editor-shell { grid-template-columns: 1fr; } }
</style>
