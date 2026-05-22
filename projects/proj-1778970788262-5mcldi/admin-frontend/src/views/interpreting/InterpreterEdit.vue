<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { interpretersApi } from '@/api/interpreters'
import ImageUpload from '@/components/ImageUpload.vue'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import type { InterpreterFormData } from '@/types/interpreting'
import type { I18nObject } from '@/types/common'
import { toI18n } from '@/types/common'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)

const form = reactive<InterpreterFormData>({
  sortOrder: 1,
  name: { zh: '', en: '' },
  language: { zh: '', en: '' },
  focus: { zh: '', en: '' },
  helps: [],
  avatar: '',
  bio: { zh: '', en: '' },
  status: 'pending_review',
  city: { zh: '', en: '' },
})

const newHelp = reactive<I18nObject>({ zh: '', en: '' })
function addHelp() {
  const zh = newHelp.zh.trim()
  const en = newHelp.en.trim()
  if (zh && !form.helps.some((h) => h.zh === zh)) {
    form.helps.push({ zh, en })
  }
  newHelp.zh = ''
  newHelp.en = ''
}
function removeHelp(idx: number) {
  form.helps.splice(idx, 1)
}

const rules = {
  'name.zh': [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  'language.zh': [{ required: true, message: '请输入服务语种', trigger: 'blur' }],
  'city.zh': [{ required: true, message: '请输入服务城市', trigger: 'blur' }],
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
        name: toI18n(data.name),
        language: toI18n(data.language),
        focus: toI18n(data.focus),
        helps: (data.helps || []).map((h: any) => toI18n(h)),
        avatar: data.avatar,
        bio: toI18n(data.bio),
        status: data.status,
        city: toI18n(data.city),
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
      <el-form-item label="姓名" prop="name.zh">
        <I18nInput v-model="form.name" placeholder="口译员姓名" />
      </el-form-item>
      <el-form-item label="服务语种" prop="language.zh">
        <I18nInput v-model="form.language" placeholder="如 English & Cantonese/Mandarin" />
      </el-form-item>
      <el-form-item label="服务城市" prop="city.zh">
        <I18nInput v-model="form.city" placeholder="如 广州" />
      </el-form-item>
      <el-form-item label="专注领域">
        <I18nInput v-model="form.focus" placeholder="输入专注领域" />
      </el-form-item>

      <el-divider content-position="left">能力标签</el-divider>
      <el-form-item label="能力标签">
        <div class="tag-section">
          <div class="tag-list">
            <el-tag
              v-for="(item, idx) in form.helps"
              :key="'help-' + idx"
              closable
              @close="removeHelp(idx)"
              style="margin: 2px 4px"
            >{{ item.zh }}</el-tag>
          </div>
          <div class="tag-input-row">
            <el-input v-model="newHelp.zh" placeholder="中文标签" size="small" style="width: 180px" @keyup.enter="addHelp" />
            <el-input v-model="newHelp.en" placeholder="English tag" size="small" style="width: 180px" @keyup.enter="addHelp" />
            <el-button size="small" @click="addHelp">添加</el-button>
          </div>
        </div>
      </el-form-item>

      <el-divider content-position="left">个人资料</el-divider>
      <el-form-item label="头像">
        <ImageUpload v-model="form.avatar" :limit="1" mode="single" />
      </el-form-item>
      <el-form-item label="简介">
        <I18nMarkdownEditor v-model="form.bio" :rows="4" placeholder="输入个人简介" />
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
