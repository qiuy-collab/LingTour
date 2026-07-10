<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { modesApi } from '@/api/modes'
import type { ServiceModeFormData } from '@/types/interpreting'
import { toI18n } from '@/types/common'
import { extractErrorMessage } from '@/utils/i18n'
import { useDirtyForm } from '@/composables/useDirtyForm'
import EditorPageHeader from '@/components/editor/EditorPageHeader.vue'
import EditorWorkspace from '@/components/editor/EditorWorkspace.vue'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)
const activePanel = ref<'body' | 'includes'>('body')
const formRef = ref<FormInstance>()

const form = reactive<ServiceModeFormData>({
  sortOrder: 1,
  title: { zh: '', en: '' },
  price: { zh: '', en: '' },
  bestFor: { zh: '', en: '' },
  body: { zh: '', en: '' },
  includes: [],
  accent: 'light',
  featured: false,
})

const newIncludeEn = ref('')

const rules = {
  'title.en': [{ required: true, message: 'Enter the service mode name', trigger: 'blur' }],
  'price.en': [{ required: true, message: 'Enter the price label', trigger: 'blur' }],
}

const { isDirty, resetDirty, disableDirtyCheck } = useDirtyForm({ form })

function addInclude() {
  const en = newIncludeEn.value.trim()
  if (!en) return

  form.includes.push({ zh: '', en })
  newIncludeEn.value = ''
}

function removeInclude(index: number) {
  form.includes.splice(index, 1)
}

onMounted(async () => {
  const id = route.params.id as string
  if (!id) {
    resetDirty()
    return
  }

  isEdit.value = true
  loading.value = true
  try {
    const res = await modesApi.getMode(id)
    const data = res.data.data
    Object.assign(form, {
      sortOrder: data.sortOrder ?? 1,
      title: toI18n(data.title),
      price: toI18n(data.price),
      bestFor: toI18n(data.bestFor),
      body: toI18n(data.body),
      includes: Array.isArray(data.includes) ? data.includes.map((item: any) => toI18n(item)) : [],
      accent: data.accent || 'light',
      featured: data.featured ?? false,
    })
    resetDirty()
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, 'Failed to load service mode'))
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
      await modesApi.updateMode(route.params.id as string, form)
      ElMessage.success('Service mode updated')
    } else {
      await modesApi.createMode(form)
      ElMessage.success('Service mode created')
    }
    disableDirtyCheck()
    router.push('/admin/interpreting/modes')
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
      :title="isEdit ? 'Edit Service Mode' : 'Create Service Mode'"
      back-to="/admin/interpreting/modes"
      :saving="saving"
      :dirty="isDirty"
      @save="handleSave"
    />

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <el-card shadow="never" class="section-card">
          <template #header>Basic Information</template>
          <el-form-item label="Mode Name" prop="title.en">
            <I18nInput v-model="form.title" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Price" prop="price.en">
                <I18nInput v-model="form.price" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Sort Order">
                <el-input-number v-model="form.sortOrder" :min="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="Best For">
            <I18nInput v-model="form.bestFor" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Card Tone">
                <el-select v-model="form.accent" style="width: 100%">
                  <el-option label="Light" value="light" />
                  <el-option label="Dark" value="dark" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Featured">
                <el-switch v-model="form.featured" active-text="Featured" inactive-text="Standard" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <EditorWorkspace
          v-model="activePanel"
          title="Service Content"
          eyebrow="Service Mode Content"
          description="Edit the public service description and included items."
          :active-label="activePanel === 'body' ? 'Description' : 'Included Items'"
          :tabs="[{ key: 'body', label: 'Description' }, { key: 'includes', label: 'Included Items' }]"
        >
          <template #default>
            <div v-if="activePanel === 'body'" class="workspace-panel">
              <div class="panel-title">Description</div>
              <el-form-item label="Service Description">
                <I18nMarkdownEditor v-model="form.body" :rows="8" />
              </el-form-item>
            </div>

            <div v-else class="workspace-panel">
              <div class="panel-title">Included Items</div>
              <el-form-item label="Service Items">
                <div class="tag-list">
                  <el-tag v-for="(item, index) in form.includes" :key="index" closable @close="removeInclude(index)">
                    {{ item.en || item.zh }}
                  </el-tag>
                </div>
                <div class="tag-input-row">
                  <el-input v-model="newIncludeEn" placeholder="English item" @keyup.enter="addInclude" />
                  <el-button type="primary" @click="addInclude">Add</el-button>
                </div>
              </el-form-item>
            </div>
          </template>
        </EditorWorkspace>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';

/* Narrower single-column layout for service mode editor */
.editor-shell {
  grid-template-columns: minmax(0, 1fr);
  max-width: 900px;
}

.workspace-panel {
  min-height: 260px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  min-height: 32px;
}

.tag-input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 10px;
}
</style>
