<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productsApi } from '@/api/products'
import { collectionsApi } from '@/api/collections'
import ImageUpload from '@/components/ImageUpload.vue'
import type { ProductFormData, ProductStatus } from '@/types/product'
import type { StoreCollection } from '@/types/collection'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)

// 系列下拉选项
const collectionOptions = ref<{ id: string; title: string }[]>([])

const form = reactive<ProductFormData>({
  slug: '',
  name: '',
  nameEn: '',
  collectionId: '',
  collectionName: '',
  price: 0,
  currency: 'SGD',
  tag: '',
  image: '',
  story: '',
  storyEn: '',
  material: '',
  materialEn: '',
  dimensions: '',
  origin: '',
  care: '',
  careEn: '',
  gallery: [],
  stock: 0,
  originTrace: {
    location: '',
    citySlug: '',
    cityName: '',
    materialSource: '',
    craftTradition: '',
    process: '',
    mapAdcode: 0,
  },
  status: 'off_shelf',
})

const rules = {
  slug: [{ required: true, message: '请输入 slug', trigger: 'blur' }],
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  collectionId: [{ required: true, message: '请选择所属系列', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

// 加载系列列表
async function fetchCollections() {
  try {
    const res = await collectionsApi.getCollections({ page: 1, pageSize: 100 })
    collectionOptions.value = res.data.data.items.map((c: StoreCollection) => ({
      id: c.id,
      title: c.title,
    }))
  } catch { /* ignore */ }
}

onMounted(async () => {
  await fetchCollections()
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    loading.value = true
    try {
      const res = await productsApi.getProduct(id)
      const data = res.data.data
      Object.assign(form, {
        slug: data.slug,
        name: data.name,
        nameEn: data.nameEn || '',
        collectionId: data.collectionId,
        collectionName: data.collectionName || '',
        price: data.price,
        currency: data.currency || 'SGD',
        tag: data.tag || '',
        image: data.image || '',
        story: data.story || '',
        storyEn: data.storyEn || '',
        material: data.material || '',
        materialEn: data.materialEn || '',
        dimensions: data.dimensions || '',
        origin: data.origin || '',
        care: data.care || '',
        careEn: data.careEn || '',
        gallery: data.gallery || [],
        stock: data.stock ?? 0,
        originTrace: {
          location: data.originTrace?.location || '',
          citySlug: data.originTrace?.citySlug || '',
          cityName: data.originTrace?.cityName || '',
          materialSource: data.originTrace?.materialSource || '',
          craftTradition: data.originTrace?.craftTradition || '',
          process: data.originTrace?.process || '',
          mapAdcode: data.originTrace?.mapAdcode || 0,
        },
        status: data.status || 'off_shelf',
      })
    } finally {
      loading.value = false
    }
  }
})

// 选择系列时自动填充系列名
function handleCollectionChange(val: string) {
  const col = collectionOptions.value.find((c) => c.id === val)
  if (col) {
    form.collectionName = col.title
  }
}

async function handleSave() {
  saving.value = true
  try {
    if (isEdit.value) {
      await productsApi.updateProduct(route.params.id as string, form as any)
      ElMessage.success('商品更新成功')
    } else {
      await productsApi.createProduct(form)
      ElMessage.success('商品创建成功')
    }
    router.push('/admin/shop/products')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/admin/shop/products')
}

const statusLabel = (s: ProductStatus) => (s === 'on_sale' ? '在售' : '下架')
</script>

<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑商品' : '新增商品' }}</h2>
    </div>

    <el-form :model="form" :rules="rules" label-width="160px" style="max-width: 900px">
      <!-- ═══ 基本信息 ═══ -->
      <el-divider content-position="left">基本信息</el-divider>
      <el-form-item label="slug" prop="slug">
        <el-input v-model="form.slug" placeholder="URL 标识（如 seashell-jewelry-box）" />
      </el-form-item>
      <el-form-item label="商品名称（中）" prop="name">
        <el-input v-model="form.name" placeholder="中文名称" />
      </el-form-item>
      <el-form-item label="商品名称（英）">
        <el-input v-model="form.nameEn" placeholder="English name" />
      </el-form-item>
      <el-form-item label="所属系列" prop="collectionId">
        <el-select
          v-model="form.collectionId"
          placeholder="请选择系列"
          style="width: 100%"
          @change="handleCollectionChange"
        >
          <el-option
            v-for="col in collectionOptions"
            :key="col.id"
            :label="col.title"
            :value="col.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标签">
        <el-input v-model="form.tag" placeholder="如 Handcrafted / Premium / Artisan" />
      </el-form-item>

      <!-- ═══ 价格与库存 ═══ -->
      <el-divider content-position="left">价格与库存</el-divider>
      <el-form-item label="币种">
        <el-select v-model="form.currency" style="width: 160px">
          <el-option label="SGD" value="SGD" />
          <el-option label="USD" value="USD" />
          <el-option label="CNY" value="CNY" />
          <el-option label="EUR" value="EUR" />
        </el-select>
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 200px" />
      </el-form-item>
      <el-form-item label="库存">
        <el-input-number v-model="form.stock" :min="0" style="width: 200px" />
      </el-form-item>

      <!-- ═══ 图片 ═══ -->
      <el-divider content-position="left">图片</el-divider>
      <el-form-item label="主图">
        <ImageUpload v-model="form.image" :limit="1" mode="single" />
      </el-form-item>
      <el-form-item label="详情图集">
        <ImageUpload v-model="form.gallery" :multiple="true" :limit="10" mode="multiple" />
      </el-form-item>

      <!-- ═══ 商品详情 ═══ -->
      <el-divider content-position="left">商品详情</el-divider>
      <el-form-item label="商品故事（中）">
        <el-input v-model="form.story" type="textarea" :rows="5" placeholder="中文故事/介绍" />
      </el-form-item>
      <el-form-item label="商品故事（英）">
        <el-input v-model="form.storyEn" type="textarea" :rows="5" placeholder="English story / description" />
      </el-form-item>
      <el-form-item label="材质（中）">
        <el-input v-model="form.material" placeholder="如：楠木底胎 / 天然贝壳 / 黄铜合页" />
      </el-form-item>
      <el-form-item label="材质（英）">
        <el-input v-model="form.materialEn" placeholder="e.g. Nanmu wood base / Natural seashells / Brass hinges" />
      </el-form-item>
      <el-form-item label="尺寸">
        <el-input v-model="form.dimensions" placeholder="如：18cm × 12cm × 8cm" />
      </el-form-item>
      <el-form-item label="产地">
        <el-input v-model="form.origin" placeholder="如：广东湛江" />
      </el-form-item>
      <el-form-item label="保养说明（中）">
        <el-input v-model="form.care" type="textarea" :rows="3" placeholder="中文保养说明" />
      </el-form-item>
      <el-form-item label="保养说明（英）">
        <el-input v-model="form.careEn" type="textarea" :rows="3" placeholder="English care instructions" />
      </el-form-item>

      <!-- ═══ 产地溯源 ★★★ 核心嵌套编辑 ★★★ ═══ -->
      <el-divider content-position="left">
        <span style="font-weight: 700">产地溯源 (Origin Trace)</span>
      </el-divider>

      <el-card shadow="hover" class="origin-trace-card">
        <template #header>
          <div class="origin-trace-header">
            <span>产地溯源信息</span>
            <el-tag size="small" type="info">7个子字段 - 用于前端产地溯源展示</el-tag>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产地位置">
              <el-input v-model="form.originTrace.location" placeholder="如：湛江市东海岛东简镇" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地图区域代码">
              <el-input-number v-model="form.originTrace.mapAdcode" :min="0" placeholder="如：440800" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="城市 slug">
              <el-input v-model="form.originTrace.citySlug" placeholder="如：zhanjiang" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市名称">
              <el-input v-model="form.originTrace.cityName" placeholder="如：湛江" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="原料来源">
          <el-input
            v-model="form.originTrace.materialSource"
            type="textarea"
            :rows="3"
            placeholder="描述原料来源地、采集方式、品种等信息"
          />
        </el-form-item>

        <el-form-item label="工艺传统">
          <el-input
            v-model="form.originTrace.craftTradition"
            type="textarea"
            :rows="3"
            placeholder="描述制作工艺的历史渊源、非遗等级、技艺特色"
          />
        </el-form-item>

        <el-form-item label="制作过程">
          <el-input
            v-model="form.originTrace.process"
            type="textarea"
            :rows="3"
            placeholder="描述从原料到成品的完整制作流程及耗时"
          />
        </el-form-item>
      </el-card>

      <!-- ═══ 发布设置 ═══ -->
      <el-divider content-position="left">发布设置</el-divider>
      <el-form-item label="上架状态">
        <el-radio-group v-model="form.status">
          <el-radio value="on_sale">在售</el-radio>
          <el-radio value="off_shelf">下架</el-radio>
        </el-radio-group>
        <div style="color: #909399; font-size: 12px; margin-top: 4px">
          当前状态：{{ statusLabel(form.status) }}
        </div>
      </el-form-item>

      <!-- ═══ 操作按钮 ═══ -->
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ isEdit ? '保存修改' : '创建商品' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0; font-size: 20px; }

.origin-trace-card {
  margin-bottom: 16px;
  border-left: 3px solid #409eff;
}

.origin-trace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
