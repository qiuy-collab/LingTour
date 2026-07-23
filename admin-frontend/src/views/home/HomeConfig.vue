<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { homeApi } from '@/api/home'
import { routesApi } from '@/api/routes'
import { citiesApi } from '@/api/cities'
import type { HomeConfig, HomeConfigBlock } from '@/types/home'
import { HomeConfigBlockLabels } from '@/types/home'
import { pickI18n, toI18n } from '@/types/common'
import { extractErrorMessage } from '@/utils/i18n'
import { useDirtyForm } from '@/composables/useDirtyForm'
import EditorPageHeader from '@/components/editor/EditorPageHeader.vue'
import EditorWorkspace, { type EditorWorkspaceTab } from '@/components/editor/EditorWorkspace.vue'
import FrontendPagePreview from '@/components/FrontendPagePreview.vue'
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
  hero: {
    image: '',
    caption: { zh: '', en: '' },
    ctaImage: '',
    interpretingImage: '',
    interpretingLabel: { zh: '', en: '' },
    badgeValue: '',
    badgeLabel: { zh: '', en: '' },
    video: {
      url: '',
      poster: '',
      title: { zh: '', en: '' },
      description: { zh: '', en: '' },
      duration: '',
      resolution: '',
    },
  },
  heroStats: [],
  trustMetrics: [],
  entryCards: [],
  featuredRoutes: [],
  cultureHighlights: [],
  testimonials: [],
  routeRegions: DEFAULT_ROUTE_REGIONS.map((item) => ({
    ...item,
    title: toI18n(item.title),
    note: toI18n(item.note),
  })),
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
    title: toI18n(item.title),
    note: toI18n(item.note),
    adcodes: [...item.adcodes],
  }))
}

function normalizeRouteRegions() {
  config.routeRegions = DEFAULT_ROUTE_REGIONS.map((defaultRegion, index) => {
    const currentRegion = config.routeRegions[index]
    return {
      key: currentRegion?.key?.trim() || defaultRegion.key,
      title: toI18n(currentRegion?.title || defaultRegion.title),
      note: toI18n(currentRegion?.note || defaultRegion.note),
      adcodes: Array.isArray(currentRegion?.adcodes)
        ? [...currentRegion.adcodes]
        : [...defaultRegion.adcodes],
    }
  })
}

function cityNameFor(slug: string) {
  return cityOptions.value.find((city) => city.slug === slug)?.name || slug
}

function cultureHighlightCoverHint(item: { image?: string; citySlug?: string }) {
  if (item.image?.trim()) {
    return '当前使用媒体库中的自定义封面。'
  }

  if (item.citySlug?.trim()) {
    return `留空时，首页会自动使用${cityNameFor(item.citySlug)}的城市封面。`
  }

  return '请选择自定义封面，或关联城市并自动沿用城市封面。'
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
    ElMessage.error(extractErrorMessage(err, '首页配置加载失败'))
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
  config.entryCards.push({
    title: { zh: '', en: '' },
    description: { zh: '', en: '' },
    image: '',
    link: '',
  })
}

function addCultureHighlight() {
  config.cultureHighlights.push({
    title: { zh: '', en: '' },
    description: { zh: '', en: '' },
    image: '',
    citySlug: '',
  })
}

function addTestimonial() {
  config.testimonials.push({
    quote: { zh: '', en: '' },
    author: { zh: '', en: '' },
    avatar: '',
  })
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
  const hasEmptyHeroTitle = config.heroStats.some(
    (item) => !item.title?.zh?.trim() && !item.title?.en?.trim(),
  )
  if (hasEmptyHeroTitle) {
    ElMessage.warning('首屏统计卡片必须填写标题后才能保存。')
    return
  }

  normalizeRouteRegions()
  const hasInvalidRegion = config.routeRegions.some((region) => !region.key.trim())
  if (hasInvalidRegion) {
    ElMessage.warning('每个路线分区都需要填写唯一标识。')
    return
  }

  saving.value = true
  try {
    await homeApi.updateHomeConfig({ ...config })
    ElMessage.success('首页配置已保存。')
    resetDirty()
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, '首页配置保存失败'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="home-config-page" v-loading="loading">
    <EditorPageHeader
      title="首页配置"
      :saving="saving"
      :dirty="isDirty"
      @save="handleSave"
      @cancel="() => {}"
    />

    <div class="editor-shell">
      <div class="editor-form">
        <el-card shadow="never" class="section-card">
          <template #header>模块概览</template>
          <div class="global-summary">
            <div class="summary-chip">路线分区 {{ config.routeRegions.length }}</div>
            <div class="summary-chip">精选路线 {{ config.featuredRoutes.length }}</div>
            <div class="summary-chip">文化亮点 {{ config.cultureHighlights.length }}</div>
            <div class="summary-chip">入口卡片 {{ config.entryCards.length }}</div>
          </div>
        </el-card>

        <EditorWorkspace
      v-model="activeBlock"
      eyebrow="首页内容"
      title="首页模块设置"
      description="按模块维护首页内容，并在保存前预览前台效果。"
      :active-label="HomeConfigBlockLabels[activeBlock]"
      :tabs="workspaceTabs"
    >
      <div v-if="activeBlock === 'hero'" class="workspace-panel">
        <div class="panel-title">首屏图片与视频</div>
        <div class="block-item">
          <div class="block-item-header">
            <span>首屏封面</span>
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="首页首屏封面">
                <ImageUpload v-model="config.hero.image" module="home" />
                <div class="field-hint">显示在首页首屏的全宽图片。</div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="口译入口封面">
                <ImageUpload v-model="config.hero.interpretingImage" module="home" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="出发引导封面">
                <ImageUpload v-model="config.hero.ctaImage" module="home" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="首屏说明">
            <I18nInput v-model="config.hero.caption" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="口译入口标题">
                <I18nInput v-model="config.hero.interpretingLabel" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="徽标数字">
                <el-input v-model="config.hero.badgeValue" placeholder="60+" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="徽标说明">
                <I18nInput v-model="config.hero.badgeLabel" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="block-item">
          <div class="block-item-header">
            <span>首页视频（选填）</span>
          </div>
          <el-form-item label="首页视频">
            <ImageUpload v-model="config.hero.video.url" media-kind="video" module="home" entity-type="home" />
            <div class="field-hint">从媒体库选择视频；留空时前台不显示该模块。</div>
          </el-form-item>
          <el-form-item label="视频封面">
            <ImageUpload v-model="config.hero.video.poster" module="home" />
            <div class="field-hint">访客播放视频前显示，建议与视频首帧色调一致。</div>
          </el-form-item>
          <el-form-item label="视频标题">
            <I18nInput v-model="config.hero.video.title" />
          </el-form-item>
          <el-form-item label="视频说明">
            <I18nInput v-model="config.hero.video.description" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="时长">
                <el-input v-model="config.hero.video.duration" placeholder="2 min" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="清晰度">
                <el-input v-model="config.hero.video.resolution" placeholder="4K" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>

      <div v-else-if="activeBlock === 'routeRegions'" class="workspace-panel">
        <div class="panel-title">路线地区分组</div>
        <div v-for="(item, index) in config.routeRegions" :key="item.key || index" class="block-item">
          <div class="block-item-header">
            <span>分组 {{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.routeRegions.splice(index, 1)">
              移除
            </el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="唯一标识">
                <el-input v-model="item.key" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="分组标题">
                <I18nInput v-model="item.title" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="区域说明">
                <I18nInput v-model="item.note" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="包含城市">
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
        <el-button :icon="Plus" @click="addRouteRegion">添加地区分组</el-button>
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
        <div class="panel-title">首屏统计卡片</div>
        <div v-for="(item, index) in config.heroStats" :key="index" class="block-item">
          <div class="block-item-header">
            <span>统计卡片 {{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.heroStats.splice(index, 1)">
              移除
            </el-button>
          </div>
          <el-form-item label="标题">
            <I18nInput v-model="item.title" />
          </el-form-item>
          <el-form-item label="说明">
            <I18nInput v-model="item.description" type="textarea" :rows="2" />
          </el-form-item>
        </div>
        <el-button :icon="Plus" @click="addHeroStat">添加统计卡片</el-button>
      </div>

      <div v-else-if="activeBlock === 'trustMetrics'" class="workspace-panel">
        <div class="panel-title">信任指标</div>
        <div v-for="(item, index) in config.trustMetrics" :key="index" class="block-item">
          <div class="block-item-header">
            <span>指标 {{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.trustMetrics.splice(index, 1)">
              移除
            </el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="数值">
                <el-input v-model="item.value" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="说明">
                <I18nInput v-model="item.label" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button :icon="Plus" @click="addTrustMetric">添加指标</el-button>
      </div>

      <div v-else-if="activeBlock === 'entryCards'" class="workspace-panel">
        <div class="panel-title">入口卡片</div>
        <div v-for="(item, index) in config.entryCards" :key="index" class="block-item">
          <div class="block-item-header">
            <span>入口 {{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.entryCards.splice(index, 1)">
              移除
            </el-button>
          </div>
          <el-form-item label="标题">
            <I18nInput v-model="item.title" />
          </el-form-item>
          <el-form-item label="说明">
            <I18nInput v-model="item.description" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="图片">
                <ImageUpload v-model="item.image" module="home" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="跳转路径">
                <el-input v-model="item.link" placeholder="/culture" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button :icon="Plus" @click="addEntryCard">添加入口卡片</el-button>
      </div>

      <div v-else-if="activeBlock === 'cultureHighlights'" class="workspace-panel">
        <div class="panel-title">文化亮点</div>
        <div v-for="(item, index) in config.cultureHighlights" :key="index" class="block-item">
          <div class="block-item-header">
            <span>文化亮点 {{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.cultureHighlights.splice(index, 1)">
              移除
            </el-button>
          </div>
          <el-form-item label="标题">
            <I18nInput v-model="item.title" />
          </el-form-item>
          <el-form-item label="说明">
            <I18nInput v-model="item.description" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="封面图片">
                <ImageUpload v-model="item.image" module="home" />
                <div class="field-hint">{{ cultureHighlightCoverHint(item) }}</div>
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
                <div class="field-hint">
                  未设置自定义图片时，首页文化卡片会沿用关联城市的封面与地点名称。
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button :icon="Plus" @click="addCultureHighlight">添加文化亮点</el-button>
      </div>

      <div v-else class="workspace-panel">
        <div class="panel-title">用户评价</div>
        <div v-for="(item, index) in config.testimonials" :key="index" class="block-item">
          <div class="block-item-header">
            <span>评价 {{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.testimonials.splice(index, 1)">
              移除
            </el-button>
          </div>
          <el-form-item label="评价内容">
            <I18nInput v-model="item.quote" type="textarea" :rows="3" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="16">
              <el-form-item label="用户署名">
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
        <el-button :icon="Plus" @click="addTestimonial">添加评价</el-button>
      </div>
        </EditorWorkspace>
      </div>

      <FrontendPagePreview type="home" :model="config" />
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';

.home-config-page {
  padding-bottom: 40px;
}

.global-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-chip {
  padding: 10px 14px;
  border-right: 1px solid var(--lt-border-light);
  color: var(--lt-text-regular);
  font-size: 12px;
  font-weight: 650;
}

.summary-chip:last-child {
  border-right: 0;
}

.block-item {
  padding: 16px;
  margin-bottom: 14px;
  background: color-mix(in srgb, var(--lt-bg-page) 62%, var(--lt-bg-card));
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-lg);
}

.block-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--lt-text-regular);
}

.field-hint {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--lt-text-secondary);
}

.panel-title {
  margin-bottom: 14px;
  color: var(--lt-text-primary);
  font-size: 15px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .global-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-chip:nth-child(2) {
    border-right: 0;
  }

  .summary-chip:nth-child(-n + 2) {
    border-bottom: 1px solid var(--lt-border-light);
  }
}

@media (max-width: 640px) {
  .home-config-page {
    padding-bottom: 20px;
  }

  .block-item {
    padding: 14px;
  }

  .block-item :deep(.el-col) {
    max-width: 100%;
    flex: 0 0 100%;
  }
}
</style>
