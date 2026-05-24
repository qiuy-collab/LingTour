<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { modesApi } from '@/api/modes'
import type { ServiceModeFormData } from '@/types/interpreting'
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

const newIncludeZh = ref('')
const newIncludeEn = ref('')

function addInclude() {
  const zh = newIncludeZh.value.trim()
  const en = newIncludeEn.value.trim()
  if (!zh) return
  form.includes.push({ zh, en })
  newIncludeZh.value = ''
  newIncludeEn.value = ''
}

function removeInclude(idx: number) {
  form.includes.splice(idx, 1)
}

const rules = {
  'title.zh': [{ required: true, message: '请输入模式名称（中文）', trigger: 'blur' }],
  'price.zh': [{ required: true, message: '请输入价格（中文）', trigger: 'blur' }],
}

onMounted(async () => {
  const id = route.params.id as string
  if (!id) return
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
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, '加载服务模式失败'))
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
      await modesApi.updateMode(route.params.id as string, form)
      ElMessage.success('模式更新成功')
    } else {
      await modesApi.createMode(form)
      ElMessage.success('模式创建成功')
    }
    router.push('/admin/interpreting/modes')
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
      <h2>{{ isEdit ? '编辑服务模式' : '新增服务模式' }}</h2>
      <div>
        <el-button @click="router.push('/admin/interpreting/modes')">返回</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <!-- 基本信息 -->
        <el-card shadow="never" class="section-card">
          <template #header>基本信息</template>
          <el-form-item label="模式名称" prop="title.zh">
            <I18nInput v-model="form.title" placeholder="如 半天陪同口译" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="价格" prop="price.zh">
                <I18nInput v-model="form.price" placeholder="如 RMB 680 / 半天起" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排序权重">
                <el-input-number v-model="form.sortOrder" :min="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="适用场景">
            <I18nInput v-model="form.bestFor" type="textarea" :rows="2" placeholder="描述该模式最适合的使用场景" />
          </el-form-item>
        </el-card>

        <!-- 服务描述 -->
        <el-card shadow="never" class="section-card">
          <template #header>服务描述</template>
          <el-form-item label="详细描述">
            <I18nMarkdownEditor v-model="form.body" :rows="6" placeholder="输入详细服务描述（支持 Markdown）" />
          </el-form-item>
        </el-card>

        <!-- 服务清单 -->
        <el-card shadow="never" class="section-card">
          <template #header>服务清单</template>
          <div class="tag-section">
            <div class="tag-list">
              <el-tag
                v-for="(item, idx) in form.includes"
                :key="idx"
                closable
                @close="removeInclude(idx)"
              >
                {{ item.zh || item.en }}
                <template v-if="item.en && item.zh"> / {{ item.en }}</template>
              </el-tag>
              <span v-if="form.includes.length === 0" class="empty-hint">暂无服务项，请在下方添加</span>
            </div>
            <div class="tag-input-row">
              <el-input v-model="newIncludeZh" placeholder="中文" size="default" style="flex: 1" @keyup.enter="addInclude" />
              <el-input v-model="newIncludeEn" placeholder="English" size="default" style="flex: 1" @keyup.enter="addInclude" />
              <el-button type="primary" @click="addInclude">添加</el-button>
            </div>
          </div>
        </el-card>

        <!-- 显示设置 -->
        <el-card shadow="never" class="section-card">
          <template #header>显示设置</template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="卡片色调">
                <el-select v-model="form.accent" style="width: 100%">
                  <el-option label="浅色" value="light" />
                  <el-option label="深色" value="dark" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="推荐标记">
                <el-switch v-model="form.featured" active-text="推荐" inactive-text="不推荐" />
              </el-form-item>
            </el-col>
          </el-row>
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

.tag-section {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  min-height: 32px;
  align-items: center;
}

.empty-hint {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.tag-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
