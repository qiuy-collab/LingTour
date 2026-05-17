<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { interpretersApi } from '@/api/interpreters'
import ImageUpload from '@/components/ImageUpload.vue'
import type { InterpreterFormData } from '@/types/interpreting'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)

const form = reactive<InterpreterFormData>({
  sortOrder: 1,
  name: '',
  language: '',
  focus: '',
  focusEn: '',
  helps: [],
  helpsEn: [],
  avatar: '',
  bio: '',
  bioEn: '',
  status: 'pending_review',
  city: '',
})

const helpInput = ref('')
function addHelp() {
  const val = helpInput.value.trim()
  if (val && !form.helps.includes(val)) {
    form.helps.push(val)
  }
  helpInput.value = ''
}
function removeHelp(idx: number) {
  form.helps.splice(idx, 1)
}

const helpEnInput = ref('')
function addHelpEn() {
  const val = helpEnInput.value.trim()
  if (val && !form.helpsEn.includes(val)) {
    form.helpsEn.push(val)
  }
  helpEnInput.value = ''
}
function removeHelpEn(idx: number) {
  form.helpsEn.splice(idx, 1)
}

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  language: [{ required: true, message: '请输入服务语种', trigger: 'blur' }],
  focus: [{ required: true, message: '请输入专注领域', trigger: 'blur' }],
  city: [{ required: true, message: '请输入服务城市', trigger: 'blur' }],
}

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    loading.value = true
    try {
      const res = await interpretersApi.getInterpreter(id)
      const data = res.data.data
      Object.assign(form, {
        sortOrder: data.sortOrder,
        name: data.name,
        language: data.language,
        focus: data.focus,
        focusEn: data.focusEn || '',
        helps: [...data.helps],
        helpsEn: [...(data.helpsEn || [])],
        avatar: data.avatar,
        bio: data.bio,
        bioEn: data.bioEn || '',
        status: data.status,
        city: data.city,
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
      await interpretersApi.updateInterpreter(route.params.id as string, form)
      ElMessage.success('口译员更新成功')
    } else {
      await interpretersApi.createInterpreter(form)
      ElMessage.success('口译员创建成功')
    }
    router.push('/admin/interpreting/profiles')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/admin/interpreting/profiles')
}
</script>

<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑口译员' : '新增口译员' }}</h2>
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
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="选择状态">
              <el-option label="待审核" value="pending_review" />
              <el-option label="已激活" value="active" />
              <el-option label="已禁用" value="inactive" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="口译员姓名" />
      </el-form-item>
      <el-form-item label="服务语种" prop="language">
        <el-input v-model="form.language" placeholder="如 English & Cantonese/Mandarin" />
      </el-form-item>
      <el-form-item label="服务城市" prop="city">
        <el-input v-model="form.city" placeholder="如 广州" />
      </el-form-item>
      <el-form-item label="专注领域（中）" prop="focus">
        <el-input v-model="form.focus" placeholder="中文专注领域" />
      </el-form-item>
      <el-form-item label="专注领域（英）">
        <el-input v-model="form.focusEn" placeholder="English focus" />
      </el-form-item>

      <el-divider content-position="left">能力标签</el-divider>
      <el-form-item label="能力标签（中）">
        <div class="tag-section">
          <div class="tag-list">
            <el-tag v-for="(item, idx) in form.helps" :key="'zh-' + idx" closable @close="removeHelp(idx)" style="margin: 2px 4px">{{ item }}</el-tag>
          </div>
          <div class="tag-input-row">
            <el-input v-model="helpInput" placeholder="输入后回车添加" size="small" style="width: 200px" @keyup.enter="addHelp" />
            <el-button size="small" @click="addHelp">添加</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="能力标签（英）">
        <div class="tag-section">
          <div class="tag-list">
            <el-tag v-for="(item, idx) in form.helpsEn" :key="'en-' + idx" closable @close="removeHelpEn(idx)" style="margin: 2px 4px">{{ item }}</el-tag>
          </div>
          <div class="tag-input-row">
            <el-input v-model="helpEnInput" placeholder="Type and Enter to add" size="small" style="width: 200px" @keyup.enter="addHelpEn" />
            <el-button size="small" @click="addHelpEn">添加</el-button>
          </div>
        </div>
      </el-form-item>

      <el-divider content-position="left">个人资料</el-divider>
      <el-form-item label="头像">
        <ImageUpload v-model="form.avatar" :limit="1" mode="single" />
      </el-form-item>
      <el-form-item label="简介（中）">
        <el-input v-model="form.bio" type="textarea" :rows="4" placeholder="中文简介" />
      </el-form-item>
      <el-form-item label="简介（英）">
        <el-input v-model="form.bioEn" type="textarea" :rows="4" placeholder="English bio" />
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
.tag-section { width: 100%; }
.tag-list { margin-bottom: 8px; min-height: 30px; }
.tag-input-row { display: flex; gap: 8px; align-items: center; }
</style>
