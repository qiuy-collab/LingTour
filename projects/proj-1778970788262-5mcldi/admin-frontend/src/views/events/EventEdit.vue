<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { eventsApi } from '@/api/events'
import type { EventFormData } from '@/types/event'
import { EventStatusMap } from '@/types/event'
import ImageUpload from '@/components/ImageUpload.vue'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => (isEdit.value ? '编辑活动' : '新增活动'))

const loading = ref(false)
const saving = ref(false)

const form = reactive<EventFormData>({
  title: '',
  titleEn: '',
  date: '',
  endDate: '',
  city: '',
  citySlug: '',
  adcode: 440100,
  tags: [],
  summary: '',
  summaryEn: '',
  description: '',
  descriptionEn: '',
  relatedRouteSlugs: [],
  image: '',
  status: 'draft',
})

// ─── 动态标签 ──────────────────────────────
const newTag = ref('')
function addTag() {
  const t = newTag.value.trim()
  if (t && !form.tags.includes(t)) {
    form.tags.push(t)
    newTag.value = ''
  }
}
function removeTag(index: number) {
  form.tags.splice(index, 1)
}

// ─── 关联路线输入 ──────────────────────────
const newRouteSlug = ref('')
function addRouteSlug() {
  const s = newRouteSlug.value.trim()
  if (s && !form.relatedRouteSlugs.includes(s)) {
    form.relatedRouteSlugs.push(s)
    newRouteSlug.value = ''
  }
}
function removeRouteSlug(index: number) {
  form.relatedRouteSlugs.splice(index, 1)
}

// ─── 状态选项 ──────────────────────────────
const statusOptions = computed(() => {
  return Object.entries(EventStatusMap).map(([value, label]) => ({ value, label }))
})

// ─── 加载编辑数据 ──────────────────────────
onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const res = await eventsApi.getEvent(route.params.id as string)
      const ev = res.data.data
      Object.assign(form, {
        title: ev.title,
        titleEn: ev.titleEn,
        date: ev.date,
        endDate: ev.endDate || '',
        city: ev.city,
        citySlug: ev.citySlug,
        adcode: ev.adcode,
        tags: [...ev.tags],
        summary: ev.summary,
        summaryEn: ev.summaryEn,
        description: ev.description,
        descriptionEn: ev.descriptionEn,
        relatedRouteSlugs: [...ev.relatedRouteSlugs],
        image: ev.image,
        status: ev.status,
      })
    } catch {
      ElMessage.error('加载活动数据失败')
      router.back()
    } finally {
      loading.value = false
    }
  }
})

// ─── 保存 ──────────────────────────────
async function handleSave() {
  saving.value = true
  try {
    if (isEdit.value) {
      await eventsApi.updateEvent(route.params.id as string, form)
      ElMessage.success('活动更新成功')
    } else {
      await eventsApi.createEvent(form)
      ElMessage.success('活动创建成功')
    }
    router.push('/admin/events')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/admin/events')
}
</script>

<template>
  <div class="edit-page" v-loading="loading">
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="handleCancel">返回</el-button>
      <h2>{{ pageTitle }}</h2>
    </div>

    <el-form label-width="140px" label-position="top">
      <!-- ============ 基本信息 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header><span class="card-title">基本信息</span></template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动名称（中文）" required>
              <el-input v-model="form.title" placeholder="如：潮汕功夫茶文化节" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动名称（英文）" required>
              <el-input v-model="form.titleEn" placeholder="如：Chaoshan Kungfu Tea Festival" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="开始日期" required>
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束日期（可选）">
              <el-date-picker
                v-model="form.endDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="活动状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- ============ 城市信息 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header><span class="card-title">城市信息</span></template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="城市名" required>
              <el-input v-model="form.city" placeholder="如：潮州" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市Slug" required>
              <el-input v-model="form.citySlug" placeholder="如：chaozhou" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="行政区划代码">
              <el-input-number
                v-model="form.adcode"
                :min="0"
                :max="999999"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- ============ 封面与摘要 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header><span class="card-title">封面与摘要</span></template>
        <el-form-item label="封面图">
          <ImageUpload v-model="form.image" :multiple="false" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="摘要（中文）">
              <el-input
                v-model="form.summary"
                type="textarea"
                :rows="2"
                placeholder="活动摘要，展示在列表和卡片中"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="摘要（英文）">
              <el-input
                v-model="form.summaryEn"
                type="textarea"
                :rows="2"
                placeholder="English summary for list and card display"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- ============ 详细描述 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header><span class="card-title">详细描述</span></template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="描述（中文）">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="6"
                placeholder="活动详细描述，支持换行。每行以 • 开头可生成列表"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="描述（英文）">
              <el-input
                v-model="form.descriptionEn"
                type="textarea"
                :rows="6"
                placeholder="Detailed description in English"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- ============ 标签与关联 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header><span class="card-title">标签与关联路线</span></template>
        <el-form-item label="活动标签">
          <div class="tag-edit-area">
            <div class="tag-list">
              <el-tag
                v-for="(tag, idx) in form.tags"
                :key="tag"
                closable
                @close="removeTag(idx)"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="tag-input-row">
              <el-input
                v-model="newTag"
                placeholder="输入标签按回车添加"
                size="small"
                style="width: 200px"
                @keyup.enter="addTag"
              />
              <el-button size="small" :icon="Plus" @click="addTag">添加</el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="关联路线Slug">
          <div class="tag-edit-area">
            <div class="tag-list">
              <el-tag
                v-for="(slug, idx) in form.relatedRouteSlugs"
                :key="slug"
                type="success"
                closable
                @close="removeRouteSlug(idx)"
              >
                {{ slug }}
              </el-tag>
            </div>
            <div class="tag-input-row">
              <el-input
                v-model="newRouteSlug"
                placeholder="输入路线slug按回车添加"
                size="small"
                style="width: 280px"
                @keyup.enter="addRouteSlug"
              />
              <el-button size="small" :icon="Plus" @click="addRouteSlug">添加</el-button>
            </div>
          </div>
        </el-form-item>
      </el-card>

      <!-- ============ 保存 ============ -->
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.edit-page {
  max-width: 1100px;
  margin: 0 auto;
  padding-bottom: 40px;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.page-header h2 { margin: 0; font-size: 20px; color: #303133; }
.form-card { margin-bottom: 20px; }
.card-title { font-weight: 600; font-size: 15px; }

.tag-edit-area { width: 100%; }
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; min-height: 32px; }
.tag-input-row { display: flex; gap: 8px; align-items: center; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0;
}
</style>
