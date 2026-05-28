<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { homeApi } from '@/api/home'
import { routesApi } from '@/api/routes'
import { citiesApi } from '@/api/cities'
import type { HomeConfig, HomeConfigBlock } from '@/types/home'
import { HomeConfigBlockLabels } from '@/types/home'
import { pickI18n } from '@/types/common'
import { extractErrorMessage } from '@/utils/i18n'
import { useDirtyForm } from '@/composables/useDirtyForm'
import EditorPageHeader from '@/components/editor/EditorPageHeader.vue'
import EditorWorkspace, { type EditorWorkspaceTab } from '@/components/editor/EditorWorkspace.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import I18nInput from '@/components/I18nInput.vue'
import {
  DEFAULT_ROUTE_REGIONS,
  GUANGDONG_ADCODE_OPTIONS,
  formatAdcodeLabel,
} from '@/constants/guangdongRegions'

const loading = ref(false)
const saving = ref(false)
const routeOptions = ref<Array<{ slug: string; title: string }>>([])
const cityOptions = ref<Array<{ slug: string; name: string }>>([])
const activeBlock = ref<HomeConfigBlock>('routeRegions')

const config = reactive<HomeConfig>({
  heroStats: [],
  trustMetrics: [],
  entryCards: [],
  featuredRoutes: [],
  cultureHighlights: [],
  testimonials: [],
  routeRegions: DEFAULT_ROUTE_REGIONS.map((item) => ({ ...item })),
})

const { isDirty, resetDirty } = useDirtyForm({ form: config })

const workspaceTabs = computed<EditorWorkspaceTab[]>(() =>
  (Object.keys(HomeConfigBlockLabels) as HomeConfigBlock[]).map((key) => ({
    key,
    label: HomeConfigBlockLabels[key],
  })),
)

function createDefaultRouteRegions() {
  return DEFAULT_ROUTE_REGIONS.map((item) => ({
    ...item,
    title: { ...item.title },
    note: { ...item.note },
    adcodes: [...item.adcodes],
  }))
}

function normalizeRouteRegions() {
  config.routeRegions = DEFAULT_ROUTE_REGIONS.map((defaultRegion, index) => {
    const currentRegion = config.routeRegions[index]
    return {
      key: currentRegion?.key?.trim() || defaultRegion.key,
      title: {
        zh: currentRegion?.title?.zh || defaultRegion.title.zh,
        en: currentRegion?.title?.en || defaultRegion.title.en,
      },
      note: {
        zh: currentRegion?.note?.zh || defaultRegion.note.zh,
        en: currentRegion?.note?.en || defaultRegion.note.en,
      },
      adcodes: Array.isArray(currentRegion?.adcodes) ? [...currentRegion.adcodes] : [...defaultRegion.adcodes],
    }
  })
}

onMounted(async () => {
  loading.value = true
  try {
    const [routeRes, cityRes, homeRes] = await Promise.all([
      routesApi.getRoutes({ page: 1, pageSize: 200 }),
      citiesApi.getCities({ page: 1, pageSize: 200 }),
      homeApi.getHomeConfig(),
    ])

    routeOptions.value = (routeRes.data.data.data || []).map((item: any) => ({
      slug: item.slug,
      title: pickI18n(item.title) || item.slug,
    }))

    cityOptions.value = (cityRes.data.data.data || []).map((item: any) => ({
      slug: item.slug,
      name: pickI18n(item.name) || item.slug,
    }))

    Object.assign(config, homeRes.data.data)
    if (!config.routeRegions.length) {
      config.routeRegions = createDefaultRouteRegions()
    }
    normalizeRouteRegions()
    resetDirty()
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, '加载首页配置失败'))
  } finally {
    loading.value = false
  }
})

function addHeroStat() {
  config.heroStats.push({ title: { zh: '', en: '' }, description: { zh: '', en: '' } })
}

function addTrustMetric() {
  config.trustMetrics.push({ value: '', label: { zh: '', en: '' } })
}

function addEntryCard() {
  config.entryCards.push({ title: { zh: '', en: '' }, description: { zh: '', en: '' }, image: '', link: '' })
}

function addCultureHighlight() {
  config.cultureHighlights.push({ title: { zh: '', en: '' }, description: { zh: '', en: '' }, image: '', citySlug: '' })
}

function addTestimonial() {
  config.testimonials.push({ quote: { zh: '', en: '' }, author: { zh: '', en: '' }, avatar: '' })
}

function addRouteRegion() {
  config.routeRegions.push({
    key: `region-${Date.now()}`,
    title: { zh: '', en: '' },
    note: { zh: '', en: '' },
    adcodes: [],
  })
}

async function handleSave() {
  const hasEmptyHeroTitle = config.heroStats.some((item) => !item.title?.zh?.trim() && !item.title?.en?.trim())
  if (hasEmptyHeroTitle) {
    ElMessage.warning('Hero 统计卡片标题不能为空')
    return
  }

  normalizeRouteRegions()
  const hasInvalidRegion = config.routeRegions.some((region) => !region.key.trim())
  if (hasInvalidRegion) {
    ElMessage.warning('路线地区分组必须有唯一 key')
    return
  }

  saving.value = true
  try {
    await homeApi.updateHomeConfig({ ...config })
    ElMessage.success('首页配置已保存')
    resetDirty()
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, '保存失败'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="home-config-page" v-loading="loading">
    <EditorPageHeader
      title="首页内容管理"
      :saving="saving"
      :dirty="isDirty"
      @save="handleSave"
      @cancel="() => {}"
    />

    <el-card shadow="never" class="section-card">
      <template #header>全局联动信息</template>
      <div class="global-summary">
        <div class="summary-chip">路线地区分组 {{ config.routeRegions.length }}</div>
        <div class="summary-chip">精选路线 {{ config.featuredRoutes.length }}</div>
        <div class="summary-chip">文化亮点 {{ config.cultureHighlights.length }}</div>
        <div class="summary-chip">入口卡片 {{ config.entryCards.length }}</div>
      </div>
    </el-card>

    <EditorWorkspace
      v-model="activeBlock"
      eyebrow="Home Content Workspace"
      title="首页模块工作台"
      description="首页的统计卡、地区导航、入口卡片、文化亮点和评价统一在这里切换编辑，避免整页一直下拉。"
      :active-label="HomeConfigBlockLabels[activeBlock]"
      :tabs="workspaceTabs"
    >
      <div v-if="activeBlock === 'routeRegions'" class="workspace-panel">
        <div class="panel-title">路线地区分组</div>
        <div v-for="(item, index) in config.routeRegions" :key="item.key || index" class="block-item">
          <div class="block-item-header">
            <span>地区分组 #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.routeRegions.splice(index, 1)">删除</el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="Key">
                <el-input v-model="item.key" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="标题">
                <I18nInput v-model="item.title" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="副标题 / Note">
                <I18nInput v-model="item.note" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="包含地区">
            <el-select v-model="item.adcodes" multiple filterable collapse-tags collapse-tags-tooltip style="width: 100%">
              <el-option
                v-for="option in GUANGDONG_ADCODE_OPTIONS"
                :key="option.adcode"
                :label="formatAdcodeLabel(option.adcode)"
                :value="option.adcode"
              />
            </el-select>
          </el-form-item>
        </div>
        <el-button :icon="Plus" @click="addRouteRegion">新增地区分组</el-button>
      </div>

      <div v-else-if="activeBlock === 'featuredRoutes'" class="workspace-panel">
        <div class="panel-title">精选路线</div>
        <el-select v-model="config.featuredRoutes" multiple filterable collapse-tags collapse-tags-tooltip style="width: 100%">
          <el-option
            v-for="routeItem in routeOptions"
            :key="routeItem.slug"
            :label="`${routeItem.title} (${routeItem.slug})`"
            :value="routeItem.slug"
          />
        </el-select>
      </div>

      <div v-else-if="activeBlock === 'heroStats'" class="workspace-panel">
        <div class="panel-title">Hero 统计卡片</div>
        <div v-for="(item, index) in config.heroStats" :key="index" class="block-item">
          <div class="block-item-header">
            <span>卡片 #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.heroStats.splice(index, 1)">删除</el-button>
          </div>
          <el-form-item label="标题">
            <I18nInput v-model="item.title" />
          </el-form-item>
          <el-form-item label="描述">
            <I18nInput v-model="item.description" type="textarea" :rows="2" />
          </el-form-item>
        </div>
        <el-button :icon="Plus" @click="addHeroStat">新增卡片</el-button>
      </div>

      <div v-else-if="activeBlock === 'trustMetrics'" class="workspace-panel">
        <div class="panel-title">信任指标</div>
        <div v-for="(item, index) in config.trustMetrics" :key="index" class="block-item">
          <div class="block-item-header">
            <span>指标 #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.trustMetrics.splice(index, 1)">删除</el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="数值">
                <el-input v-model="item.value" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="标签">
                <I18nInput v-model="item.label" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button :icon="Plus" @click="addTrustMetric">新增指标</el-button>
      </div>

      <div v-else-if="activeBlock === 'entryCards'" class="workspace-panel">
        <div class="panel-title">入口卡片</div>
        <div v-for="(item, index) in config.entryCards" :key="index" class="block-item">
          <div class="block-item-header">
            <span>入口 #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.entryCards.splice(index, 1)">删除</el-button>
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
                <ImageUpload v-model="item.image" module="home" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="链接">
                <el-input v-model="item.link" placeholder="/culture" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button :icon="Plus" @click="addEntryCard">新增入口</el-button>
      </div>

      <div v-else-if="activeBlock === 'cultureHighlights'" class="workspace-panel">
        <div class="panel-title">文化亮点</div>
        <div v-for="(item, index) in config.cultureHighlights" :key="index" class="block-item">
          <div class="block-item-header">
            <span>亮点 #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.cultureHighlights.splice(index, 1)">删除</el-button>
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
                <ImageUpload v-model="item.image" module="home" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联城市">
                <el-select v-model="item.citySlug" filterable clearable style="width: 100%">
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
        <el-button :icon="Plus" @click="addCultureHighlight">新增亮点</el-button>
      </div>

      <div v-else class="workspace-panel">
        <div class="panel-title">评价展示</div>
        <div v-for="(item, index) in config.testimonials" :key="index" class="block-item">
          <div class="block-item-header">
            <span>评价 #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.testimonials.splice(index, 1)">删除</el-button>
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
                <ImageUpload v-model="item.avatar" module="home" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button :icon="Plus" @click="addTestimonial">新增评价</el-button>
      </div>
    </EditorWorkspace>
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';

/* HomeConfig uses .home-config-page instead of .edit-page */
.home-config-page {
  padding-bottom: 40px;
}

.global-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.summary-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: #f5f8ff;
  color: #2757a5;
  font-size: 12px;
  font-weight: 600;
}

.block-item {
  padding: 12px;
  margin-bottom: 12px;
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
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
</style>
