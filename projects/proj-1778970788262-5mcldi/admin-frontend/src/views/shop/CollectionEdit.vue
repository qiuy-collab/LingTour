<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { collectionsApi } from '@/api/collections'
import ImageUpload from '@/components/ImageUpload.vue'
import I18nInput from '@/components/I18nInput.vue'
import type { CollectionFormData } from '@/types/collection'
import { toI18n } from '@/types/common'
import { extractErrorMessage } from '@/utils/i18n'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

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
    { pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: 'Slug 必须为 kebab-case', trigger: 'blur' },
  ],
  'title.zh': [{ required: true, message: '请输入中文名称', trigger: 'blur' }],
  routeName: [{ required: true, message: '请输入关联路线名', trigger: 'blur' }],
}

onMounted(async () => {
  const id = route.params.id as string
  if (!id) return
  isEdit.value = true
  loading.value = true
  try {
    const res = await collectionsApi.getCollection(id)
    const data = res.data.data
    // routeName 可能是 JSON 字符串（后端 seed 数据），需要解析
    let routeName = data.routeName || ''
    if (typeof routeName === 'string' && routeName.startsWith('{')) {
      try {
        const parsed = JSON.parse(routeName)
        routeName = parsed.zh || parsed.en || routeName
      } catch { /* keep as-is */ }
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
    ElMessage.warning('请检查必填项')
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await collectionsApi.updateCollection(route.params.id as string, form)
      ElMessage.success('系列更新成功')
    } else {
      await collectionsApi.createCollection(form)
      ElMessage.success('系列创建成功')
    }
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
    <div class="page-header">
      <h2>{{ isEdit ? '编辑系列' : '新增系列' }}</h2>
      <div>
        <el-button @click="router.push('/admin/shop/collections')">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="editor-shell">
      <el-form ref="formRef" :model="form" :rules="rules" class="editor-form" label-position="top">
        <!-- 基础信息 -->
        <el-card shadow="never" class="section-card">
          <template #header>基础信息</template>
          <el-form-item label="Slug" prop="slug">
            <el-input v-model="form.slug" placeholder="coastal-life-kit" />
          </el-form-item>
          <el-form-item label="系列名称" prop="title.zh">
            <I18nInput v-model="form.title" />
          </el-form-item>
          <el-form-item label="系列描述">
            <I18nInput v-model="form.body" type="textarea" :rows="4" placeholder="系列简短描述" />
          </el-form-item>
          <el-form-item label="封面图">
            <ImageUpload v-model="form.image" :limit="1" />
          </el-form-item>
        </el-card>

        <!-- 关联路线 -->
        <el-card shadow="never" class="section-card">
          <template #header>关联路线</template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="路线名称" prop="routeName">
                <el-input v-model="form.routeName" placeholder="e.g. 广府文化行" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="路线 Slug">
                <el-input v-model="form.routeSlug" placeholder="e.g. guangfu-culture-tour" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 发布设置 -->
        <el-card shadow="never" class="section-card">
          <template #header>发布设置</template>
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
