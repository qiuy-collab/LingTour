<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { collectionsApi } from '@/api/collections'
import ImageUpload from '@/components/ImageUpload.vue'
import type { CollectionFormData } from '@/types/collection'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)

const form = reactive<CollectionFormData>({
  slug: '',
  title: '',
  titleEn: '',
  routeName: '',
  routeSlug: '',
  image: '',
  body: '',
  bodyEn: '',
  productCount: 0,
  status: 'draft',
})

const rules = {
  slug: [{ required: true, message: '请输入 slug', trigger: 'blur' }],
  title: [{ required: true, message: '请输入系列名称', trigger: 'blur' }],
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
        title: data.title,
        titleEn: data.titleEn || '',
        routeName: data.routeName,
        routeSlug: data.routeSlug || '',
        image: data.image,
        body: data.body,
        bodyEn: data.bodyEn || '',
        productCount: data.productCount,
        status: data.status,
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
        <el-input v-model="form.slug" placeholder="URL 标识（如 coastal-life-kit）" />
      </el-form-item>
      <el-form-item label="系列名称（中）" prop="title">
        <el-input v-model="form.title" placeholder="中文名称" />
      </el-form-item>
      <el-form-item label="系列名称（英）">
        <el-input v-model="form.titleEn" placeholder="English title" />
      </el-form-item>
      <el-form-item label="关联路线" prop="routeName">
        <el-input v-model="form.routeName" placeholder="路线名称" />
      </el-form-item>
      <el-form-item label="关联路线 slug">
        <el-input v-model="form.routeSlug" placeholder="路线 slug" />
      </el-form-item>
      <el-form-item label="封面图">
        <ImageUpload v-model="form.image" :limit="1" mode="single" />
      </el-form-item>
      <el-form-item label="系列描述（中）">
        <el-input v-model="form.body" type="textarea" :rows="4" placeholder="中文描述" />
      </el-form-item>
      <el-form-item label="系列描述（英）">
        <el-input v-model="form.bodyEn" type="textarea" :rows="4" placeholder="English description" />
      </el-form-item>

      <el-divider content-position="left">其他设置</el-divider>
      <el-form-item label="商品数量">
        <el-input-number v-model="form.productCount" :min="0" />
      </el-form-item>
      <el-form-item label="发布状态">
        <el-radio-group v-model="form.status">
          <el-radio value="published">已发布</el-radio>
          <el-radio value="draft">草稿</el-radio>
        </el-radio-group>
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
