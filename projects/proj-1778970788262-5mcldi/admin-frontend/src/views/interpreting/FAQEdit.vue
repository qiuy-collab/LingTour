<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { faqsApi } from '@/api/faqs'
import type { FAQFormData } from '@/types/interpreting'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)

const form = reactive<FAQFormData>({
  sortOrder: 1,
  question: '',
  questionEn: '',
  answer: '',
  answerEn: '',
  category: 'interpreting',
})

const rules = {
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入答案', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    loading.value = true
    try {
      const res = await faqsApi.getFAQ(id)
      const data = res.data.data
      Object.assign(form, {
        sortOrder: data.sortOrder,
        question: data.question,
        questionEn: data.questionEn || '',
        answer: data.answer,
        answerEn: data.answerEn || '',
        category: data.category,
      })
    } finally {
      loading.value = false
    }
  }
})

async function handleSave() {
  saving.value = true
  try {
    if (isEdit.value) {
      await faqsApi.updateFAQ(route.params.id as string, form)
      ElMessage.success('FAQ更新成功')
    } else {
      await faqsApi.createFAQ(form)
      ElMessage.success('FAQ创建成功')
    }
    router.push('/admin/interpreting/faqs')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/admin/interpreting/faqs')
}
</script>

<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑FAQ' : '新增FAQ' }}</h2>
    </div>

    <el-form :model="form" :rules="rules" label-width="140px" style="max-width: 800px">
      <el-divider content-position="left">基本信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-select v-model="form.category" placeholder="选择分类">
              <el-option label="口译服务" value="interpreting" />
              <el-option label="通用问题" value="general" />
              <el-option label="路线相关" value="routes" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">问题</el-divider>
      <el-form-item label="问题（中）" prop="question">
        <el-input v-model="form.question" placeholder="中文问题" />
      </el-form-item>
      <el-form-item label="问题（英）">
        <el-input v-model="form.questionEn" placeholder="English question" />
      </el-form-item>

      <el-divider content-position="left">答案</el-divider>
      <el-form-item label="答案（中）" prop="answer">
        <el-input v-model="form.answer" type="textarea" :rows="4" placeholder="中文答案" />
      </el-form-item>
      <el-form-item label="答案（英）">
        <el-input v-model="form.answerEn" type="textarea" :rows="4" placeholder="English answer" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 20px; }
</style>
