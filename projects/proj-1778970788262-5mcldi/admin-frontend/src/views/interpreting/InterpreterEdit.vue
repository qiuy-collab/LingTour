<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { interpretersApi } from '@/api/interpreters'
import ImageUpload from '@/components/ImageUpload.vue'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import type { InterpreterFormData } from '@/types/interpreting'
import { toI18n } from '@/types/common'
import { extractErrorMessage } from '@/utils/i18n'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<InterpreterFormData>({
  sortOrder: 1,
  name: { zh: '', en: '' },
  language: { zh: '', en: '' },
  focus: { zh: '', en: '' },
  helps: [],
  avatar: '',
  bio: { zh: '', en: '' },
  status: 'pending_review',
  city: '',
})

const newHelpZh = ref('')
const newHelpEn = ref('')

function addHelp() {
  const zh = newHelpZh.value.trim()
  const en = newHelpEn.value.trim()
  if (!zh) return
  if (!form.helps.some((h) => h.zh === zh)) {
    form.helps.push({ zh, en })
  }
  newHelpZh.value = ''
  newHelpEn.value = ''
}

function removeHelp(idx: number) {
  form.helps.splice(idx, 1)
}

const rules = {
  'name.zh': [{ required: true, message: '请输入姓名（中文）', trigger: 'blur' }],
  'language.zh': [{ required: true, message: '请输入服务语种（中文）', trigger: 'blur' }],
  city: [{ required: true, message: '请输入服务城市', trigger: 'blur' }],
}

onMounted(async () => {
  const id = route.params.id as string
  if (!id) return
  isEdit.value = true
  loading.value = true
  try {
    const res = await interpretersApi.getInterpreter(id)
    const data = res.data.data
    Object.assign(form, {
      sortOrder: data.sortOrder ?? 1,
      name: toI18n(data.name),
      language: toI18n(data.language),
      focus: toI18n(data.focus),
      helps: (data.helps || []).map((h: any) => toI18n(h)),
      avatar: data.avatar || '',
      bio: toI18n(data.bio),
      status: data.status || 'pending_review',
      city: data.city || '',
    })
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, '加载口译员数据失败'))
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
      await interpretersApi.updateInterpreter(route.params.id as string, form)
      ElMessage.success('口译员更新成功')
    } else {
      await interpretersApi.createInterpreter(form)
      ElMessage.success('口译员创建成功')
    }
    router.push('/admin/interpreting/profiles')
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
      <h2>{{ isEdit ? '编辑口译员' : '新增口译员' }}</h2>
      <div>
        <el-button @click="router.push('/admin/interpreting/profiles')">返回</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <!-- 基本信息 -->
        <el-card shadow="never" class="section-card">
          <template #header>基本信息</template>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="排序权重">
                <el-input-number v-model="form.sortOrder" :min="1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="状态">
                <el-select v-model="form.status" style="width: 100%">
                  <el-option label="待审核" value="pending_review" />
                  <el-option label="已激活" value="active" />
                  <el-option label="已禁用" value="inactive" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="头像">
                <ImageUpload v-model="form.avatar" :limit="1" mode="single" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="姓名" prop="name.zh">
            <I18nInput v-model="form.name" placeholder="口译员姓名" />
          </el-form-item>
          <el-form-item label="服务语种" prop="language.zh">
            <I18nInput v-model="form.language" placeholder="如 English & Cantonese/Mandarin" />
          </el-form-item>
          <el-form-item label="服务城市" prop="city">
            <el-input v-model="form.city" placeholder="如 zhanjiang / guangzhou" />
          </el-form-item>
          <el-form-item label="专注领域">
            <I18nInput v-model="form.focus" placeholder="如 商务会议 / 文化导览" />
          </el-form-item>
        </el-card>

        <!-- 能力标签 -->
        <el-card shadow="never" class="section-card">
          <template #header>能力标签</template>
          <div class="tag-section">
            <div class="tag-list">
              <el-tag
                v-for="(item, idx) in form.helps"
                :key="'help-' + idx"
                closable
                @close="removeHelp(idx)"
              >
                {{ item.zh || item.en }}
                <template v-if="item.en && item.zh"> / {{ item.en }}</template>
              </el-tag>
              <span v-if="form.helps.length === 0" class="empty-hint">暂无标签，请在下方添加</span>
            </div>
            <div class="tag-input-row">
              <el-input v-model="newHelpZh" placeholder="中文标签" size="default" style="flex: 1" @keyup.enter="addHelp" />
              <el-input v-model="newHelpEn" placeholder="English tag" size="default" style="flex: 1" @keyup.enter="addHelp" />
              <el-button type="primary" @click="addHelp">添加</el-button>
            </div>
          </div>
        </el-card>

        <!-- 个人简介 -->
        <el-card shadow="never" class="section-card">
          <template #header>个人简介</template>
          <el-form-item label="简介">
            <I18nMarkdownEditor v-model="form.bio" :rows="6" placeholder="输入口译员个人简介（支持 Markdown）" />
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
