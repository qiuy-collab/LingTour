<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { collectionsApi } from '@/api/collections'
import { routesApi } from '@/api/routes'
import type { CollectionFormData } from '@/types/collection'
import { pickI18n, toI18n } from '@/types/common'
import { extractErrorMessage } from '@/utils/i18n'
import { useDirtyForm } from '@/composables/useDirtyForm'
import EditorPageHeader from '@/components/editor/EditorPageHeader.vue'
import EditorWorkspace from '@/components/editor/EditorWorkspace.vue'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import ImageUpload from '@/components/ImageUpload.vue'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const routeOptions = ref<Array<{ slug: string; title: string }>>([])

const form = reactive<CollectionFormData>({
  slug: '',
  title: { zh: '', en: '' },
  routeName: '',
  routeSlug: '',
  image: '',
  body: { zh: '', en: '' },
  sortOrder: 0,
  published: false,
})

const rules = {
  slug: [
    { required: true, message: 'Enter a slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug must use kebab-case', trigger: 'blur' },
  ],
  'title.en': [{ required: true, message: 'Enter the collection name', trigger: 'blur' }],
}

const { isDirty, resetDirty, disableDirtyCheck } = useDirtyForm({ form })

function applyRouteSelection(slug: string) {
  const selected = routeOptions.value.find((item) => item.slug === slug)
  if (!selected) return
  form.routeSlug = selected.slug
  form.routeName = selected.title
}

onMounted(async () => {
  loading.value = true
  try {
    const routesRes = await routesApi.getRoutes({ page: 1, pageSize: 200 })
    routeOptions.value = (routesRes.data.data.data || []).map((item: any) => ({
      slug: item.slug,
      title: pickI18n(item.title) || item.slug,
    }))

    const id = route.params.id as string
    if (id) {
      isEdit.value = true
      const res = await collectionsApi.getCollection(id)
      const data = res.data.data
      let routeName = data.routeName || ''
      if (typeof routeName === 'string' && routeName.startsWith('{')) {
        try {
          const parsed = JSON.parse(routeName)
          routeName = parsed.zh || parsed.en || routeName
        } catch {
          routeName = data.routeName || ''
        }
      } else if (typeof routeName === 'object' && routeName !== null) {
        routeName = routeName.zh || routeName.en || ''
      }

      Object.assign(form, {
        slug: data.slug,
        title: toI18n(data.title),
        routeName,
        routeSlug: data.routeSlug || '',
        image: data.image || '',
        body: toI18n(data.body),
        sortOrder: data.sortOrder ?? 0,
        published: data.published ?? false,
      })
    }

    resetDirty()
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, 'Failed to load collection'))
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
      await collectionsApi.updateCollection(route.params.id as string, form)
      ElMessage.success('Collection updated')
    } else {
      await collectionsApi.createCollection(form)
      ElMessage.success('Collection created')
    }
    disableDirtyCheck()
    router.push('/admin/shop/collections')
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
      :title="isEdit ? 'Edit Collection' : 'Create Collection'"
      back-to="/admin/shop/collections"
      :saving="saving"
      :dirty="isDirty"
      @save="handleSave"
    />

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <el-card shadow="never" class="section-card">
          <template #header>Basic Information</template>
          <el-form-item label="Slug" prop="slug">
            <el-input v-model="form.slug" placeholder="coastal-life-kit" />
          </el-form-item>
          <el-form-item label="Collection Name" prop="title.en">
            <I18nInput v-model="form.title" />
          </el-form-item>
          <el-form-item label="Cover Image">
            <ImageUpload v-model="form.image" module="shop" />
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>Route & Publishing</template>
          <el-form-item label="Linked Route">
            <el-select
              v-model="form.routeSlug"
              filterable
              clearable
              style="width: 100%"
              @change="applyRouteSelection"
            >
              <el-option
                v-for="item in routeOptions"
                :key="item.slug"
                :label="`${item.title} (${item.slug})`"
                :value="item.slug"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Display Route Name">
            <el-input v-model="form.routeName" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Sort Order">
                <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Publishing Status">
                <el-switch v-model="form.published" active-text="Published" inactive-text="Draft" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <EditorWorkspace
          model-value="body"
          title="Collection Content"
          eyebrow="Collection Content"
          description="Edit the collection description shown on the public site."
          active-label="Collection Copy"
          :tabs="[{ key: 'body', label: 'Collection Copy' }]"
        >
          <div class="workspace-panel">
            <div class="panel-title">Collection Copy</div>
            <el-form-item label="Description">
              <I18nMarkdownEditor v-model="form.body" :rows="8" />
            </el-form-item>
          </div>
        </EditorWorkspace>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';

/* Narrower single-column layout for collection editor */
.editor-shell {
  grid-template-columns: minmax(0, 1fr);
  max-width: 900px;
}

.workspace-panel {
  min-height: 220px;
}
</style>
