<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { collectionsApi } from '@/api/collections'
import { routesApi } from '@/api/routes'
import type { CollectionFormData } from '@/types/collection'
import { pickI18n, toI18n } from '@/types/common'
import { extractErrorMessage } from '@/utils/i18n'
import { useDirtyForm } from '@/composables/useDirtyForm'
import EditorPageHeader from '@/components/editor/EditorPageHeader.vue'
import EditorWorkspace from '@/components/editor/EditorWorkspace.vue'
import I18nInput from '@/components/I18nInput.vue'
import I18nMarkdownEditor from '@/components/I18nMarkdownEditor.vue'
import ImageUpload from '@/components/ImageUpload.vue'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const routeOptions = ref<Array<{ slug: string; title: string }>>([])

const form = reactive<CollectionFormData>({
  slug: '',
  title: { zh: '', en: '' },
  routeName: '',
  routeSlug: '',
  image: '',
  body: { zh: '', en: '' },
  sortOrder: 0,
  published: false,
})

const rules = {
  slug: [
    { required: true, message: '请输入 Slug', trigger: 'blur' },
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug 必须是 kebab-case', trigger: 'blur' },
  ],
  'title.zh': [{ required: true, message: '请输入系列名称', trigger: 'blur' }],
}

const { isDirty, resetDirty, disableDirtyCheck } = useDirtyForm({ form })

function applyRouteSelection(slug: string) {
  const selected = routeOptions.value.find((item) => item.slug === slug)
  if (!selected) return
  form.routeSlug = selected.slug
  form.routeName = selected.title
}

onMounted(async () => {
  loading.value = true
  try {
    const routesRes = await routesApi.getRoutes({ page: 1, pageSize: 200 })
    routeOptions.value = (routesRes.data.data.items || []).map((item: any) => ({
      slug: item.slug,
      title: pickI18n(item.title) || item.slug,
    }))

    const id = route.params.id as string
    if (id) {
      isEdit.value = true
      const res = await collectionsApi.getCollection(id)
      const data = res.data.data
      let routeName = data.routeName || ''
      if (typeof routeName === 'string' && routeName.startsWith('{')) {
        try {
          const parsed = JSON.parse(routeName)
          routeName = parsed.zh || parsed.en || routeName
        } catch {
          routeName = data.routeName || ''
        }
      } else if (typeof routeName === 'object' && routeName !== null) {
        routeName = routeName.zh || routeName.en || ''
      }

      Object.assign(form, {
        slug: data.slug,
        title: toI18n(data.title),
        routeName,
        routeSlug: data.routeSlug || '',
        image: data.image || '',
        body: toI18n(data.body),
        sortOrder: data.sortOrder ?? 0,
        published: data.published ?? false,
      })
    }

    resetDirty()
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, '加载系列数据失败'))
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  try {
    await formRef.value?.validate()
  } catch {
    ElMessage.warning('请先补全必填项')
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await collectionsApi.updateCollection(route.params.id as string, form)
      ElMessage.success('系列已更新')
    } else {
      await collectionsApi.createCollection(form)
      ElMessage.success('系列已创建')
    }
    disableDirtyCheck()
    router.push('/admin/shop/collections')
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, '保存失败'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="edit-page" v-loading="loading">
    <EditorPageHeader
      :title="isEdit ? '编辑系列' : '新增系列'"
      back-to="/admin/shop/collections"
      :saving="saving"
      :dirty="isDirty"
      @save="handleSave"
    />

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <el-card shadow="never" class="section-card">
          <template #header>基础信息</template>
          <el-form-item label="Slug" prop="slug">
            <el-input v-model="form.slug" placeholder="coastal-life-kit" />
          </el-form-item>
          <el-form-item label="系列名称" prop="title.zh">
            <I18nInput v-model="form.title" />
          </el-form-item>
          <el-form-item label="封面图">
            <ImageUpload v-model="form.image" module="shop" />
          </el-form-item>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>关联路线与发布</template>
          <el-form-item label="关联路线">
            <el-select
              v-model="form.routeSlug"
              filterable
              clearable
              style="width: 100%"
              @change="applyRouteSelection"
            >
              <el-option
                v-for="item in routeOptions"
                :key="item.slug"
                :label="`${item.title} (${item.slug})`"
                :value="item.slug"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="前台显示路线名">
            <el-input v-model="form.routeName" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="排序权重">
                <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发布状态">
                <el-switch v-model="form.published" active-text="已发布" inactive-text="草稿" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <EditorWorkspace
          model-value="body"
          title="系列内容工作台"
          eyebrow="Collection Content"
          description="基础信息、路线关联和发布状态放固定区，前台展示文案在这里集中编辑。"
          active-label="系列正文"
          :tabs="[{ key: 'body', label: '系列正文' }]"
        >
          <div class="workspace-panel">
            <div class="panel-title">系列正文</div>
            <el-form-item label="描述内容">
              <I18nMarkdownEditor v-model="form.body" :rows="8" />
            </el-form-item>
          </div>
        </EditorWorkspace>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.edit-page {
  padding-bottom: 40px;
}

.editor-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  max-width: 900px;
}

.section-card {
  margin-bottom: 16px;
}

.workspace-panel {
  min-height: 220px;
}

.panel-title {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
</style>
