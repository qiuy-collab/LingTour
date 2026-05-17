<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { collectionsApi } from '@/api/collections'
import ImageUpload from '@/components/ImageUpload.vue'
import I18nInput from '@/components/I18nInput.vue'
import type { CollectionFormData } from '@/types/collection'
import { toI18n } from '@/types/common'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)

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
  slug: [{ required: true, message: '请输入 slug', trigger: 'blur' }],
  'title.zh': [{ required: true, message: '请输入中文名称', trigger: 'blur' }],
  routeName: [{ required: true, message: '请输入关联路线名', trigger: 'blur' }],
}

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    loading.value = true
    try {
      const res = await collectionsApi.getCollection(id)
      const data = res.data.data
      Object.assign(form, {
        slug: data.slug,
        title: toI18n(data.title),
        routeName: data.routeName,
        routeSlug: data.routeSlug || '',
        image: data.image,
        body: data.body || '',
        sortOrder: data.sortOrder || 0,
        published: data.published !== undefined ? data.published : false,
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
      await collectionsApi.updateCollection(route.params.id as string, form)
      ElMessage.success('系列更新成功')
    } else {
      await collectionsApi.createCollection(form)
      ElMessage.success('系列创建成功')
    }
    router.push('/admin/shop/collections')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/admin/shop/collections')
}
</script>

<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑系列' : '新增系列' }}</h2>
    </div>

    <el-form :model="form" :rules="rules" label-width="140px" style="max-width: 800px">
      <el-divider content-position="left">基本信息</el-divider>
      <el-form-item label="slug" prop="slug">
        <el-input v-model="form.slug" placeholder="URL 标识 (e.g. coastal-life-kit)" />
      </el-form-item>
      <el-form-item label="系列名称">
        <I18nInput v-model="form.title" />
      </el-form-item>
      <el-form-item label="关联路线名" prop="routeName">
        <el-input v-model="form.routeName" placeholder="e.g. 广府文化行" />
      </el-form-item>
      <el-form-item label="关联路线 slug">
        <el-input v-model="form.routeSlug" placeholder="e.g. guangfu-culture-tour" />
      </el-form-item>
      <el-form-item label="封面图">
        <ImageUpload v-model="form.image" :limit="1" />
      </el-form-item>
      <el-form-item label="系列描述">
        <I18nInput v-model="form.body" type="textarea" :rows="4" />
      </el-form-item>

      <el-divider content-position="left">其他设置</el-divider>
      <el-form-item label="排序权重">
        <el-input-number v-model="form.sortOrder" :min="0" />
      </el-form-item>
      <el-form-item label="发布状态">
        <el-switch
          v-model="form.published"
          active-text="已发布"
          inactive-text="草稿"
        />
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
