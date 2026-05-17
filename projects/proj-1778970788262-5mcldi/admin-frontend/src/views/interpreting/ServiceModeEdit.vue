<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { modesApi } from '@/api/modes'
import type { ServiceModeFormData } from '@/types/interpreting'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)

const form = reactive<ServiceModeFormData>({
  sortOrder: 1,
  title: '',
  titleEn: '',
  price: '',
  bestFor: '',
  bestForEn: '',
  body: '',
  bodyEn: '',
  includes: [],
  includesEn: [],
  accent: 'light',
  featured: false,
})

const includeInput = ref('')
function addInclude() {
  const val = includeInput.value.trim()
  if (val && !form.includes.includes(val)) {
    form.includes.push(val)
  }
  includeInput.value = ''
}
function removeInclude(idx: number) {
  form.includes.splice(idx, 1)
}

const includeEnInput = ref('')
function addIncludeEn() {
  const val = includeEnInput.value.trim()
  if (val && !form.includesEn.includes(val)) {
    form.includesEn.push(val)
  }
  includeEnInput.value = ''
}
function removeIncludeEn(idx: number) {
  form.includesEn.splice(idx, 1)
}

const rules = {
  title: [{ required: true, message: '请输入模式名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    loading.value = true
    try {
      const res = await modesApi.getMode(id)
      const data = res.data.data
      Object.assign(form, {
        sortOrder: data.sortOrder,
        title: data.title,
        titleEn: data.titleEn || '',
        price: data.price,
        bestFor: data.bestFor,
        bestForEn: data.bestForEn || '',
        body: data.body,
        bodyEn: data.bodyEn || '',
        includes: [...data.includes],
        includesEn: [...(data.includesEn || [])],
        accent: data.accent,
        featured: data.featured,
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
      await modesApi.updateMode(route.params.id as string, form)
      ElMessage.success('模式更新成功')
    } else {
      await modesApi.createMode(form)
      ElMessage.success('模式创建成功')
    }
    router.push('/admin/interpreting/modes')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/admin/interpreting/modes')
}
</script>

<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑服务模式' : '新增服务模式' }}</h2>
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
          <el-form-item label="价格" prop="price">
            <el-input v-model="form.price" placeholder="如 $180 / 小时" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="模式名称（中）" prop="title">
        <el-input v-model="form.title" placeholder="中文名称" />
      </el-form-item>
      <el-form-item label="模式名称（英）">
        <el-input v-model="form.titleEn" placeholder="English title" />
      </el-form-item>
      <el-form-item label="适用场景（中）">
        <el-input v-model="form.bestFor" type="textarea" :rows="2" placeholder="中文适用场景" />
      </el-form-item>
      <el-form-item label="适用场景（英）">
        <el-input v-model="form.bestForEn" type="textarea" :rows="2" placeholder="English best for" />
      </el-form-item>
      <el-form-item label="描述（中）">
        <el-input v-model="form.body" type="textarea" :rows="5" placeholder="中文描述" />
      </el-form-item>
      <el-form-item label="描述（英）">
        <el-input v-model="form.bodyEn" type="textarea" :rows="5" placeholder="English description" />
      </el-form-item>

      <el-divider content-position="left">服务清单</el-divider>
      <el-form-item label="服务清单（中）">
        <div class="tag-section">
          <div class="tag-list">
            <el-tag v-for="(item, idx) in form.includes" :key="'zh-' + idx" closable @close="removeInclude(idx)" style="margin: 2px 4px">{{ item }}</el-tag>
          </div>
          <div class="tag-input-row">
            <el-input v-model="includeInput" placeholder="输入后回车添加" size="small" style="width: 200px" @keyup.enter="addInclude" />
            <el-button size="small" @click="addInclude">添加</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="服务清单（英）">
        <div class="tag-section">
          <div class="tag-list">
            <el-tag v-for="(item, idx) in form.includesEn" :key="'en-' + idx" closable @close="removeIncludeEn(idx)" style="margin: 2px 4px">{{ item }}</el-tag>
          </div>
          <div class="tag-input-row">
            <el-input v-model="includeEnInput" placeholder="Type and Enter to add" size="small" style="width: 200px" @keyup.enter="addIncludeEn" />
            <el-button size="small" @click="addIncludeEn">添加</el-button>
          </div>
        </div>
      </el-form-item>

      <el-divider content-position="left">显示设置</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="卡片色调">
            <el-select v-model="form.accent" placeholder="选择色调">
              <el-option label="浅色" value="light" />
              <el-option label="深色" value="dark" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="推荐">
            <el-switch v-model="form.featured" active-text="推荐" inactive-text="不推荐" />
          </el-form-item>
        </el-col>
      </el-row>

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
