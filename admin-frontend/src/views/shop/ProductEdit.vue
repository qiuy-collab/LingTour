<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { citiesApi } from '@/api/cities'
import { collectionsApi } from '@/api/collections'
import { productsApi } from '@/api/products'
import { pickI18n, toI18n } from '@/types/common'
import { extractErrorMessage, optionalI18n } from '@/utils/i18n'
import { useDirtyForm } from '@/composables/useDirtyForm'
import EditorPageHeader from '@/components/editor/EditorPageHeader.vue'
import EditorWorkspace, { type EditorWorkspaceTab } from '@/components/editor/EditorWorkspace.vue'
import FrontendPagePreview from '@/components/FrontendPagePreview.vue'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import ImageUpload from '@/components/ImageUpload.vue'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const activeWorkspace = ref('story')
const collectionOptions = ref<{ id: string; title: string }[]>([])
const cityOptions = ref<{ slug: string; name: string; adcode: number }[]>([])

const rules = {
  slug: [
    { required: true, message: 'Enter a slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug must use kebab-case', trigger: 'blur' },
  ],
  'name.en': [{ required: true, message: 'Enter the product name', trigger: 'blur' }],
  price: [{ required: true, message: 'Enter a price', trigger: 'blur' }],
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

const { isDirty, resetDirty, disableDirtyCheck } = useDirtyForm({ form })

const previewMeta = computed(() => ({
  collectionTitle: collectionOptions.value.find((item) => item.id === form.collectionId)?.title || '',
}))

const workspaceTabs = computed<EditorWorkspaceTab[]>(() => [
  { key: 'story', label: 'Product Story' },
  { key: 'details', label: 'Product Details' },
])

const activeWorkspaceLabel = computed(() => {
  return workspaceTabs.value.find((item) => item.key === activeWorkspace.value)?.label || 'Product Story'
})

async function fetchCollections() {
  const res = await collectionsApi.getCollections({ page: 1, pageSize: 100 })
  collectionOptions.value = (res.data.data.data || []).map((item: any) => ({
    id: item.id,
    title: pickI18n(item.title),
  }))
}

async function fetchCities() {
  const res = await citiesApi.getCities({ page: 1, pageSize: 200 })
  cityOptions.value = (res.data.data.data || []).map((item: any) => ({
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
      const res = await productsApi.getProduct(id)
      fillFromApi(res.data.data)
    }
    resetDirty()
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, 'Failed to load product'))
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

  saving.value = true
  try {
    if (isEdit.value) {
      await productsApi.updateProduct(route.params.id as string, toPayload())
      ElMessage.success('Product updated')
    } else {
      await productsApi.createProduct(toPayload())
      ElMessage.success('Product created')
    }
    disableDirtyCheck()
    router.push('/admin/shop/products')
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
      :title="isEdit ? 'Edit Product' : 'Create Product'"
      back-to="/admin/shop/products"
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
              <el-form-item label="Collection">
                <el-select v-model="form.collectionId" clearable style="width: 100%">
                  <el-option v-for="item in collectionOptions" :key="item.id" :label="item.title" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="Product Name" prop="name.en">
            <I18nInput v-model="form.name" />
          </el-form-item>
          <el-form-item label="Product Tag">
            <I18nInput v-model="form.tag" />
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>Price, Stock & Publishing</template>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="Currency">
                <el-select v-model="form.currency" style="width: 100%">
                  <el-option label="SGD" value="SGD" />
                  <el-option label="USD" value="USD" />
                  <el-option label="CNY" value="CNY" />
                  <el-option label="EUR" value="EUR" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Price" prop="price">
                <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Stock">
                <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="Publishing Status">
            <el-switch v-model="form.published" active-text="Published" inactive-text="Draft" />
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>Images</template>
          <el-form-item label="Primary Image">
            <ImageUpload v-model="form.image" module="shop" />
          </el-form-item>
          <el-form-item label="Product Gallery">
            <ImageUpload v-model="form.gallery" module="shop" mode="multiple" :limit="10" />
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>Provenance & Origin</template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Origin Location">
                <el-input v-model="form.originTrace.location" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Linked City">
                <el-select
                  v-model="form.originTrace.citySlug"
                  filterable
                  clearable
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
              <el-form-item label="Origin City Name">
                <el-input v-model="form.originTrace.cityName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Map Adcode">
                <el-input-number v-model="form.originTrace.mapAdcode" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="Material Source">
            <el-input v-model="form.originTrace.materialSource" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="Craft Tradition">
            <el-input v-model="form.originTrace.craftTradition" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="Production Process">
            <el-input v-model="form.originTrace.process" type="textarea" :rows="3" />
          </el-form-item>
        </el-card>

        <EditorWorkspace
          v-model="activeWorkspace"
          eyebrow="Product Story Workspace"
          title="Product Content"
          description="Edit the product story, material, dimensions, origin, and care instructions."
          :active-label="activeWorkspaceLabel"
          :tabs="workspaceTabs"
        >
          <div v-if="activeWorkspace === 'story'" class="workspace-panel">
            <div class="panel-title">Product Story</div>
            <el-form-item label="Story">
              <I18nMarkdownEditor v-model="form.story" :rows="8" />
            </el-form-item>
          </div>

          <div v-else class="workspace-panel">
            <div class="panel-title">Product Details</div>
            <el-form-item label="Material">
              <I18nInput v-model="form.material" />
            </el-form-item>
            <el-form-item label="Dimensions">
              <I18nInput v-model="form.dimensions" />
            </el-form-item>
            <el-form-item label="Origin Notes">
              <I18nInput v-model="form.origin" />
            </el-form-item>
            <el-form-item label="Care Instructions">
              <I18nMarkdownEditor v-model="form.care" :rows="6" />
            </el-form-item>
          </div>
        </EditorWorkspace>
      </el-form>

      <FrontendPagePreview type="product" :model="form" :meta="previewMeta" />
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';
</style>
