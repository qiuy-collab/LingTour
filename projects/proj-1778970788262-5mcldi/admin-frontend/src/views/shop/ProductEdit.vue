<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { productsApi } from '@/api/products'
import { collectionsApi } from '@/api/collections'
import { citiesApi } from '@/api/cities'
import { pickI18n, toI18n } from '@/types/common'
import { optionalI18n, extractErrorMessage } from '@/utils/i18n'
import ImageUpload from '@/components/ImageUpload.vue'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import FrontendPagePreview from '@/components/FrontendPagePreview.vue'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const collectionOptions = ref<{ id: string; title: string }[]>([])
const cityOptions = ref<{ slug: string; name: string; adcode: number }[]>([])
const activeChapter = ref('basic')

const rules = {
  slug: [
    { required: true, message: '请输入 Slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug 必须是 kebab-case', trigger: 'blur' },
  ],
  'name.zh': [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

const emptyOriginTrace = () => ({
  location: '',
  citySlug: '',
  cityName: '',
  materialSource: '',
  craftTradition: '',
  process: '',
  mapAdcode: 0,
})

const form = reactive<any>({
  slug: '',
  name: { zh: '', en: '' },
  collectionId: '',
  price: 0,
  currency: 'SGD',
  tag: { zh: '', en: '' },
  image: '',
  story: { zh: '', en: '' },
  material: { zh: '', en: '' },
  dimensions: { zh: '', en: '' },
  origin: { zh: '', en: '' },
  care: { zh: '', en: '' },
  gallery: [],
  stock: 0,
  published: false,
  originTrace: emptyOriginTrace(),
})

const previewMeta = computed(() => ({
  collectionTitle: collectionOptions.value.find((item) => item.id === form.collectionId)?.title || '',
}))

const chapterTabs = computed(() => [
  { key: 'basic', label: 'Basic' },
  { key: 'commerce', label: 'Price & Stock' },
  { key: 'media', label: 'Media' },
  { key: 'story', label: 'Story' },
  { key: 'details', label: 'Details' },
  { key: 'origin', label: 'Origin Trace' },
  { key: 'publish', label: 'Publish' },
])

async function fetchCollections() {
  const res = await collectionsApi.getCollections({ page: 1, pageSize: 100 })
  collectionOptions.value = (res.data.data.items || []).map((item: any) => ({
    id: item.id,
    title: pickI18n(item.title),
  }))
}

async function fetchCities() {
  const res = await citiesApi.getCities({ page: 1, pageSize: 200 })
  cityOptions.value = (res.data.data.items || []).map((item: any) => ({
    slug: item.slug,
    name: pickI18n(item.name) || item.slug,
    adcode: Number(item.adcode || 0),
  }))
}

function handleOriginCityChange(slug: string) {
  const city = cityOptions.value.find((item) => item.slug === slug)
  if (!city) return
  form.originTrace.citySlug = city.slug
  form.originTrace.cityName = city.name
  form.originTrace.mapAdcode = city.adcode
}

function fillFromApi(data: any) {
  Object.assign(form, {
    slug: data.slug || '',
    name: toI18n(data.name),
    collectionId: data.collectionId || data.collection?.id || '',
    price: Number(data.price || 0),
    currency: data.currency || 'SGD',
    tag: toI18n(data.tag),
    image: data.image || '',
    story: toI18n(data.story),
    material: toI18n(data.material),
    dimensions: toI18n(data.dimensions),
    origin: toI18n(data.origin),
    care: toI18n(data.care),
    gallery: data.gallery || [],
    stock: data.stock ?? 0,
    published: data.published ?? false,
    originTrace: { ...emptyOriginTrace(), ...(data.originTrace || {}) },
  })
}

function toPayload() {
  return {
    slug: form.slug,
    name: form.name,
    collectionId: form.collectionId || undefined,
    price: Number(form.price || 0),
    currency: form.currency,
    tag: form.tag,
    image: form.image,
    story: form.story,
    material: optionalI18n(form.material),
    dimensions: optionalI18n(form.dimensions),
    origin: optionalI18n(form.origin),
    care: optionalI18n(form.care),
    gallery: form.gallery,
    stock: Number(form.stock || 0),
    published: form.published,
    originTrace: form.originTrace,
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([fetchCollections(), fetchCities()])
    const id = route.params.id as string
    if (id) {
      isEdit.value = true
      const res = await productsApi.getProduct(id)
      fillFromApi(res.data.data)
    }
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, '加载商品失败'))
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
      await productsApi.updateProduct(route.params.id as string, toPayload())
      ElMessage.success('商品更新成功')
    } else {
      await productsApi.createProduct(toPayload())
      ElMessage.success('商品创建成功')
    }
    router.push('/admin/shop/products')
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
      <h2>{{ isEdit ? '编辑商品' : '新增商品' }}</h2>
      <div>
        <el-button @click="router.push('/admin/shop/products')">返回</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <el-card shadow="never" class="section-card chapter-workspace">
          <template #header>
            <div class="chapter-toolbar">
              <div class="chapter-intro">
                <div class="chapter-eyebrow">Product Editor</div>
                <div class="chapter-headline">
                  <h3>商品工作台</h3>
                  <span class="chapter-active-pill">
                    {{ chapterTabs.find((chapter) => chapter.key === activeChapter)?.label || 'Basic' }}
                  </span>
                </div>
                <p>把商品信息拆成价格、媒体、故事和溯源几个块，录入时可以更快定位当前任务。</p>
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
            </div>
          </template>

          <div v-if="activeChapter === 'basic'" class="chapter-panel">
            <div class="chapter-title">基础信息</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="Slug" prop="slug">
                  <el-input v-model="form.slug" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属系列">
                  <el-select v-model="form.collectionId" clearable style="width: 100%">
                    <el-option v-for="item in collectionOptions" :key="item.id" :label="item.title" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="商品名称" prop="name.zh">
              <I18nInput v-model="form.name" />
            </el-form-item>
            <el-form-item label="商品标签">
              <I18nInput v-model="form.tag" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'commerce'" class="chapter-panel">
            <div class="chapter-title">价格与库存</div>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="币种">
                  <el-select v-model="form.currency" style="width: 100%">
                    <el-option label="SGD" value="SGD" />
                    <el-option label="USD" value="USD" />
                    <el-option label="CNY" value="CNY" />
                    <el-option label="EUR" value="EUR" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="价格" prop="price">
                  <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="库存">
                  <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div v-else-if="activeChapter === 'media'" class="chapter-panel">
            <div class="chapter-title">图片素材</div>
            <el-form-item label="主图">
              <ImageUpload v-model="form.image" />
            </el-form-item>
            <el-form-item label="详情图库">
              <ImageUpload v-model="form.gallery" multiple :limit="10" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'story'" class="chapter-panel">
            <div class="chapter-title">商品故事</div>
            <el-form-item label="故事正文">
              <I18nMarkdownEditor v-model="form.story" :rows="8" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'details'" class="chapter-panel">
            <div class="chapter-title">商品详情</div>
            <el-form-item label="材质">
              <I18nInput v-model="form.material" />
            </el-form-item>
            <el-form-item label="尺寸">
              <I18nInput v-model="form.dimensions" />
            </el-form-item>
            <el-form-item label="产地">
              <I18nInput v-model="form.origin" />
            </el-form-item>
            <el-form-item label="保养说明">
              <I18nMarkdownEditor v-model="form.care" :rows="5" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'origin'" class="chapter-panel">
            <div class="chapter-title">产地溯源</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="产地位置">
                  <el-input v-model="form.originTrace.location" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="关联城市">
                  <el-select
                    v-model="form.originTrace.citySlug"
                    filterable
                    clearable
                    placeholder="选择已配置城市"
                    style="width: 100%"
                    @change="handleOriginCityChange"
                  >
                    <el-option
                      v-for="city in cityOptions"
                      :key="city.slug"
                      :label="`${city.name} (${city.slug})`"
                      :value="city.slug"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="城市名称">
                  <el-input v-model="form.originTrace.cityName" placeholder="选择后自动带出，也可微调" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="地图代码">
                  <el-input-number v-model="form.originTrace.mapAdcode" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="原料来源">
              <el-input v-model="form.originTrace.materialSource" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="工艺传统">
              <el-input v-model="form.originTrace.craftTradition" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="制作过程">
              <el-input v-model="form.originTrace.process" type="textarea" :rows="3" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'publish'" class="chapter-panel">
            <div class="chapter-title">发布状态</div>
            <el-switch v-model="form.published" active-text="在售" inactive-text="下架" />
          </div>
        </el-card>
      </el-form>

      <FrontendPagePreview type="product" :model="form" :meta="previewMeta" />
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
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
}
.chapter-intro {
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
.chapter-panel { min-height: 320px; }
.chapter-title { margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #303133; }
@media (max-width: 1100px) {
  .editor-shell { grid-template-columns: 1fr; }
}
</style>
