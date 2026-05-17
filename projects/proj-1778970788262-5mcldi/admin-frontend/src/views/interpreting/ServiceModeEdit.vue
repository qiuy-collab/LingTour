<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { modesApi } from '@/api/modes'
import type { ServiceModeFormData } from '@/types/interpreting'
import { toI18n } from '@/types/common'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)

const form = reactive<ServiceModeFormData>({
  sortOrder: 1,
  title: { zh: '', en: '' },
  price: '',
  bestFor: { zh: '', en: '' },
  body: { zh: '', en: '' },
  includes: [],
  accent: 'light',
  featured: false,
})

const newInclude = ref<{ zh: string; en: string }>({ zh: '', en: '' })
function addInclude() {
  const zh = newInclude.value.zh.trim()
  const en = newInclude.value.en.trim()
  if (zh && en) {
    form.includes.push({ zh, en })
    newInclude.value = { zh: '', en: '' }
  }
}
function removeInclude(idx: number) {
  form.includes.splice(idx, 1)
}

const rules = {
  'title.zh': [{ required: true, message: '请输入模式名称', trigger: 'blur' }],
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
        title: toI18n(data.title),
        price: typeof data.price === 'string' ? data.price : ((data.price as any)?.zh || (data.price as any)?.en || ''),
        bestFor: toI18n(data.bestFor),
        body: toI18n(data.body),
        includes: Array.isArray(data.includes) ? data.includes.map((item: any) => toI18n(item)) : [],
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
      <el-form-item label="模式名称">
        <I18nInput v-model="form.title" />
      </el-form-item>
      <el-form-item label="适用场景">
        <I18nInput v-model="form.bestFor" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="描述">
        <I18nMarkdownEditor v-model="form.body" :rows="5" />
      </el-form-item>

      <el-divider content-position="left">服务清单</el-divider>
      <el-form-item label="服务清单">
        <div class="tag-section">
          <div class="tag-list">
            <el-tag
              v-for="(item, idx) in form.includes"
              :key="idx"
              closable
              @close="removeInclude(idx)"
              style="margin: 2px 4px"
            >
              {{ item.zh }} / {{ item.en }}
            </el-tag>
          </div>
          <div class="tag-input-row">
            <el-input v-model="newInclude.zh" placeholder="中文" size="small" style="width: 180px" @keyup.enter="addInclude" />
            <el-input v-model="newInclude.en" placeholder="English" size="small" style="width: 180px" @keyup.enter="addInclude" />
            <el-button size="small" @click="addInclude">添加</el-button>
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
