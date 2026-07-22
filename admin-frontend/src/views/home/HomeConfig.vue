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
    return 'Using a custom uploaded cover image.'
  }

  if (item.citySlug?.trim()) {
    return `If left empty, the homepage will inherit ${cityNameFor(item.citySlug)}'s city cover image.`
  }

  return 'Upload a custom cover image, or link a city to inherit its cover.'
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
    ElMessage.error(extractErrorMessage(err, 'Failed to load home configuration'))
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
    ElMessage.warning('Hero stats need a title before saving.')
    return
  }

  normalizeRouteRegions()
  const hasInvalidRegion = config.routeRegions.some((region) => !region.key.trim())
  if (hasInvalidRegion) {
    ElMessage.warning('Each route region needs a non-empty unique key.')
    return
  }

  saving.value = true
  try {
    await homeApi.updateHomeConfig({ ...config })
    ElMessage.success('Home configuration saved.')
    resetDirty()
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, 'Failed to save home configuration'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="home-config-page" v-loading="loading">
    <EditorPageHeader
      title="Homepage Content"
      :saving="saving"
      :dirty="isDirty"
      @save="handleSave"
      @cancel="() => {}"
    />

    <el-card shadow="never" class="section-card">
      <template #header>Global Summary</template>
      <div class="global-summary">
        <div class="summary-chip">Route regions {{ config.routeRegions.length }}</div>
        <div class="summary-chip">Featured routes {{ config.featuredRoutes.length }}</div>
        <div class="summary-chip">Culture highlights {{ config.cultureHighlights.length }}</div>
        <div class="summary-chip">Entry cards {{ config.entryCards.length }}</div>
      </div>
    </el-card>

    <EditorWorkspace
      v-model="activeBlock"
      eyebrow="首页内容"
      title="首页模块设置"
      description="Edit the modular homepage pieces here without scrolling through one giant form."
      :active-label="HomeConfigBlockLabels[activeBlock]"
      :tabs="workspaceTabs"
    >
      <div v-if="activeBlock === 'hero'" class="workspace-panel">
        <div class="panel-title">首屏图片与视频</div>
        <div class="block-item">
          <div class="block-item-header">
            <span>Homepage cover system</span>
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="Hero cover">
                <ImageUpload v-model="config.hero.image" module="home" />
                <div class="field-hint">显示在首页首屏的全宽图片。</div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Interpreting cover">
                <ImageUpload v-model="config.hero.interpretingImage" module="home" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Departure CTA cover">
                <ImageUpload v-model="config.hero.ctaImage" module="home" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="Hero caption">
            <I18nInput v-model="config.hero.caption" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Interpreting label">
                <I18nInput v-model="config.hero.interpretingLabel" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="Badge value">
                <el-input v-model="config.hero.badgeValue" placeholder="60+" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Badge label">
                <I18nInput v-model="config.hero.badgeLabel" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="block-item">
          <div class="block-item-header">
            <span>首页视频（选填）</span>
          </div>
          <el-form-item label="Homepage video">
            <ImageUpload v-model="config.hero.video.url" media-kind="video" module="home" entity-type="home" />
            <div class="field-hint">从媒体库选择视频；留空时前台不显示该模块。</div>
          </el-form-item>
          <el-form-item label="视频封面">
            <ImageUpload v-model="config.hero.video.poster" module="home" />
            <div class="field-hint">Shown before the visitor chooses to play the film.</div>
          </el-form-item>
          <el-form-item label="Film title">
            <I18nInput v-model="config.hero.video.title" />
          </el-form-item>
          <el-form-item label="Film description">
            <I18nInput v-model="config.hero.video.description" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Duration">
                <el-input v-model="config.hero.video.duration" placeholder="2 min" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Format">
                <el-input v-model="config.hero.video.resolution" placeholder="4K" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>

      <div v-else-if="activeBlock === 'routeRegions'" class="workspace-panel">
        <div class="panel-title">Route Regions</div>
        <div v-for="(item, index) in config.routeRegions" :key="item.key || index" class="block-item">
          <div class="block-item-header">
            <span>Region #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.routeRegions.splice(index, 1)">
              Remove
            </el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="Key">
                <el-input v-model="item.key" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Title">
                <I18nInput v-model="item.title" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="区域说明">
                <I18nInput v-model="item.note" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="Included adcodes">
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
        <el-button :icon="Plus" @click="addRouteRegion">Add route region</el-button>
      </div>

      <div v-else-if="activeBlock === 'featuredRoutes'" class="workspace-panel">
        <div class="panel-title">Featured Routes</div>
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
        <div class="panel-title">Hero Stats</div>
        <div v-for="(item, index) in config.heroStats" :key="index" class="block-item">
          <div class="block-item-header">
            <span>Stat #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.heroStats.splice(index, 1)">
              Remove
            </el-button>
          </div>
          <el-form-item label="Title">
            <I18nInput v-model="item.title" />
          </el-form-item>
          <el-form-item label="Description">
            <I18nInput v-model="item.description" type="textarea" :rows="2" />
          </el-form-item>
        </div>
        <el-button :icon="Plus" @click="addHeroStat">Add hero stat</el-button>
      </div>

      <div v-else-if="activeBlock === 'trustMetrics'" class="workspace-panel">
        <div class="panel-title">Trust Metrics</div>
        <div v-for="(item, index) in config.trustMetrics" :key="index" class="block-item">
          <div class="block-item-header">
            <span>Metric #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.trustMetrics.splice(index, 1)">
              Remove
            </el-button>
          </div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="Value">
                <el-input v-model="item.value" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="Label">
                <I18nInput v-model="item.label" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button :icon="Plus" @click="addTrustMetric">Add metric</el-button>
      </div>

      <div v-else-if="activeBlock === 'entryCards'" class="workspace-panel">
        <div class="panel-title">Entry Cards</div>
        <div v-for="(item, index) in config.entryCards" :key="index" class="block-item">
          <div class="block-item-header">
            <span>Entry #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.entryCards.splice(index, 1)">
              Remove
            </el-button>
          </div>
          <el-form-item label="Title">
            <I18nInput v-model="item.title" />
          </el-form-item>
          <el-form-item label="Description">
            <I18nInput v-model="item.description" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Image">
                <ImageUpload v-model="item.image" module="home" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Link">
                <el-input v-model="item.link" placeholder="/culture" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button :icon="Plus" @click="addEntryCard">Add entry card</el-button>
      </div>

      <div v-else-if="activeBlock === 'cultureHighlights'" class="workspace-panel">
        <div class="panel-title">Culture Highlights</div>
        <div v-for="(item, index) in config.cultureHighlights" :key="index" class="block-item">
          <div class="block-item-header">
            <span>Highlight #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.cultureHighlights.splice(index, 1)">
              Remove
            </el-button>
          </div>
          <el-form-item label="Title">
            <I18nInput v-model="item.title" />
          </el-form-item>
          <el-form-item label="Description">
            <I18nInput v-model="item.description" type="textarea" :rows="2" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Cover Image">
                <ImageUpload v-model="item.image" module="home" />
                <div class="field-hint">{{ cultureHighlightCoverHint(item) }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Linked City">
                <el-select v-model="item.citySlug" filterable clearable style="width: 100%">
                  <el-option
                    v-for="city in cityOptions"
                    :key="city.slug"
                    :label="`${city.name} (${city.slug})`"
                    :value="city.slug"
                  />
                </el-select>
                <div class="field-hint">
                  Homepage culture cards will inherit the linked city's cover and place label when no custom image is set.
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button :icon="Plus" @click="addCultureHighlight">Add culture highlight</el-button>
      </div>

      <div v-else class="workspace-panel">
        <div class="panel-title">Testimonials</div>
        <div v-for="(item, index) in config.testimonials" :key="index" class="block-item">
          <div class="block-item-header">
            <span>Testimonial #{{ index + 1 }}</span>
            <el-button size="small" type="danger" :icon="Delete" @click="config.testimonials.splice(index, 1)">
              Remove
            </el-button>
          </div>
          <el-form-item label="Quote">
            <I18nInput v-model="item.quote" type="textarea" :rows="3" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="16">
              <el-form-item label="Author">
                <I18nInput v-model="item.author" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Avatar">
                <ImageUpload v-model="item.avatar" module="home" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button :icon="Plus" @click="addTestimonial">Add testimonial</el-button>
      </div>
    </EditorWorkspace>
  </div>
</template>

<style scoped>
@import '@/assets/editor-common.css';

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

.field-hint {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #7a7f87;
}
</style>
