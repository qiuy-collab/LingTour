<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Top, Bottom, ArrowLeft } from '@element-plus/icons-vue'
import { citiesApi } from '@/api/cities'
import type { CitySection, CityFormData } from '@/types/city'
import ImageUpload from '@/components/ImageUpload.vue'

const router = useRouter()
const route = useRoute()

// ─── 模式判断 ──────────────────────────────
const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => (isEdit.value ? '编辑城市' : '新增城市'))

// ─── 表单数据 ──────────────────────────────
const loading = ref(false)
const saving = ref(false)

const form = reactive<CityFormData>({
  slug: '',
  name: '',
  nameEn: '',
  regionLabel: '',
  adcode: 0,
  heroImage: '',
  heroNarrative: '',
  tags: [],
  editorIntro: '',
  galleryImages: [],
  foodTitle: '',
  foodTitleEn: '',
  foodDescription: '',
  foodImages: [],
  sections: [],
  stats: [],
  quotes: [],
  breathImages: [],
  status: 'draft',
})

// ─── 动态字段辅助 ──────────────────────────
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

const newStat = ref('')
function addStat() {
  const s = newStat.value.trim()
  if (s) {
    form.stats.push(s)
    newStat.value = ''
  }
}
function removeStat(index: number) {
  form.stats.splice(index, 1)
}

const newQuote = ref('')
function addQuote() {
  const q = newQuote.value.trim()
  if (q) {
    form.quotes.push(q)
    newQuote.value = ''
  }
}
function removeQuote(index: number) {
  form.quotes.splice(index, 1)
}

// ─── Sections 段落管理 ─────────────────────
function generateSection(): CitySection {
  const maxSort = form.sections.length
    ? Math.max(...form.sections.map((s) => s.sortOrder))
    : 0
  return {
    id: 'sec-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
    title: '',
    body: '',
    image: '',
    statLabel: '',
    statValue: '',
    breathImage: '',
    breathQuote: '',
    sortOrder: maxSort + 1,
  }
}

function addSection() {
  form.sections.push(generateSection())
}

function removeSection(index: number) {
  form.sections.splice(index, 1)
}

function moveSection(index: number, direction: 'up' | 'down') {
  const arr = form.sections
  if (direction === 'up' && index > 0) {
    ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
    // 交换 sortOrder
    ;[arr[index - 1].sortOrder, arr[index].sortOrder] = [
      arr[index].sortOrder,
      arr[index - 1].sortOrder,
    ]
  } else if (direction === 'down' && index < arr.length - 1) {
    ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
    ;[arr[index].sortOrder, arr[index + 1].sortOrder] = [
      arr[index + 1].sortOrder,
      arr[index].sortOrder,
    ]
  }
}

// ─── 加载编辑数据 ──────────────────────────
onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const res = await citiesApi.getCity(route.params.id as string)
      const city = res.data.data
      Object.assign(form, {
        id: city.id,
        slug: city.slug,
        name: city.name,
        nameEn: city.nameEn,
        regionLabel: city.regionLabel,
        adcode: city.adcode,
        heroImage: city.heroImage,
        heroNarrative: city.heroNarrative,
        tags: [...city.tags],
        editorIntro: city.editorIntro,
        galleryImages: [...city.galleryImages],
        foodTitle: city.foodTitle,
        foodTitleEn: city.foodTitleEn,
        foodDescription: city.foodDescription,
        foodImages: [...city.foodImages],
        sections: city.sections.map((s) => ({ ...s })),
        stats: [...city.stats],
        quotes: [...city.quotes],
        breathImages: [...city.breathImages],
        status: city.status,
      })
    } catch {
      ElMessage.error('加载城市数据失败')
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
      await citiesApi.updateCity(route.params.id as string, form)
      ElMessage.success('城市更新成功')
    } else {
      await citiesApi.createCity(form)
      ElMessage.success('城市创建成功')
    }
    router.push('/admin/cities')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/admin/cities')
}
</script>

<template>
  <div class="city-edit" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="handleCancel">返回</el-button>
      <h2>{{ pageTitle }}</h2>
    </div>

    <el-form label-width="120px" label-position="top">
      <!-- ============ 基本信息 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">基本信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Slug" required>
              <el-input v-model="form.slug" placeholder="URL 标识，如 guangzhou" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市名（中文）" required>
              <el-input v-model="form.name" placeholder="如：广州" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市名（英文）" required>
              <el-input v-model="form.nameEn" placeholder="如：Guangzhou" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地区标签">
              <el-input v-model="form.regionLabel" placeholder="如：Pearl River Delta" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
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

      <!-- ============ 头图区 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">头图区</span>
        </template>
        <el-form-item label="头图">
          <ImageUpload v-model="form.heroImage" :multiple="false" />
        </el-form-item>
        <el-form-item label="头图叙述文案">
          <el-input
            v-model="form.heroNarrative"
            type="textarea"
            :rows="3"
            placeholder="头图展示的叙述文案，支持中文"
          />
        </el-form-item>
      </el-card>

      <!-- ============ 标签区 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">标签与推荐语</span>
        </template>
        <el-form-item label="标签集">
          <div class="tag-edit-area">
            <div class="tag-list">
              <el-tag
                v-for="(tag, idx) in form.tags"
                :key="tag"
                closable
                size="default"
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
        <el-form-item label="编辑推荐语">
          <el-input
            v-model="form.editorIntro"
            type="textarea"
            :rows="3"
            placeholder="编辑推荐语/摘要文案"
          />
        </el-form-item>
      </el-card>

      <!-- ============ 图片集 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">图片集</span>
        </template>
        <el-form-item label="城市图片集">
          <ImageUpload v-model="form.galleryImages" :multiple="true" :limit="10" />
        </el-form-item>
      </el-card>

      <!-- ============ 美食区 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">美食区</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="美食标题（中文）">
              <el-input v-model="form.foodTitle" placeholder="如：不只是早茶" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="美食标题（英文）">
              <el-input v-model="form.foodTitleEn" placeholder="如：Beyond Dim Sum" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="美食描述">
          <el-input
            v-model="form.foodDescription"
            type="textarea"
            :rows="3"
            placeholder="美食板块描述文案"
          />
        </el-form-item>
        <el-form-item label="美食图片">
          <ImageUpload v-model="form.foodImages" :multiple="true" :limit="10" />
        </el-form-item>
      </el-card>

      <!-- ============ 文章段落 (Sections) ★★★核心★★★ ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <div class="card-header-row">
            <span class="card-title">文章段落 (Sections)</span>
            <el-button type="primary" size="small" :icon="Plus" @click="addSection">
              添加段落
            </el-button>
          </div>
        </template>

        <div v-if="form.sections.length === 0" class="empty-hint">
          暂无段落，点击「添加段落」按钮新增
        </div>

        <div
          v-for="(section, idx) in form.sections"
          :key="section.id"
          class="section-item"
        >
          <el-card shadow="hover">
            <template #header>
              <div class="section-header">
                <span>段落 {{ idx + 1 }} / sortOrder: {{ section.sortOrder }}</span>
                <div class="section-actions">
                  <el-button
                    size="small"
                    :icon="Top"
                    :disabled="idx === 0"
                    @click="moveSection(idx, 'up')"
                  >
                    上移
                  </el-button>
                  <el-button
                    size="small"
                    :icon="Bottom"
                    :disabled="idx === form.sections.length - 1"
                    @click="moveSection(idx, 'down')"
                  >
                    下移
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    :icon="Delete"
                    @click="removeSection(idx)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </template>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="段落标题">
                  <el-input v-model="section.title" placeholder="段落标题" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="数据标签">
                  <el-input v-model="section.statLabel" placeholder="如：连续开放年数" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="数据值">
                  <el-input v-model="section.statValue" placeholder="如：2,000+" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="段落正文">
              <el-input
                v-model="section.body"
                type="textarea"
                :rows="4"
                placeholder="长文章段落正文内容"
              />
            </el-form-item>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="配图">
                  <ImageUpload v-model="section.image" :multiple="false" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="呼吸图">
                  <ImageUpload v-model="section.breathImage" :multiple="false" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="呼吸引语">
                  <el-input
                    v-model="section.breathQuote"
                    placeholder="展示在呼吸图上的引语"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="排序号">
                  <el-input-number
                    v-model="section.sortOrder"
                    :min="1"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>
        </div>

        <div v-if="form.sections.length > 0" class="add-more-row">
          <el-button :icon="Plus" @click="addSection">添加段落</el-button>
        </div>
      </el-card>

      <!-- ============ 数据与引语 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">数据亮点 & 金句引语</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数据亮点">
              <div class="dynamic-list">
                <div
                  v-for="(_stat, idx) in form.stats"
                  :key="idx"
                  class="dynamic-list-item"
                >
                  <el-input v-model="form.stats[idx]" />
                  <el-button
                    type="danger"
                    :icon="Delete"
                    circle
                    size="small"
                    @click="removeStat(idx)"
                  />
                </div>
                <div class="dynamic-input-row">
                  <el-input
                    v-model="newStat"
                    placeholder="新数据亮点"
                    size="small"
                    @keyup.enter="addStat"
                  />
                  <el-button size="small" :icon="Plus" @click="addStat">添加</el-button>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="金句引语">
              <div class="dynamic-list">
                <div
                  v-for="(_quote, idx) in form.quotes"
                  :key="idx"
                  class="dynamic-list-item"
                >
                  <el-input v-model="form.quotes[idx]" />
                  <el-button
                    type="danger"
                    :icon="Delete"
                    circle
                    size="small"
                    @click="removeQuote(idx)"
                  />
                </div>
                <div class="dynamic-input-row">
                  <el-input
                    v-model="newQuote"
                    placeholder="新金句引语"
                    size="small"
                    @keyup.enter="addQuote"
                  />
                  <el-button size="small" :icon="Plus" @click="addQuote">添加</el-button>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- ============ 呼吸图 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">呼吸图片集</span>
        </template>
        <el-form-item label="段落间呼吸图">
          <ImageUpload v-model="form.breathImages" :multiple="true" :limit="10" />
        </el-form-item>
      </el-card>

      <!-- ============ 状态 ============ -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <span class="card-title">发布状态</span>
        </template>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="draft">草稿</el-radio>
            <el-radio value="published">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-card>

      <!-- ============ 保存/取消 ============ -->
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :loading="saving"
          @click="handleSave"
        >
          保存
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.city-edit {
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

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.form-card {
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 标签编辑 */
.tag-edit-area {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  min-height: 32px;
}

.tag-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 动态列表（stats/quotes） */
.dynamic-list {
  width: 100%;
}

.dynamic-list-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.dynamic-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}

/* Sections 段落 */
.section-item {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.empty-hint {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.add-more-row {
  text-align: center;
  margin-top: 16px;
}

/* 保存按钮区 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0;
}
</style>
