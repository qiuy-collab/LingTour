<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { homeApi } from '@/api/home'
import type { HomeConfig } from '@/types/home'
import { HomeConfigBlockLabels } from '@/types/home'
import { toI18n } from '@/types/common'
import ImageUpload from '@/components/ImageUpload.vue'
import I18nInput from '@/components/I18nInput.vue'

const loading = ref(false)
const saving = ref(false)

const config = reactive<HomeConfig>({
  heroStats: [],
  trustMetrics: [],
  entryCards: [],
  featuredRoutes: [],
  cultureHighlights: [],
  testimonials: [],
})

const activeBlocks = ref<string[]>(['heroStats'])

// ─── 加载配置 ──────────────────────────────
onMounted(async () => {
  loading.value = true
  try {
    const res = await homeApi.getHomeConfig()
    const data = res.data.data
    Object.assign(config, {
      heroStats: (data.heroStats || []).map((s: any) => ({ title: toI18n(s.title), description: toI18n(s.description) })),
      trustMetrics: (data.trustMetrics || []).map((m: any) => ({ value: m.value || '', label: toI18n(m.label) })),
      entryCards: (data.entryCards || []).map((c: any) => ({ title: toI18n(c.title), description: toI18n(c.description), image: c.image || '', link: c.link || '' })),
      featuredRoutes: data.featuredRoutes || [],
      cultureHighlights: (data.cultureHighlights || []).map((h: any) => ({ title: toI18n(h.title), description: toI18n(h.description), image: h.image || '', citySlug: h.citySlug || '' })),
      testimonials: (data.testimonials || []).map((t: any) => ({ quote: toI18n(t.quote), author: toI18n(t.author), avatar: t.avatar || '' })),
    })
  } catch {
    ElMessage.error('加载首页配置失败')
  } finally {
    loading.value = false
  }
})

// ─── 折叠面板 ──────────────────────────────
function toggleBlock(block: string) {
  const idx = activeBlocks.value.indexOf(block)
  if (idx >= 0) {
    activeBlocks.value.splice(idx, 1)
  } else {
    activeBlocks.value.push(block)
  }
}

// ─── Hero统计卡片 ──────────────────────────
function addHeroStat() {
  config.heroStats.push({ title: { zh: '', en: '' }, description: { zh: '', en: '' } })
}
function removeHeroStat(index: number) {
  config.heroStats.splice(index, 1)
}

// ─── 信任指标 ──────────────────────────
function addTrustMetric() {
  config.trustMetrics.push({ value: '', label: { zh: '', en: '' } })
}
function removeTrustMetric(index: number) {
  config.trustMetrics.splice(index, 1)
}

// ─── 入口卡片 ──────────────────────────
function addEntryCard() {
  config.entryCards.push({ title: { zh: '', en: '' }, description: { zh: '', en: '' }, image: '', link: '' })
}
function removeEntryCard(index: number) {
  config.entryCards.splice(index, 1)
}

// ─── 精选路线 ──────────────────────────
const newRouteSlug = ref('')
function addFeaturedRoute() {
  const s = newRouteSlug.value.trim()
  if (s && !config.featuredRoutes.includes(s)) {
    config.featuredRoutes.push(s)
    newRouteSlug.value = ''
  }
}
function removeFeaturedRoute(index: number) {
  config.featuredRoutes.splice(index, 1)
}

// ─── 文化亮点 ──────────────────────────
function addCultureHighlight() {
  config.cultureHighlights.push({ title: { zh: '', en: '' }, description: { zh: '', en: '' }, image: '', citySlug: '' })
}
function removeCultureHighlight(index: number) {
  config.cultureHighlights.splice(index, 1)
}

// ─── 评价展示 ──────────────────────────
function addTestimonial() {
  config.testimonials.push({ quote: { zh: '', en: '' }, author: { zh: '', en: '' }, avatar: '' })
}
function removeTestimonial(index: number) {
  config.testimonials.splice(index, 1)
}

// ─── 保存 ──────────────────────────────
async function handleSave() {
  saving.value = true
  try {
    await homeApi.updateHomeConfig({ ...config })
    ElMessage.success('首页配置保存成功')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="home-config-page" v-loading="loading">
    <div class="page-header">
      <h2>首页内容管理</h2>
      <el-button type="primary" :loading="saving" @click="handleSave">保存配置</el-button>
    </div>

    <p class="page-desc">配置凌云游首页的六大内容区块。修改后点击「保存配置」即可生效。</p>

    <!-- ================================================ -->
    <!-- 1. Hero 统计卡片 -->
    <!-- ================================================ -->
    <el-card shadow="never" class="block-card">
      <template #header>
        <div
          class="block-header"
          @click="toggleBlock('heroStats')"
          style="cursor: pointer"
        >
          <span class="block-title">{{ HomeConfigBlockLabels.heroStats }}</span>
          <span class="block-count">{{ config.heroStats.length }} 项</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('heroStats')">
        <div
          v-for="(item, idx) in config.heroStats"
          :key="idx"
          class="block-item"
        >
          <div class="block-item-header">
            <span>卡片 #{{ idx + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="removeHeroStat(idx)">删除</el-button>
          </div>
          <el-form-item label="标题">
            <I18nInput v-model="item.title" placeholder="如：12+" />
          </el-form-item>
          <el-form-item label="描述">
            <I18nInput v-model="item.description" type="textarea" :rows="2" placeholder="如：深度探索城市" />
          </el-form-item>
        </div>
        <div v-if="config.heroStats.length === 0" class="empty-hint">暂无数据</div>
        <el-button :icon="Plus" size="small" @click="addHeroStat" style="margin-top: 12px">添加卡片</el-button>
      </div>
    </el-card>

    <!-- ================================================ -->
    <!-- 2. 信任指标 -->
    <!-- ================================================ -->
    <el-card shadow="never" class="block-card">
      <template #header>
        <div
          class="block-header"
          @click="toggleBlock('trustMetrics')"
          style="cursor: pointer"
        >
          <span class="block-title">{{ HomeConfigBlockLabels.trustMetrics }}</span>
          <span class="block-count">{{ config.trustMetrics.length }} 项</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('trustMetrics')">
        <div
          v-for="(item, idx) in config.trustMetrics"
          :key="idx"
          class="block-item"
        >
          <div class="block-item-header">
            <span>指标 #{{ idx + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="removeTrustMetric(idx)">删除</el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="数值">
                <el-input v-model="item.value" placeholder="如：100%" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="标签">
                <I18nInput v-model="item.label" placeholder="如：本地团队" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-if="config.trustMetrics.length === 0" class="empty-hint">暂无数据</div>
        <el-button :icon="Plus" size="small" @click="addTrustMetric" style="margin-top: 12px">添加指标</el-button>
      </div>
    </el-card>

    <!-- ================================================ -->
    <!-- 3. 入口卡片 -->
    <!-- ================================================ -->
    <el-card shadow="never" class="block-card">
      <template #header>
        <div
          class="block-header"
          @click="toggleBlock('entryCards')"
          style="cursor: pointer"
        >
          <span class="block-title">{{ HomeConfigBlockLabels.entryCards }}</span>
          <span class="block-count">{{ config.entryCards.length }} 项</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('entryCards')">
        <div
          v-for="(item, idx) in config.entryCards"
          :key="idx"
          class="block-item"
        >
          <div class="block-item-header">
            <span>入口 #{{ idx + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="removeEntryCard(idx)">删除</el-button>
          </div>
          <el-form-item label="标题">
            <I18nInput v-model="item.title" placeholder="如：城市文化" />
          </el-form-item>
          <el-form-item label="描述">
            <I18nInput v-model="item.description" type="textarea" :rows="2" placeholder="中文描述" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="图片">
                <ImageUpload v-model="item.image" :multiple="false" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="链接">
                <el-input v-model="item.link" placeholder="如：/culture" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-if="config.entryCards.length === 0" class="empty-hint">暂无数据</div>
        <el-button :icon="Plus" size="small" @click="addEntryCard" style="margin-top: 12px">添加入口</el-button>
      </div>
    </el-card>

    <!-- ================================================ -->
    <!-- 4. 精选路线 -->
    <!-- ================================================ -->
    <el-card shadow="never" class="block-card">
      <template #header>
        <div
          class="block-header"
          @click="toggleBlock('featuredRoutes')"
          style="cursor: pointer"
        >
          <span class="block-title">{{ HomeConfigBlockLabels.featuredRoutes }}</span>
          <span class="block-count">{{ config.featuredRoutes.length }} 条</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('featuredRoutes')">
        <div class="tag-list" style="margin-bottom: 12px">
          <el-tag
            v-for="(slug, idx) in config.featuredRoutes"
            :key="slug"
            closable
            type="success"
            @close="removeFeaturedRoute(idx)"
          >
            {{ slug }}
          </el-tag>
        </div>
        <div v-if="config.featuredRoutes.length === 0" class="empty-hint">暂无精选路线</div>
        <div class="tag-input-row">
          <el-input
            v-model="newRouteSlug"
            placeholder="输入路线 slug 按回车添加"
            size="small"
            style="width: 300px"
            @keyup.enter="addFeaturedRoute"
          />
          <el-button size="small" :icon="Plus" @click="addFeaturedRoute">添加</el-button>
        </div>
      </div>
    </el-card>

    <!-- ================================================ -->
    <!-- 5. 文化亮点 -->
    <!-- ================================================ -->
    <el-card shadow="never" class="block-card">
      <template #header>
        <div
          class="block-header"
          @click="toggleBlock('cultureHighlights')"
          style="cursor: pointer"
        >
          <span class="block-title">{{ HomeConfigBlockLabels.cultureHighlights }}</span>
          <span class="block-count">{{ config.cultureHighlights.length }} 项</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('cultureHighlights')">
        <div
          v-for="(item, idx) in config.cultureHighlights"
          :key="idx"
          class="block-item"
        >
          <div class="block-item-header">
            <span>亮点 #{{ idx + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="removeCultureHighlight(idx)">删除</el-button>
          </div>
          <el-form-item label="标题">
            <I18nInput v-model="item.title" placeholder="如：潮汕功夫茶" />
          </el-form-item>
          <el-form-item label="描述">
            <I18nInput v-model="item.description" type="textarea" :rows="2" placeholder="中文描述" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="图片">
                <ImageUpload v-model="item.image" :multiple="false" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="城市Slug">
                <el-input v-model="item.citySlug" placeholder="如：chaozhou" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-if="config.cultureHighlights.length === 0" class="empty-hint">暂无数据</div>
        <el-button :icon="Plus" size="small" @click="addCultureHighlight" style="margin-top: 12px">添加亮点</el-button>
      </div>
    </el-card>

    <!-- ================================================ -->
    <!-- 6. 评价展示 -->
    <!-- ================================================ -->
    <el-card shadow="never" class="block-card">
      <template #header>
        <div
          class="block-header"
          @click="toggleBlock('testimonials')"
          style="cursor: pointer"
        >
          <span class="block-title">{{ HomeConfigBlockLabels.testimonials }}</span>
          <span class="block-count">{{ config.testimonials.length }} 项</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('testimonials')">
        <div
          v-for="(item, idx) in config.testimonials"
          :key="idx"
          class="block-item"
        >
          <div class="block-item-header">
            <span>评价 #{{ idx + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="removeTestimonial(idx)">删除</el-button>
          </div>
          <el-form-item label="评价内容">
            <I18nInput v-model="item.quote" type="textarea" :rows="3" placeholder="中文评价内容" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="16">
              <el-form-item label="作者">
                <I18nInput v-model="item.author" placeholder="如：李女士" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="头像">
                <ImageUpload v-model="item.avatar" :multiple="false" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-if="config.testimonials.length === 0" class="empty-hint">暂无数据</div>
        <el-button :icon="Plus" size="small" @click="addTestimonial" style="margin-top: 12px">添加评价</el-button>
      </div>
    </el-card>

    <!-- 底部保存 -->
    <div class="form-actions">
      <el-button type="primary" size="large" :loading="saving" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<style scoped>
.home-config-page {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 40px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.page-header h2 { margin: 0; font-size: 20px; }
.page-desc { color: #909399; margin-bottom: 20px; font-size: 14px; }

.block-card { margin-bottom: 16px; }
.block-header { display: flex; justify-content: space-between; align-items: center; }
.block-title { font-weight: 600; font-size: 15px; }
.block-count { font-size: 12px; color: #909399; }

.block-item {
  padding: 12px;
  margin-bottom: 12px;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
.block-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}
.empty-hint { text-align: center; color: #c0c4cc; padding: 24px 0; }

.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-input-row { display: flex; gap: 8px; align-items: center; }

.form-actions {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}
</style>
