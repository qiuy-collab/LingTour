<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import { ArrowDown, ArrowUp, Delete, Plus } from "@element-plus/icons-vue";
import { citiesApi } from "@/api/cities";
import { routesApi } from "@/api/routes";
import { toI18n } from "@/types/common";
import { extractErrorMessage } from "@/utils/i18n";
import { useDirtyForm } from "@/composables/useDirtyForm";
import type { CityFormData } from "@/types/city";
import I18nInput from "@/components/I18nInput.vue";
import I18nMarkdownEditor from "@/components/I18nMarkdownEditor.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import MediaAssetInput from "@/components/media/MediaAssetInput.vue";
import FrontendPagePreview from "@/components/FrontendPagePreview.vue";
import FrontendPreviewDrawer from "@/components/editor/FrontendPreviewDrawer.vue";
import EditorPageHeader from "@/components/editor/EditorPageHeader.vue";
import EditorWorkspace from "@/components/editor/EditorWorkspace.vue";
import {
  GUANGDONG_ADCODE_OPTIONS,
  formatAdcodeLabel,
} from "@/constants/guangdongRegions";
import {
  isIncompleteVideoMedia,
  legacyImageForMedia,
  resolveMediaGallery,
  resolvePrimaryMedia,
} from "@/types/media";

const router = useRouter();
const route = useRoute();
const isEdit = computed(() => Boolean(route.params.id));
const loading = ref(false);
const saving = ref(false);
const mobilePreviewVisible = ref(false);
const formRef = ref<FormInstance>();
const activeChapter = ref("overview");

const routeOptions = ref<
  Array<{ id: string; slug: string; title: string; cityName: string }>
>([]);

const rules = {
  slug: [
    { required: true, message: "请输入 Slug", trigger: "blur" },
    {
      pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
      message: "Slug 必须是 kebab-case 格式",
      trigger: "blur",
    },
  ],
  "name.en": [
    { required: true, message: "请输入城市英文名称", trigger: "blur" },
  ],
};

const form = reactive<any>({
  slug: "",
  name: { zh: "", en: "" },
  regionLabel: { zh: "", en: "" },
  adcode: undefined,
  heroImage: "",
  heroMedia: null,
  heroNarrative: { zh: "", en: "" },
  tags: [],
  editorIntro: { zh: "", en: "" },
  galleryImages: [],
  galleryMedia: [],
  foodTitle: { zh: "", en: "" },
  foodDescription: { zh: "", en: "" },
  foodImages: [],
  sections: [],
  status: "draft",
  routeSlugs: [],
  relatedCitySlugs: [],
});

const { isDirty, resetDirty, disableDirtyCheck } = useDirtyForm({ form });

const newTag = reactive({ zh: "", en: "" });

function normalizeI18nValue(value: unknown) {
  return toI18n(value);
}

function normalizeTagList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeI18nValue(item))
    .filter((item) => item.zh.trim() || item.en.trim());
}

function normalizeSection(section: any, index: number) {
  return {
    id: section.id || `section-${index}`,
    title: normalizeI18nValue(section.title),
    body: normalizeI18nValue(section.body),
    image: section.image || "",
    primaryMedia: resolvePrimaryMedia(
      section.primaryMedia,
      section.image || "",
    ),
    images: Array.isArray(section.images) ? section.images : [],
    media: resolveMediaGallery(section.media, section.images || []),
    statLabel: normalizeI18nValue(section.statLabel),
    statValue: normalizeI18nValue(section.statValue),
    breathImage: section.breathImage || "",
    breathQuote: normalizeI18nValue(section.breathQuote),
    sortOrder: section.sortOrder ?? index,
  };
}

function addTag() {
  if (!newTag.en.trim()) return;
  form.tags.push({ zh: "", en: newTag.en.trim() });
  newTag.en = "";
}

function removeTag(index: number) {
  form.tags.splice(index, 1);
}

function addSection() {
  form.sections.push({
    id: `section-${Date.now()}`,
    title: { zh: "", en: "" },
    body: { zh: "", en: "" },
    image: "",
    primaryMedia: null,
    images: [],
    media: [],
    statLabel: { zh: "", en: "" },
    statValue: { zh: "", en: "" },
    breathImage: "",
    breathQuote: { zh: "", en: "" },
    sortOrder: form.sections.length,
  });
  activeChapter.value = `section-${form.sections.length - 1}`;
}

function removeSection(index: number) {
  form.sections.splice(index, 1);
  reindexSections();
  if (form.sections.length === 0) {
    activeChapter.value = "overview";
    return;
  }
  activeChapter.value = `section-${Math.min(index, form.sections.length - 1)}`;
}

function moveSection(index: number, delta: -1 | 1) {
  const target = index + delta;
  if (target < 0 || target >= form.sections.length) return;
  [form.sections[index], form.sections[target]] = [
    form.sections[target],
    form.sections[index],
  ];
  reindexSections();
}

function reindexSections() {
  form.sections.forEach((section: any, index: number) => {
    section.sortOrder = index;
  });
}

const chapterTabs = computed(() => [
  { key: "overview", label: "概览" },
  { key: "intro", label: "导语" },
  ...form.sections.map((section: any, index: number) => ({
    key: `section-${index}`,
    label:
      section.title?.zh?.trim() ||
      section.title?.en?.trim() ||
      `章节 ${index + 1}`,
    badge: `#${index + 1}`,
  })),
  { key: "food", label: "风味" },
]);

const activeSectionIndex = computed(() => {
  const match = /^section-(\d+)$/.exec(activeChapter.value);
  return match ? Number(match[1]) : -1;
});

const activeSection = computed(() =>
  activeSectionIndex.value >= 0
    ? form.sections[activeSectionIndex.value]
    : null,
);

const isSectionChapter = computed(() => activeSectionIndex.value >= 0);

function moveActiveSection(delta: -1 | 1) {
  if (activeSectionIndex.value < 0) return;
  const currentIndex = activeSectionIndex.value;
  moveSection(currentIndex, delta);
  const targetIndex = currentIndex + delta;
  if (targetIndex >= 0 && targetIndex < form.sections.length) {
    activeChapter.value = `section-${targetIndex}`;
  }
}

async function loadRouteOptions() {
  const res = await routesApi.getRoutes({ page: 1, pageSize: 200 });
  routeOptions.value = (res.data.data.data || []).map((item: any) => ({
    id: item.id,
    slug: item.slug,
    title: item.title?.zh || item.title?.en || item.slug,
    cityName: item.cityName?.zh || item.cityName?.en || "",
  }));
}

function fillFromApi(data: any) {
  Object.assign(form, {
    slug: data.slug || "",
    name: toI18n(data.name),
    regionLabel: toI18n(data.regionLabel),
    adcode: data.adcode ?? undefined,
    heroImage: data.heroImage || "",
    heroMedia: resolvePrimaryMedia(data.heroMedia, data.heroImage || ""),
    heroNarrative: toI18n(data.heroNarrative),
    tags: normalizeTagList(data.tags),
    editorIntro: toI18n(data.editorIntro),
    galleryImages: data.galleryImages || [],
    galleryMedia: resolveMediaGallery(
      data.galleryMedia,
      data.galleryImages || [],
    ),
    foodTitle: toI18n(data.foodTitle),
    foodDescription: toI18n(data.foodDescription),
    foodImages: data.foodImages || [],
    sections: (data.sections || []).map((section: any, index: number) =>
      normalizeSection(section, index),
    ),
    status: data.published ? "published" : "draft",
    routeSlugs:
      data.routeSlugs || data.routes?.map((item: any) => item.slug) || [],
    relatedCitySlugs: data.relatedCitySlugs || [],
  });
}

function toPayload() {
  const heroMedia = resolvePrimaryMedia(form.heroMedia, form.heroImage);
  return {
    slug: form.slug,
    name: form.name,
    regionLabel: form.regionLabel,
    adcode: form.adcode,
    heroImage: legacyImageForMedia(heroMedia, form.heroImage),
    heroMedia,
    heroNarrative: form.heroNarrative,
    tags: normalizeTagList(form.tags),
    editorIntro: form.editorIntro,
    galleryImages: form.galleryImages,
    galleryMedia: resolveMediaGallery(form.galleryMedia, form.galleryImages),
    foodTitle: form.foodTitle,
    foodDescription: form.foodDescription,
    foodImages: form.foodImages,
    published: form.status === "published",
    routeSlugs: form.routeSlugs,
    relatedCitySlugs: form.relatedCitySlugs,
    sections: form.sections.map((section: any, index: number) => ({
      title: normalizeI18nValue(section.title),
      body: normalizeI18nValue(section.body),
      image: legacyImageForMedia(section.primaryMedia, section.image || ""),
      primaryMedia: resolvePrimaryMedia(
        section.primaryMedia,
        section.image || "",
      ),
      images: section.images || [],
      media: resolveMediaGallery(section.media, section.images || []),
      statLabel: normalizeI18nValue(section.statLabel),
      statValue: normalizeI18nValue(section.statValue),
      breathImage: section.breathImage || "",
      breathQuote: normalizeI18nValue(section.breathQuote),
      sortOrder: index,
    })),
  };
}

watch(
  () => form.heroMedia,
  (value) => {
    if (!value) return;
    const nextLegacyImage = legacyImageForMedia(value, "");
    if (nextLegacyImage !== form.heroImage) {
      form.heroImage = nextLegacyImage;
    }
  },
  { deep: true },
);

watch(
  () => form.sections,
  (sections) => {
    sections.forEach((section: any) => {
      if (!section.primaryMedia) return;
      const nextLegacyImage = legacyImageForMedia(section.primaryMedia, "");
      if (nextLegacyImage !== section.image) {
        section.image = nextLegacyImage;
      }
    });
  },
  { deep: true },
);

onMounted(async () => {
  loading.value = true;
  try {
    await loadRouteOptions();
    if (isEdit.value) {
      const res = await citiesApi.getCity(route.params.id as string);
      fillFromApi(res.data.data);
    }
    resetDirty();
  } catch (err: any) {
    ElMessage.error(extractErrorMessage(err, "加载城市数据失败"));
    router.push("/admin/cities");
  } finally {
    loading.value = false;
  }
});

async function handleSave() {
  try {
    await formRef.value?.validate();
  } catch {
    ElMessage.warning("请检查必填项");
    return;
  }

  if (
    form.status === "published" &&
    (isIncompleteVideoMedia(form.heroMedia) ||
      form.sections.some((section: any) =>
        isIncompleteVideoMedia(section.primaryMedia),
      ))
  ) {
    ElMessage.warning("发布城市内容前，请补全所有视频文件和封面图");
    return;
  }

  saving.value = true;
  try {
    if (isEdit.value) {
      await citiesApi.updateCity(route.params.id as string, toPayload());
      ElMessage.success("城市更新成功");
    } else {
      await citiesApi.createCity(toPayload() as CityFormData);
      ElMessage.success("城市创建成功");
    }
    disableDirtyCheck();
    router.push("/admin/cities");
  } catch (error: any) {
    ElMessage.error(extractErrorMessage(error, "保存失败"));
  } finally {
    saving.value = false;
  }
}

const selectedRouteCards = computed(() =>
  form.routeSlugs
    .map((slug: string) =>
      routeOptions.value.find((item) => item.slug === slug),
    )
    .filter(Boolean),
);
</script>

<template>
  <div class="edit-page" v-loading="loading">
    <EditorPageHeader
      :title="isEdit ? '编辑城市' : '新增城市'"
      back-to="/admin/cities"
      :saving="saving"
      :dirty="isDirty"
      @save="handleSave"
      @preview="mobilePreviewVisible = true"
    />

    <div class="editor-shell">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="editor-form"
        label-position="top"
      >
        <el-card shadow="never" class="section-card">
          <template #header>基础信息</template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Slug" prop="slug">
                <el-input v-model="form.slug" placeholder="zhanjiang" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="地图地区">
                <el-select
                  v-model="form.adcode"
                  filterable
                  clearable
                  placeholder="选择广东地图对应地区"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in GUANGDONG_ADCODE_OPTIONS"
                    :key="option.adcode"
                    :label="formatAdcodeLabel(option.adcode)"
                    :value="option.adcode"
                  />
                </el-select>
                <div class="form-hint-text">
                  首页地图和路线地区高亮都依赖这个地区编码。
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="城市名称" prop="name.en">
            <I18nInput v-model="form.name" />
          </el-form-item>
          <el-form-item label="地区标签">
            <I18nInput v-model="form.regionLabel" />
          </el-form-item>
          <el-form-item label="标签">
            <div class="tag-list">
              <el-tag
                v-for="(tag, index) in form.tags"
                :key="index"
                closable
                @close="removeTag(Number(index))"
              >
                {{ tag.en || tag.zh }}
              </el-tag>
            </div>
            <div class="inline-row">
              <el-input v-model="newTag.en" placeholder="英文标签" />
              <el-button :icon="Plus" @click="addTag">添加</el-button>
            </div>
          </el-form-item>
        </el-card>

        <EditorWorkspace
          v-model="activeChapter"
          title="城市内容"
          :active-label="
            chapterTabs.find((chapter) => chapter.key === activeChapter)
              ?.label || '基础信息'
          "
          :tabs="chapterTabs"
        >
          <template #toolbar>
            <div class="chapter-actions">
              <el-button
                size="small"
                type="primary"
                :icon="Plus"
                @click="addSection"
                >新增章节</el-button
              >
              <el-button
                size="small"
                :icon="ArrowUp"
                :disabled="!isSectionChapter || activeSectionIndex === 0"
                @click="moveActiveSection(-1)"
              >
                上移
              </el-button>
              <el-button
                size="small"
                :icon="ArrowDown"
                :disabled="
                  !isSectionChapter ||
                  activeSectionIndex === form.sections.length - 1
                "
                @click="moveActiveSection(1)"
              >
                下移
              </el-button>
              <el-button
                size="small"
                type="danger"
                :icon="Delete"
                :disabled="!isSectionChapter"
                @click="removeSection(activeSectionIndex)"
              >
                删除
              </el-button>
            </div>
          </template>

          <div v-if="activeChapter === 'overview'" class="workspace-panel">
            <div class="panel-title">Overview（图文）</div>
            <el-form-item label="Overview 主媒体">
              <MediaAssetInput
                v-model="form.heroMedia"
                :legacy-image="form.heroImage"
                module="cities"
                entity-type="city"
              />
            </el-form-item>
            <el-form-item label="Overview 文案">
              <I18nMarkdownEditor v-model="form.heroNarrative" :rows="6" />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'intro'" class="workspace-panel">
            <div class="panel-title">Intro（图文）</div>
            <el-form-item label="Intro 正文">
              <I18nMarkdownEditor v-model="form.editorIntro" :rows="8" />
            </el-form-item>
            <el-form-item label="Intro 图片组">
              <ImageUpload
                v-model="form.galleryImages"
                multiple
                :limit="12"
                module="cities"
              />
            </el-form-item>
          </div>

          <div
            v-else-if="isSectionChapter && activeSection"
            class="workspace-panel"
          >
            <div class="panel-title">
              {{
                activeSection.title?.zh?.trim() ||
                activeSection.title?.en?.trim() ||
                `Section ${activeSectionIndex + 1}`
              }}
            </div>
            <el-form-item label="Section 主媒体">
              <MediaAssetInput
                v-model="activeSection.primaryMedia"
                :legacy-image="activeSection.image"
                module="cities"
                entity-type="city-section"
              />
            </el-form-item>
            <el-form-item label="Section 图片集">
              <ImageUpload
                v-model="activeSection.images"
                multiple
                :limit="10"
                module="cities"
              />
            </el-form-item>
            <el-form-item label="Section 标题">
              <I18nInput v-model="activeSection.title" />
            </el-form-item>
            <el-form-item label="Section 正文">
              <I18nMarkdownEditor v-model="activeSection.body" :rows="8" />
            </el-form-item>
            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="数据标签">
                  <I18nInput v-model="activeSection.statLabel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="数据内容">
                  <I18nInput v-model="activeSection.statValue" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="呼吸图">
              <ImageUpload
                v-model="activeSection.breathImage"
                module="cities"
              />
            </el-form-item>
            <el-form-item label="引语">
              <I18nInput
                v-model="activeSection.breathQuote"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </div>

          <div v-else-if="activeChapter === 'food'" class="workspace-panel">
            <div class="panel-title">Food（图文）</div>
            <el-form-item label="Food 标题">
              <I18nInput v-model="form.foodTitle" />
            </el-form-item>
            <el-form-item label="Food 正文">
              <I18nMarkdownEditor v-model="form.foodDescription" :rows="6" />
            </el-form-item>
            <el-form-item label="Food 图片组">
              <ImageUpload
                v-model="form.foodImages"
                multiple
                :limit="10"
                module="cities"
              />
            </el-form-item>
          </div>
        </EditorWorkspace>

        <el-card shadow="never" class="section-card">
          <template #header>关联路线</template>
          <el-form-item label="选择现有路线">
            <el-select
              v-model="form.routeSlugs"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              placeholder="直接选择已配置路线"
              style="width: 100%"
            >
              <el-option
                v-for="routeItem in routeOptions"
                :key="routeItem.slug"
                :label="`${routeItem.title} (${routeItem.slug})`"
                :value="routeItem.slug"
              />
            </el-select>
            <div class="form-hint-text">
              这里决定城市页下方关联路线，以及路线和城市之间的互相联动。
            </div>
          </el-form-item>
          <div v-if="selectedRouteCards.length" class="selected-grid">
            <div
              v-for="routeItem in selectedRouteCards"
              :key="routeItem.slug"
              class="selected-card"
            >
              <strong>{{ routeItem.title }}</strong>
              <span>{{ routeItem.cityName || routeItem.slug }}</span>
            </div>
          </div>
          <div v-else class="empty-hint">还没有关联路线</div>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header>发布状态</template>
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio label="draft">草稿</el-radio>
              <el-radio label="published">已发布</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-card>
      </el-form>

      <FrontendPagePreview type="city" :model="form" />
    </div>

    <FrontendPreviewDrawer
      v-model="mobilePreviewVisible"
      type="city"
      :model="form"
    />
  </div>
</template>

<style scoped>
@import "@/assets/editor-common.css";

.chapter-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.inline-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
}

.form-hint-text {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
  line-height: 1.5;
}

.empty-hint {
  color: #c0c4cc;
  text-align: center;
  padding: 18px 0 4px;
}

@media (max-width: 1100px) {
  .chapter-actions {
    justify-content: flex-start;
  }
  .inline-row {
    grid-template-columns: 1fr;
  }
}
</style>
