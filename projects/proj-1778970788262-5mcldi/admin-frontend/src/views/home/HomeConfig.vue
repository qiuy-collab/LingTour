<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { homeApi } from '@/api/home'
import { routesApi } from '@/api/routes'
import { citiesApi } from '@/api/cities'
import type { HomeConfig } from '@/types/home'
import { HomeConfigBlockLabels } from '@/types/home'
import { pickI18n, toI18n } from '@/types/common'
import ImageUpload from '@/components/ImageUpload.vue'
import I18nInput from '@/components/I18nInput.vue'

const loading = ref(false)
const saving = ref(false)
const routeOptions = ref<Array<{ slug: string; title: string }>>([])
const cityOptions = ref<Array<{ slug: string; name: string }>>([])

const config = reactive<HomeConfig>({
  heroStats: [],
  trustMetrics: [],
  entryCards: [],
  featuredRoutes: [],
  cultureHighlights: [],
  testimonials: [],
})

const activeBlocks = ref<string[]>(['heroStats'])

onMounted(async () => {
  loading.value = true
  try {
    const [routeRes, cityRes, homeRes] = await Promise.all([
      routesApi.getRoutes({ page: 1, pageSize: 200 }),
      citiesApi.getCities({ page: 1, pageSize: 200 }),
      homeApi.getHomeConfig(),
    ])

    routeOptions.value = (routeRes.data.data.items || []).map((item: any) => ({
      slug: item.slug,
      title: pickI18n(item.title) || item.slug,
    }))

    cityOptions.value = (cityRes.data.data.items || []).map((item: any) => ({
      slug: item.slug,
      name: pickI18n(item.name) || item.slug,
    }))

    const data = homeRes.data.data
    Object.assign(config, {
      heroStats: (data.heroStats || []).map((s: any) => ({
        title: toI18n(s.title),
        description: toI18n(s.description),
      })),
      trustMetrics: (data.trustMetrics || []).map((m: any) => ({
        value: m.value || '',
        label: toI18n(m.label),
      })),
      entryCards: (data.entryCards || []).map((c: any) => ({
        title: toI18n(c.title),
        description: toI18n(c.description),
        image: c.image || '',
        link: c.link || '',
      })),
      featuredRoutes: data.featuredRoutes || [],
      cultureHighlights: (data.cultureHighlights || []).map((h: any) => ({
        title: toI18n(h.title),
        description: toI18n(h.description),
        image: h.image || '',
        citySlug: h.citySlug || '',
      })),
      testimonials: (data.testimonials || []).map((t: any) => ({
        quote: toI18n(t.quote),
        author: toI18n(t.author),
        avatar: t.avatar || '',
      })),
    })
  } catch {
    ElMessage.error('加载首页配置失败')
  } finally {
    loading.value = false
  }
})

function toggleBlock(block: string) {
  const index = activeBlocks.value.indexOf(block)
  if (index >= 0) activeBlocks.value.splice(index, 1)
  else activeBlocks.value.push(block)
}

function addHeroStat() {
  config.heroStats.push({ title: { zh: '', en: '' }, description: { zh: '', en: '' } })
}

function removeHeroStat(index: number) {
  config.heroStats.splice(index, 1)
}

function addTrustMetric() {
  config.trustMetrics.push({ value: '', label: { zh: '', en: '' } })
}

function removeTrustMetric(index: number) {
  config.trustMetrics.splice(index, 1)
}

function addEntryCard() {
  config.entryCards.push({ title: { zh: '', en: '' }, description: { zh: '', en: '' }, image: '', link: '' })
}

function removeEntryCard(index: number) {
  config.entryCards.splice(index, 1)
}

function addCultureHighlight() {
  config.cultureHighlights.push({ title: { zh: '', en: '' }, description: { zh: '', en: '' }, image: '', citySlug: '' })
}

function removeCultureHighlight(index: number) {
  config.cultureHighlights.splice(index, 1)
}

function addTestimonial() {
  config.testimonials.push({ quote: { zh: '', en: '' }, author: { zh: '', en: '' }, avatar: '' })
}

function removeTestimonial(index: number) {
  config.testimonials.splice(index, 1)
}

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

    <p class="page-desc">围绕前台首页实际结构来维护内容，精选路线和文化亮点都直接从现有内容里选择，减少断链。</p>

    <el-card shadow="never" class="block-card">
      <template #header>
        <div class="block-header" style="cursor: pointer" @click="toggleBlock('heroStats')">
          <span class="block-title">{{ HomeConfigBlockLabels.heroStats }}</span>
          <span class="block-count">{{ config.heroStats.length }} 项</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('heroStats')">
        <div v-for="(item, idx) in config.heroStats" :key="idx" class="block-item">
          <div class="block-item-header">
            <span>卡片 #{{ idx + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="removeHeroStat(idx)">删除</el-button>
          </div>
          <el-form-item label="标题">
            <I18nInput v-model="item.title" placeholder="例如 12+" />
          </el-form-item>
          <el-form-item label="描述">
            <I18nInput v-model="item.description" type="textarea" :rows="2" />
          </el-form-item>
        </div>
        <div v-if="config.heroStats.length === 0" class="empty-hint">暂无数据</div>
        <el-button :icon="Plus" size="small" @click="addHeroStat">添加卡片</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="block-card">
      <template #header>
        <div class="block-header" style="cursor: pointer" @click="toggleBlock('trustMetrics')">
          <span class="block-title">{{ HomeConfigBlockLabels.trustMetrics }}</span>
          <span class="block-count">{{ config.trustMetrics.length }} 项</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('trustMetrics')">
        <div v-for="(item, idx) in config.trustMetrics" :key="idx" class="block-item">
          <div class="block-item-header">
            <span>指标 #{{ idx + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="removeTrustMetric(idx)">删除</el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="数值">
                <el-input v-model="item.value" placeholder="例如 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="标签">
                <I18nInput v-model="item.label" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-if="config.trustMetrics.length === 0" class="empty-hint">暂无数据</div>
        <el-button :icon="Plus" size="small" @click="addTrustMetric">添加指标</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="block-card">
      <template #header>
        <div class="block-header" style="cursor: pointer" @click="toggleBlock('entryCards')">
          <span class="block-title">{{ HomeConfigBlockLabels.entryCards }}</span>
          <span class="block-count">{{ config.entryCards.length }} 项</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('entryCards')">
        <div v-for="(item, idx) in config.entryCards" :key="idx" class="block-item">
          <div class="block-item-header">
            <span>入口 #{{ idx + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="removeEntryCard(idx)">删除</el-button>
          </div>
          <el-form-item label="标题">
            <I18nInput v-model="item.title" />
          </el-form-item>
          <el-form-item label="描述">
            <I18nInput v-model="item.description" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="图片">
                <ImageUpload v-model="item.image" :multiple="false" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="链接">
                <el-input v-model="item.link" placeholder="例如 /culture" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-if="config.entryCards.length === 0" class="empty-hint">暂无数据</div>
        <el-button :icon="Plus" size="small" @click="addEntryCard">添加入口</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="block-card">
      <template #header>
        <div class="block-header" style="cursor: pointer" @click="toggleBlock('featuredRoutes')">
          <span class="block-title">{{ HomeConfigBlockLabels.featuredRoutes }}</span>
          <span class="block-count">{{ config.featuredRoutes.length }} 条</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('featuredRoutes')">
        <el-select
          v-model="config.featuredRoutes"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="选择精选路线"
          style="width: 100%"
        >
          <el-option
            v-for="routeItem in routeOptions"
            :key="routeItem.slug"
            :label="`${routeItem.title} (${routeItem.slug})`"
            :value="routeItem.slug"
          />
        </el-select>
      </div>
    </el-card>

    <el-card shadow="never" class="block-card">
      <template #header>
        <div class="block-header" style="cursor: pointer" @click="toggleBlock('cultureHighlights')">
          <span class="block-title">{{ HomeConfigBlockLabels.cultureHighlights }}</span>
          <span class="block-count">{{ config.cultureHighlights.length }} 项</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('cultureHighlights')">
        <div v-for="(item, idx) in config.cultureHighlights" :key="idx" class="block-item">
          <div class="block-item-header">
            <span>亮点 #{{ idx + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="removeCultureHighlight(idx)">删除</el-button>
          </div>
          <el-form-item label="标题">
            <I18nInput v-model="item.title" />
          </el-form-item>
          <el-form-item label="描述">
            <I18nInput v-model="item.description" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="图片">
                <ImageUpload v-model="item.image" :multiple="false" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联城市">
                <el-select
                  v-model="item.citySlug"
                  filterable
                  clearable
                  placeholder="选择已建城市"
                  style="width: 100%"
                >
                  <el-option
                    v-for="city in cityOptions"
                    :key="city.slug"
                    :label="`${city.name} (${city.slug})`"
                    :value="city.slug"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-if="config.cultureHighlights.length === 0" class="empty-hint">暂无数据</div>
        <el-button :icon="Plus" size="small" @click="addCultureHighlight">添加亮点</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="block-card">
      <template #header>
        <div class="block-header" style="cursor: pointer" @click="toggleBlock('testimonials')">
          <span class="block-title">{{ HomeConfigBlockLabels.testimonials }}</span>
          <span class="block-count">{{ config.testimonials.length }} 项</span>
        </div>
      </template>
      <div v-show="activeBlocks.includes('testimonials')">
        <div v-for="(item, idx) in config.testimonials" :key="idx" class="block-item">
          <div class="block-item-header">
            <span>评价 #{{ idx + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="removeTestimonial(idx)">删除</el-button>
          </div>
          <el-form-item label="评价内容">
            <I18nInput v-model="item.quote" type="textarea" :rows="3" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="16">
              <el-form-item label="作者">
                <I18nInput v-model="item.author" />
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
        <el-button :icon="Plus" size="small" @click="addTestimonial">添加评价</el-button>
      </div>
    </el-card>

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

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.page-desc {
  color: #909399;
  margin-bottom: 20px;
  font-size: 14px;
}

.block-card {
  margin-bottom: 16px;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-title {
  font-weight: 600;
  font-size: 15px;
}

.block-count {
  font-size: 12px;
  color: #909399;
}

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

.empty-hint {
  text-align: center;
  color: #c0c4cc;
  padding: 24px 0;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}
</style>
