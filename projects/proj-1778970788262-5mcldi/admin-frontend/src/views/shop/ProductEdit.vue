<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productsApi } from '@/api/products'
import { collectionsApi } from '@/api/collections'
import { pickI18n, toI18n } from '@/types/common'
import ImageUpload from '@/components/ImageUpload.vue'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import FrontendPagePreview from '@/components/FrontendPagePreview.vue'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)
const collectionOptions = ref<{ id: string; title: string }[]>([])

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

async function fetchCollections() {
  const res = await collectionsApi.getCollections({ page: 1, pageSize: 100 })
  collectionOptions.value = (res.data.data.items || []).map((item: any) => ({
    id: item.id,
    title: pickI18n(item.title),
  }))
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

function optionalI18n(value: any) {
  return value?.zh || value?.en ? value : undefined
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
    await fetchCollections()
    const id = route.params.id as string
    if (id) {
      isEdit.value = true
      const res = await productsApi.getProduct(id)
      fillFromApi(res.data.data)
    }
  } catch {
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
})

async function handleSave() {
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
    ElMessage.error(error?.response?.data?.message || '保存失败')
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
        <el-button @click="router.push('/admin/shop/products')">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="editor-shell">
      <el-form class="editor-form" label-position="top">
        <el-card id="section-basic" shadow="never" class="section-card">
          <template #header>基础信息</template>
          <el-row :gutter="16">
            <el-col :span="12"><el-form-item label="Slug"><el-input v-model="form.slug" /></el-form-item></el-col>
            <el-col :span="12">
              <el-form-item label="所属系列">
                <el-select v-model="form.collectionId" clearable style="width: 100%">
                  <el-option v-for="item in collectionOptions" :key="item.id" :label="item.title" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="商品名称"><I18nInput v-model="form.name" /></el-form-item>
          <el-form-item label="商品标签"><I18nInput v-model="form.tag" /></el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>价格与库存</template>
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
            <el-col :span="8"><el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" /></el-form-item></el-col>
            <el-col :span="8"><el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" style="width: 100%" /></el-form-item></el-col>
          </el-row>
        </el-card>

        <el-card id="section-images" shadow="never" class="section-card">
          <template #header>图片</template>
          <el-form-item label="主图"><ImageUpload v-model="form.image" /></el-form-item>
          <el-form-item label="详情图库"><ImageUpload v-model="form.gallery" multiple :limit="10" /></el-form-item>
        </el-card>

        <el-card id="section-story" shadow="never" class="section-card">
          <template #header>商品故事</template>
          <el-form-item label="故事"><I18nMarkdownEditor v-model="form.story" :rows="8" /></el-form-item>
        </el-card>

        <el-card id="section-details" shadow="never" class="section-card">
          <template #header>商品详情</template>
          <el-form-item label="材质"><I18nInput v-model="form.material" /></el-form-item>
          <el-form-item label="尺寸"><I18nInput v-model="form.dimensions" /></el-form-item>
          <el-form-item label="产地"><I18nInput v-model="form.origin" /></el-form-item>
          <el-form-item label="保养说明"><I18nMarkdownEditor v-model="form.care" :rows="5" /></el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>产地溯源</template>
          <el-row :gutter="16">
            <el-col :span="12"><el-form-item label="产地位置"><el-input v-model="form.originTrace.location" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="城市名称"><el-input v-model="form.originTrace.cityName" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="城市 Slug"><el-input v-model="form.originTrace.citySlug" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="地图代码"><el-input-number v-model="form.originTrace.mapAdcode" :min="0" style="width: 100%" /></el-form-item></el-col>
          </el-row>
          <el-form-item label="原料来源"><el-input v-model="form.originTrace.materialSource" type="textarea" :rows="3" /></el-form-item>
          <el-form-item label="工艺传统"><el-input v-model="form.originTrace.craftTradition" type="textarea" :rows="3" /></el-form-item>
          <el-form-item label="制作过程"><el-input v-model="form.originTrace.process" type="textarea" :rows="3" /></el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>发布设置</template>
          <el-switch v-model="form.published" active-text="在售" inactive-text="下架" />
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
.editor-shell { display: grid; grid-template-columns: minmax(0, 1fr) 390px; gap: 20px; align-items: start; }
.section-card { margin-bottom: 16px; }
@media (max-width: 1100px) { .editor-shell { grid-template-columns: 1fr; } }
</style>
