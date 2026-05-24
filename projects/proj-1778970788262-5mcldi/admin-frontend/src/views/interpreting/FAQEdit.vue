<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { faqsApi } from '@/api/faqs'
import type { FAQFormData } from '@/types/interpreting'
import { toI18n } from '@/types/common'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import { extractErrorMessage } from '@/utils/i18n'

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
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  'question.zh': [{ required: true, message: '请输入问题（中文）', trigger: 'blur' }],
}

onMounted(async () => {
  const id = route.params.id as string
  if (!id) return
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
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, '加载 FAQ 失败'))
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
      await faqsApi.updateFAQ(route.params.id as string, form)
      ElMessage.success('FAQ 更新成功')
    } else {
      await faqsApi.createFAQ(form)
      ElMessage.success('FAQ 创建成功')
    }
    router.push('/admin/interpreting/faqs')
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
      <h2>{{ isEdit ? '编辑 FAQ' : '新增 FAQ' }}</h2>
      <div>
        <el-button @click="router.push('/admin/interpreting/faqs')">返回</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <!-- 基本信息 -->
        <el-card shadow="never" class="section-card">
          <template #header>基本信息</template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="排序权重">
                <el-input-number v-model="form.sortOrder" :min="1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="分类" prop="category">
                <el-select v-model="form.category" placeholder="选择分类" style="width: 100%">
                  <el-option label="口译服务" value="interpreting" />
                  <el-option label="通用问题" value="general" />
                  <el-option label="路线相关" value="routes" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 问题 -->
        <el-card shadow="never" class="section-card">
          <template #header>问题</template>
          <el-form-item label="问题内容" prop="question.zh">
            <I18nInput v-model="form.question" placeholder="输入 FAQ 问题" />
          </el-form-item>
        </el-card>

        <!-- 答案 -->
        <el-card shadow="never" class="section-card">
          <template #header>答案</template>
          <el-form-item label="答案内容">
            <I18nMarkdownEditor v-model="form.answer" :rows="8" placeholder="输入答案（支持 Markdown）" />
          </el-form-item>
        </el-card>
      </el-form>
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
  grid-template-columns: minmax(0, 1fr);
  max-width: 900px;
  gap: 20px;
  align-items: start;
}

.section-card {
  margin-bottom: 16px;
}
</style>
