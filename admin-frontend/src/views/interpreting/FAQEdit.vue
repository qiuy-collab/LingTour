<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { faqsApi } from '@/api/faqs'
import type { FAQFormData } from '@/types/interpreting'
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
const formRef = ref<FormInstance>()

const form = reactive<FAQFormData>({
  sortOrder: 1,
  question: { zh: '', en: '' },
  answer: { zh: '', en: '' },
  category: 'interpreting',
})

const rules = {
  category: [{ required: true, message: 'Select a category', trigger: 'change' }],
  'question.en': [{ required: true, message: 'Enter the question', trigger: 'blur' }],
}

const { isDirty, resetDirty, disableDirtyCheck } = useDirtyForm({ form })

onMounted(async () => {
  const id = route.params.id as string
  if (!id) {
    resetDirty()
    return
  }

  isEdit.value = true
  loading.value = true
  try {
    const res = await faqsApi.getFAQ(id)
    const data = res.data.data
    Object.assign(form, {
      sortOrder: data.sortOrder ?? 1,
      question: toI18n(data.question),
      answer: toI18n(data.answer),
      category: data.category || 'interpreting',
    })
    resetDirty()
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, 'Failed to load FAQ'))
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
      await faqsApi.updateFAQ(route.params.id as string, form)
      ElMessage.success('FAQ updated')
    } else {
      await faqsApi.createFAQ(form)
      ElMessage.success('FAQ created')
    }
    disableDirtyCheck()
    router.push('/admin/interpreting/faqs')
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
      :title="isEdit ? 'Edit FAQ' : 'Create FAQ'"
      back-to="/admin/interpreting/faqs"
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
              <el-form-item label="Sort Order">
                <el-input-number v-model="form.sortOrder" :min="1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Category" prop="category">
                <el-select v-model="form.category" style="width: 100%">
                  <el-option label="Interpreting" value="interpreting" />
                  <el-option label="General" value="general" />
                  <el-option label="Routes" value="routes" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <EditorWorkspace
          model-value="content"
          title="FAQ Content"
          eyebrow="FAQ Content"
          description="Edit the English question and answer."
          active-label="Question & Answer"
          :tabs="[{ key: 'content', label: 'Question & Answer' }]"
        >
          <div class="workspace-panel">
            <div class="panel-title">Question & Answer</div>
            <el-form-item label="Question" prop="question.en">
              <I18nInput v-model="form.question" />
            </el-form-item>
            <el-form-item label="Answer">
              <I18nMarkdownEditor v-model="form.answer" :rows="8" />
            </el-form-item>
          </div>
        </EditorWorkspace>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';

/* Narrower single-column layout for FAQ editor */
.editor-shell {
  grid-template-columns: minmax(0, 1fr);
  max-width: 900px;
}

.workspace-panel {
  min-height: 240px;
}
</style>
