<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { CopyDocument, Delete, Search, Warning } from "@element-plus/icons-vue";
import { gsap } from "gsap";
import {
  queryMediaFiles,
  getOrphanFiles,
  deleteMediaFile,
  uploadMediaFile,
} from "@/api/media";
import type { MediaFile } from "@/api/media";
import { resolveMediaUrl } from "@/utils/media";

const props = withDefaults(
  defineProps<{
    mode?: "manage" | "picker";
    multiple?: boolean;
    limit?: number;
    accept?: string;
    mediaType?: "" | "image" | "video";
    defaultModule?: string;
    entityType?: string;
    entityId?: string;
    selectedUrls?: string[];
  }>(),
  {
    mode: "manage",
    multiple: false,
    limit: 1,
    accept: "image/jpeg,image/png,image/webp,image/gif",
    mediaType: "",
    defaultModule: "",
    entityType: "",
    entityId: "",
    selectedUrls: () => [],
  },
);

const emit = defineEmits<{
  select: [file: MediaFile];
  selectionChange: [files: MediaFile[]];
}>();

const loading = ref(false);
const files = ref<MediaFile[]>([]);
const total = ref(0);
const page = ref(1);
const limit = ref(30);
const moduleFilter = ref(props.defaultModule);
const mediaTypeFilter = ref(props.mediaType);
const searchQuery = ref("");
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatusText = ref("");
const selectedFilenames = ref<string[]>([]);
const showOrphans = ref(false);
const orphanCount = ref(0);
const uploadInputRef = ref<HTMLInputElement | null>(null);
const libraryRef = ref<HTMLElement | null>(null);
let animationContext: gsap.Context | null = null;

const modules = [
  "",
  "cities",
  "routes",
  "shop",
  "community",
  "events",
  "home",
  "avatars",
  "interpreting",
  "seed",
];
const moduleLabels: Record<string, string> = {
  cities: "城市",
  routes: "路线",
  shop: "商城",
  community: "社区",
  events: "活动",
  home: "首页",
  avatars: "头像",
  interpreting: "口译服务",
  seed: "初始化素材",
};
const entityLabels: Record<string, string> = {
  city: "城市",
  route: "路线",
  route_stop: "路线站点",
  product: "商品",
  collection: "商品系列",
  community_post: "社区内容",
  community_brief: "社区简报",
  event: "活动",
  home: "首页内容",
  interpreter_mode: "口译服务类型",
  external_asset: "已入库素材",
};
const isPickerMode = computed(() => props.mode === "picker");
const mediaNoun = computed(() =>
  mediaTypeFilter.value === "video"
    ? "视频"
    : mediaTypeFilter.value === "image"
      ? "图片"
      : "媒体文件",
);
const canSelectMore = computed(() =>
  props.multiple ? selectedFilenames.value.length < props.limit : true,
);
const selectionSummary = computed(() => {
  if (!isPickerMode.value) {
    return `已选择 ${selectedFilenames.value.length} 个文件`;
  }

  if (props.multiple) {
    return `已选择 ${selectedFilenames.value.length} / ${props.limit}`;
  }

  return selectedFilenames.value.length
    ? `已选择 1 个${mediaNoun.value}`
    : `尚未选择${mediaNoun.value}`;
});

function getModuleLabel(value?: string | null) {
  if (!value) return "";
  return moduleLabels[value] || value;
}

function getEntityLabel(value?: string | null) {
  if (!value) return "";
  return entityLabels[value] || value.replaceAll("_", " ");
}

async function animateMediaGrid() {
  await nextTick();
  animationContext?.revert();
  if (
    !libraryRef.value ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  animationContext = gsap.context(() => {
    gsap.fromTo(
      "[data-media-card]",
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.035,
        ease: "power2.out",
        clearProps: "opacity,visibility,transform",
      },
    );
  }, libraryRef.value);
}

function unwrapListPayload<T>(payload: unknown): { data: T[]; total: number } {
  if (Array.isArray(payload)) {
    return { data: payload as T[], total: payload.length };
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) {
      return {
        data: record.data as T[],
        total:
          typeof record.total === "number" ? record.total : record.data.length,
      };
    }
    if (Array.isArray(record.items)) {
      return {
        data: record.items as T[],
        total:
          typeof record.total === "number" ? record.total : record.items.length,
      };
    }
  }

  return { data: [], total: 0 };
}

function buildSelectionKey(url: string) {
  const trimmed = url.trim();
  if (trimmed.startsWith("/uploads/")) {
    return trimmed.replace(/^\/uploads\//, "");
  }

  try {
    const parsed = new URL(trimmed);
    const match = parsed.pathname.match(/^\/uploads\/(.+)$/);
    if (match?.[1]) return match[1];
  } catch {
    // ignore parse failures
  }

  return `seed:${trimmed}`;
}

const displayFiles = computed<MediaFile[]>(() => files.value);

const selectedMediaFiles = computed(() => {
  const selectedSet = new Set(selectedFilenames.value);
  return displayFiles.value.filter((file) => selectedSet.has(file.filename));
});

watch(
  () => props.defaultModule,
  (value) => {
    moduleFilter.value = value;
  },
);

watch(
  () => props.mediaType,
  (value) => {
    mediaTypeFilter.value = value;
    page.value = 1;
    void fetchFiles();
  },
);

watch(selectedMediaFiles, (value) => {
  emit("selectionChange", value);
});

watch(
  () => props.selectedUrls,
  (value) => {
    const urls = Array.isArray(value) ? value : [];
    selectedFilenames.value = urls
      .filter((url) => typeof url === "string" && url.trim())
      .map((url) => buildSelectionKey(url));
  },
  { immediate: true },
);

async function fetchFiles() {
  loading.value = true;
  try {
    if (showOrphans.value) {
      const res = await getOrphanFiles();
      const listPayload = unwrapListPayload<MediaFile>(
        res.data?.data ?? res.data,
      );
      files.value = listPayload.data;
      total.value = listPayload.total;
    } else {
      const res = await queryMediaFiles({
        page: page.value,
        limit: limit.value,
        module: moduleFilter.value || undefined,
        search: searchQuery.value || undefined,
        entityType: props.entityType || undefined,
        entityId: props.entityId || undefined,
        type: mediaTypeFilter.value || undefined,
      });
      const listPayload = unwrapListPayload<MediaFile>(
        res.data?.data ?? res.data,
      );
      files.value = listPayload.data;
      total.value = listPayload.total;
    }
    await animateMediaGrid();
  } catch {
    ElMessage.error("媒体文件加载失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}

async function checkOrphanCount() {
  try {
    const res = await getOrphanFiles();
    orphanCount.value = unwrapListPayload<MediaFile>(
      res.data?.data ?? res.data,
    ).total;
  } catch {
    // ignore
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFullUrl(file: MediaFile): string {
  return resolveMediaUrl(file.url);
}

function isVideoFile(file: MediaFile): boolean {
  if (file.mime_type?.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(file.url);
}

function formatTimestamp(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("zh-CN");
}

function handleMediaTypeFilterChange() {
  page.value = 1;
  void fetchFiles();
}

function toggleOrphanView() {
  showOrphans.value = !showOrphans.value;
  page.value = 1;
  void fetchFiles();
}

function copyUrl(file: MediaFile) {
  navigator.clipboard.writeText(getFullUrl(file));
  ElMessage.success("文件地址已复制");
}

async function handleDelete(file: MediaFile) {
  try {
    await ElMessageBox.confirm(
      showOrphans.value
        ? `确定永久删除“${file.original_name || file.filename}”吗？删除后无法恢复。`
        : `确定永久删除“${file.original_name || file.filename}”吗？如果内容仍在使用此文件，对应页面将无法显示。`,
      "确认删除文件",
      {
        type: "warning",
        confirmButtonText: "永久删除",
        cancelButtonText: "取消",
      },
    );
    await deleteMediaFile(file.filename);
    selectedFilenames.value = selectedFilenames.value.filter(
      (item) => item !== file.filename,
    );
    ElMessage.success("文件已删除");
    await fetchFiles();
    await checkOrphanCount();
  } catch {
    // cancelled
  }
}

async function handleBatchDelete() {
  if (selectedFilenames.value.length === 0) return;

  const deletable = [...selectedFilenames.value];

  try {
    await ElMessageBox.confirm(
      `确定永久删除已选择的 ${deletable.length} 个待清理文件吗？删除后无法恢复。`,
      "批量清理文件",
      {
        type: "warning",
        confirmButtonText: "确认清理",
        cancelButtonText: "取消",
      },
    );
    const promises = deletable.map((filename) => deleteMediaFile(filename));
    await Promise.allSettled(promises);
    selectedFilenames.value = [];
    ElMessage.success("待清理文件已删除");
    await fetchFiles();
    await checkOrphanCount();
  } catch {
    // cancelled
  }
}

function toggleSelect(file: MediaFile) {
  if (!isPickerMode.value && !showOrphans.value) {
    return;
  }

  if (props.multiple) {
    const exists = selectedFilenames.value.includes(file.filename);
    if (exists) {
      selectedFilenames.value = selectedFilenames.value.filter(
        (item) => item !== file.filename,
      );
      return;
    }
    if (!canSelectMore.value) {
      ElMessage.warning(`最多可选择 ${props.limit} 个文件`);
      return;
    }
    selectedFilenames.value = selectedFilenames.value.concat(file.filename);
    return;
  }

  selectedFilenames.value = [file.filename];
  emit("select", file);
}

function clearSelection() {
  selectedFilenames.value = [];
}

function triggerUploadPicker() {
  uploadInputRef.value?.click();
}

async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const inputFiles = input.files;
  if (!inputFiles || inputFiles.length === 0) return;

  const filesArr = Array.from(inputFiles);
  uploading.value = true;
  uploadProgress.value = 0;
  const totalCount = filesArr.length;
  let completedCount = 0;
  const uploadedFiles: MediaFile[] = [];

  try {
    const results = await Promise.allSettled(
      filesArr.map(async (file) => {
        const res = await uploadMediaFile(
          file,
          moduleFilter.value || props.defaultModule || undefined,
          props.entityType || undefined,
          props.entityId || undefined,
          (percent) => {
            uploadProgress.value = percent;
          },
        );
        const payload = res.data?.data ?? res.data;
        completedCount++;
        uploadProgress.value = Math.round((completedCount / totalCount) * 100);
        uploadStatusText.value = `${completedCount} / ${totalCount}`;
        const mediaFile: MediaFile = {
          filename:
            payload?.filename || payload?.path || payload?.url || file.name,
          url: payload?.url || payload?.path || "",
          size: payload?.size ?? file.size,
          size_bytes: payload?.size ?? file.size,
          createdAt: payload?.createdAt || new Date().toISOString(),
          module:
            payload?.module ||
            moduleFilter.value ||
            props.defaultModule ||
            null,
          entity_type: payload?.entityType || props.entityType || null,
          entity_id: payload?.entityId || props.entityId || null,
          original_name:
            payload?.originalName || payload?.originalname || file.name,
          mime_type: payload?.mimetype || file.type || null,
        };
        uploadedFiles.push(mediaFile);
        return mediaFile;
      }),
    );

    const failedCount = results.filter(
      (result) => result.status === "rejected",
    ).length;
    if (failedCount === 0) {
      ElMessage.success(`${totalCount} 个文件已上传至媒体库`);
    } else if (completedCount - failedCount > 0) {
      ElMessage.warning(
        `${totalCount - failedCount} 个上传成功，${failedCount} 个失败`,
      );
    } else {
      ElMessage.error("文件上传失败");
    }

    await fetchFiles();
    await checkOrphanCount();

    if (isPickerMode.value && uploadedFiles.length) {
      if (props.multiple) {
        const next = [...selectedFilenames.value];
        for (const uploaded of uploadedFiles) {
          if (!uploaded.filename || next.includes(uploaded.filename)) continue;
          if (next.length >= props.limit) break;
          next.push(uploaded.filename);
        }
        selectedFilenames.value = next;
      } else if (uploadedFiles[0]?.filename) {
        selectedFilenames.value = [uploadedFiles[0].filename];
      }
    }
  } catch {
    ElMessage.error("文件上传失败，请检查格式和大小后重试");
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
    uploadStatusText.value = "";
    input.value = "";
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage;
  fetchFiles();
}

function resetSelection() {
  const urls = Array.isArray(props.selectedUrls) ? props.selectedUrls : [];
  selectedFilenames.value = urls
    .filter((url) => typeof url === "string" && url.trim())
    .map((url) => buildSelectionKey(url));
}

function getSelectedUrls() {
  return selectedMediaFiles.value.map((file) => file.url);
}

defineExpose({
  fetchFiles,
  resetSelection,
  getSelectedUrls,
  selectedMediaFiles,
});

onMounted(() => {
  fetchFiles();
  checkOrphanCount();
});

onBeforeUnmount(() => {
  animationContext?.revert();
});
</script>

<template>
  <div ref="libraryRef" class="media-library" v-loading="loading">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="moduleFilter"
          placeholder="全部模块"
          clearable
          @change="fetchFiles"
          style="width: 140px"
        >
          <el-option label="全部模块" value="" />
          <el-option
            v-for="m in modules.filter(Boolean)"
            :key="m"
            :label="getModuleLabel(m)"
            :value="m"
          />
        </el-select>

        <el-select
          v-if="!props.mediaType"
          v-model="mediaTypeFilter"
          placeholder="全部类型"
          clearable
          style="width: 132px"
          @change="handleMediaTypeFilterChange"
        >
          <el-option label="全部类型" value="" />
          <el-option label="图片" value="image" />
          <el-option label="视频" value="video" />
        </el-select>

        <el-input
          v-model="searchQuery"
          placeholder="搜索文件名"
          clearable
          style="width: 220px"
          @keyup.enter="fetchFiles"
          @clear="fetchFiles"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button
          v-if="orphanCount > 0"
          :type="showOrphans ? 'warning' : 'default'"
          size="small"
          @click="toggleOrphanView"
        >
          <el-icon style="margin-right: 4px"><Warning /></el-icon>
          {{ showOrphans ? "返回全部文件" : `待清理文件（${orphanCount}）` }}
        </el-button>

        <el-button
          v-if="!isPickerMode && showOrphans && selectedFilenames.length > 0"
          type="danger"
          size="small"
          @click="handleBatchDelete"
        >
          清理所选（{{ selectedFilenames.length }}）
        </el-button>

        <span v-if="isPickerMode" class="selection-chip">{{
          selectionSummary
        }}</span>
      </div>

      <div class="toolbar-right">
        <span class="file-count">共 {{ total }} 个文件</span>
        <el-button
          v-if="isPickerMode && selectedFilenames.length > 0"
          text
          @click="clearSelection"
        >
          清空选择
        </el-button>
        <el-button
          type="primary"
          :loading="uploading"
          @click="triggerUploadPicker"
        >
          {{
            uploading ? "正在上传…" : isPickerMode ? "上传并选择" : "上传文件"
          }}
        </el-button>
        <input
          ref="uploadInputRef"
          type="file"
          :accept="accept"
          multiple
          hidden
          @change="handleUpload"
        />
      </div>
    </div>

    <div v-if="uploading" class="upload-progress-bar">
      <el-progress
        :percentage="uploadProgress"
        :stroke-width="6"
        :format="() => uploadStatusText"
        status="success"
      />
    </div>

    <div v-if="isPickerMode" class="picker-hint">
      点击素材即可选择；内容只能使用已经上传到媒体库的真实文件。
    </div>

    <div v-if="showOrphans" class="cleanup-hint">
      这些文件目前没有被内容引用。请确认不再需要后再清理；点击卡片可多选。
    </div>

    <div class="media-grid" v-if="displayFiles.length > 0">
      <div
        v-for="file in displayFiles"
        :key="file.filename"
        data-media-card
        class="media-card"
        :class="{
          selected: selectedFilenames.includes(file.filename),
          orphan: showOrphans,
        }"
        @click="toggleSelect(file)"
      >
        <div class="media-thumb">
          <video
            v-if="isVideoFile(file)"
            :src="getFullUrl(file)"
            muted
            playsinline
            preload="metadata"
          />
          <img
            v-else
            :src="getFullUrl(file)"
            :alt="file.filename"
            loading="lazy"
          />
          <span class="media-kind-badge">{{
            isVideoFile(file) ? "视频" : "图片"
          }}</span>
          <div class="media-overlay">
            <el-button size="small" circle @click.stop="copyUrl(file)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
            <el-button
              size="small"
              circle
              type="danger"
              @click.stop="handleDelete(file)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="media-info">
          <p class="media-name" :title="file.filename">
            {{ (file.original_name || file.filename).split("/").pop() }}
          </p>
          <p class="media-meta">
            {{
              file.size_bytes || file.size
                ? formatSize(file.size_bytes ?? file.size)
                : "暂无文件信息"
            }}
          </p>
          <p class="media-meta" v-if="formatTimestamp(file.createdAt)">
            {{ formatTimestamp(file.createdAt) }}
          </p>
          <p class="media-detail" v-if="file.module || file.entity_type">
            <span v-if="file.module" class="tag">{{
              getModuleLabel(file.module)
            }}</span>
            <span v-if="file.entity_type" class="tag entity"
              >{{ getEntityLabel(file.entity_type)
              }}{{
                file.entity_id ? ":" + file.entity_id.slice(0, 8) : ""
              }}</span
            >
          </p>
        </div>
      </div>
    </div>

    <el-empty
      v-else
      :description="showOrphans ? '没有待清理文件' : '媒体库中还没有文件'"
    />

    <div class="pagination" v-if="total > limit && !showOrphans">
      <el-pagination
        :current-page="page"
        :page-size="limit"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.media-library {
  padding: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-count {
  font-size: 13px;
  color: var(--lt-text-secondary);
}

.selection-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: var(--lt-radius-lg);
  background: var(--lt-primary-soft);
  color: var(--lt-primary);
  font-size: 12px;
  font-weight: 600;
}

.upload-progress-bar {
  margin-bottom: 16px;
  max-width: 400px;
}

.picker-hint {
  margin-bottom: 16px;
  color: var(--lt-text-regular);
  font-size: 13px;
}

.cleanup-hint {
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 2px solid var(--lt-warning);
  color: var(--lt-text-regular);
  font-size: 13px;
  line-height: 1.7;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.media-card {
  border: 2px solid transparent;
  border-radius: var(--lt-radius-md);
  overflow: hidden;
  background: var(--lt-bg-card);
  box-shadow: var(--lt-shadow-sm);
  cursor: default;
  transition: all 0.2s;
}

.media-card.orphan,
.media-library:has(.selection-chip) .media-card {
  cursor: pointer;
}

.media-card:hover {
  box-shadow: var(--lt-shadow-lg);
}

.media-card.selected {
  border-color: var(--lt-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--lt-primary) 20%, transparent);
}

.media-card.orphan {
  border-color: var(--lt-warning);
}

.media-card.orphan.selected {
  border-color: var(--lt-primary);
}

.media-thumb {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: var(--lt-bg-hover);
}

.media-thumb img,
.media-thumb video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-kind-badge {
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 1;
  padding: 3px 7px;
  border-radius: var(--lt-radius-sm);
  background: color-mix(in srgb, var(--lt-text-primary) 76%, transparent);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.media-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: color-mix(in srgb, var(--lt-text-primary) 40%, transparent);
  opacity: 0;
  transition: opacity 0.2s;
}

.media-card:hover .media-overlay {
  opacity: 1;
}

.media-info {
  padding: 8px 10px;
}

.media-name {
  font-size: 12px;
  color: var(--lt-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.media-meta {
  font-size: 11px;
  color: var(--lt-text-secondary);
  margin: 4px 0 0;
}

.media-detail {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin: 4px 0 0;
}

.tag {
  display: inline-block;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: var(--lt-radius-sm);
  background: var(--lt-primary-soft);
  color: var(--lt-primary);
  line-height: 1.4;
}

.tag.entity {
  background: color-mix(in srgb, var(--lt-warning) 16%, transparent);
  color: var(--lt-warning);
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 720px) {
  .toolbar,
  .toolbar-left,
  .toolbar-right {
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .toolbar-left :deep(.el-select),
  .toolbar-left :deep(.el-input) {
    width: 100% !important;
  }

  .toolbar-right {
    justify-content: space-between;
  }

  .media-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .media-overlay {
    align-items: flex-end;
    justify-content: flex-end;
    padding: 8px;
    background: linear-gradient(
      transparent 50%,
      color-mix(in srgb, var(--lt-text-primary) 45%, transparent)
    );
    opacity: 1;
  }
}

@media (max-width: 380px) {
  .media-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .media-card,
  .media-overlay {
    transition: none;
  }
}
</style>
