<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, Delete, Search, Warning } from '@element-plus/icons-vue'
import { queryMediaFiles, getOrphanFiles, deleteMediaFile, uploadMediaFile } from '@/api/media'
import type { MediaFile } from '@/api/media'
import { resolveMediaUrl } from '@/utils/media'

const props = withDefaults(
  defineProps<{
    mode?: 'manage' | 'picker'
    multiple?: boolean
    limit?: number
    accept?: string
    defaultModule?: string
    entityType?: string
    entityId?: string
    seedUrls?: string[]
    selectedUrls?: string[]
  }>(),
  {
    mode: 'manage',
    multiple: false,
    limit: 1,
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    defaultModule: '',
    entityType: '',
    entityId: '',
    seedUrls: () => [],
    selectedUrls: () => [],
  },
)

const emit = defineEmits<{
  select: [file: MediaFile]
  selectionChange: [files: MediaFile[]]
}>()

const loading = ref(false)
const files = ref<MediaFile[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(30)
const moduleFilter = ref(props.defaultModule)
const searchQuery = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatusText = ref('')
const selectedFilenames = ref<string[]>([])
const showOrphans = ref(false)
const orphanCount = ref(0)
const uploadInputRef = ref<HTMLInputElement | null>(null)

const modules = ['', 'cities', 'routes', 'shop', 'community', 'events', 'home', 'avatars', 'interpreting', 'seed']
const isPickerMode = computed(() => props.mode === 'picker')
const canSelectMore = computed(() => (props.multiple ? selectedFilenames.value.length < props.limit : true))
const selectionSummary = computed(() => {
  if (!isPickerMode.value) {
    return `${selectedFilenames.value.length} selected`
  }

  if (props.multiple) {
    return `${selectedFilenames.value.length} / ${props.limit} selected`
  }

  return selectedFilenames.value.length ? '1 image selected' : 'No image selected'
})

function unwrapListPayload<T>(payload: unknown): { data: T[]; total: number } {
  if (Array.isArray(payload)) {
    return { data: payload as T[], total: payload.length }
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (Array.isArray(record.data)) {
      return {
        data: record.data as T[],
        total: typeof record.total === 'number' ? record.total : record.data.length,
      }
    }
    if (Array.isArray(record.items)) {
      return {
        data: record.items as T[],
        total: typeof record.total === 'number' ? record.total : record.items.length,
      }
    }
  }

  return { data: [], total: 0 }
}

function buildSelectionKey(url: string) {
  const trimmed = url.trim()
  if (trimmed.startsWith('/uploads/')) {
    return trimmed.replace(/^\/uploads\//, '')
  }

  try {
    const parsed = new URL(trimmed)
    const match = parsed.pathname.match(/^\/uploads\/(.+)$/)
    if (match?.[1]) return match[1]
  } catch {
    // ignore parse failures
  }

  return `seed:${trimmed}`
}

function extractDisplayName(url: string) {
  return url.split('/').pop() || 'referenced-image'
}

function isVirtualFile(file: MediaFile) {
  return file.filename.startsWith('seed:')
}

const seedFiles = computed<MediaFile[]>(() => {
  const urls = Array.isArray(props.seedUrls) ? props.seedUrls : []
  return urls
    .filter((url) => typeof url === 'string' && url.trim())
    .map((url) => ({
      filename: buildSelectionKey(url),
      url,
      size: 0,
      size_bytes: 0,
      createdAt: '',
      module: moduleFilter.value || props.defaultModule || 'referenced',
      original_name: extractDisplayName(url),
    }))
})

const displayFiles = computed<MediaFile[]>(() => {
  const merged = new Map<string, MediaFile>()
  for (const file of files.value) {
    merged.set(file.filename, file)
  }
  for (const file of seedFiles.value) {
    if (!merged.has(file.filename)) merged.set(file.filename, file)
  }
  return [...merged.values()]
})

const selectedMediaFiles = computed(() => {
  const selectedSet = new Set(selectedFilenames.value)
  return displayFiles.value.filter((file) => selectedSet.has(file.filename))
})

watch(
  () => props.defaultModule,
  (value) => {
    moduleFilter.value = value
  },
)

watch(selectedMediaFiles, (value) => {
  emit('selectionChange', value)
})

watch(
  () => props.selectedUrls,
  (value) => {
    const urls = Array.isArray(value) ? value : []
    selectedFilenames.value = urls
      .filter((url) => typeof url === 'string' && url.trim())
      .map((url) => buildSelectionKey(url))
  },
  { immediate: true },
)

async function fetchFiles() {
  loading.value = true
  try {
    if (showOrphans.value) {
      const res = await getOrphanFiles()
      const listPayload = unwrapListPayload<MediaFile>(res.data?.data ?? res.data)
      files.value = listPayload.data
      total.value = listPayload.total
    } else {
      const res = await queryMediaFiles({
        page: page.value,
        limit: limit.value,
        module: moduleFilter.value || undefined,
        search: searchQuery.value || undefined,
        entityType: props.entityType || undefined,
        entityId: props.entityId || undefined,
      })
      const listPayload = unwrapListPayload<MediaFile>(res.data?.data ?? res.data)
      files.value = listPayload.data
      total.value = listPayload.total
    }
  } catch {
    ElMessage.error('Failed to load media files')
  } finally {
    loading.value = false
  }
}

async function checkOrphanCount() {
  try {
    const res = await getOrphanFiles()
    orphanCount.value = unwrapListPayload<MediaFile>(res.data?.data ?? res.data).total
  } catch {
    // ignore
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFullUrl(file: MediaFile): string {
  return resolveMediaUrl(file.url)
}

function formatTimestamp(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString()
}

function copyUrl(file: MediaFile) {
  navigator.clipboard.writeText(getFullUrl(file))
  ElMessage.success('Image URL copied')
}

async function handleDelete(file: MediaFile) {
  if (isVirtualFile(file)) return

  try {
    await ElMessageBox.confirm(
      `Delete "${file.filename}" permanently? This cannot be undone.`,
      'Delete file',
      { type: 'warning' },
    )
    await deleteMediaFile(file.filename)
    selectedFilenames.value = selectedFilenames.value.filter((item) => item !== file.filename)
    ElMessage.success('File deleted')
    await fetchFiles()
    await checkOrphanCount()
  } catch {
    // cancelled
  }
}

async function handleBatchDelete() {
  if (selectedFilenames.value.length === 0) return

  const deletable = selectedFilenames.value.filter((item) => !item.startsWith('seed:'))
  if (!deletable.length) {
    ElMessage.warning('Referenced images cannot be deleted from the media library')
    return
  }

  try {
    await ElMessageBox.confirm(
      `Delete ${deletable.length} selected files?`,
      'Batch delete',
      { type: 'warning' },
    )
    const promises = deletable.map((filename) => deleteMediaFile(filename))
    await Promise.allSettled(promises)
    selectedFilenames.value = selectedFilenames.value.filter((item) => item.startsWith('seed:'))
    ElMessage.success('Batch delete completed')
    await fetchFiles()
    await checkOrphanCount()
  } catch {
    // cancelled
  }
}

function toggleSelect(file: MediaFile) {
  if (!isPickerMode.value && !showOrphans.value) {
    const exists = selectedFilenames.value.includes(file.filename)
    selectedFilenames.value = exists
      ? selectedFilenames.value.filter((item) => item !== file.filename)
      : selectedFilenames.value.concat(file.filename)
    return
  }

  if (props.multiple) {
    const exists = selectedFilenames.value.includes(file.filename)
    if (exists) {
      selectedFilenames.value = selectedFilenames.value.filter((item) => item !== file.filename)
      return
    }
    if (!canSelectMore.value) {
      ElMessage.warning(`At most ${props.limit} files can be selected`)
      return
    }
    selectedFilenames.value = selectedFilenames.value.concat(file.filename)
    return
  }

  selectedFilenames.value = [file.filename]
  emit('select', file)
}

function clearSelection() {
  selectedFilenames.value = []
}

function triggerUploadPicker() {
  uploadInputRef.value?.click()
}

async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const inputFiles = input.files
  if (!inputFiles || inputFiles.length === 0) return

  const filesArr = Array.from(inputFiles)
  uploading.value = true
  uploadProgress.value = 0
  const totalCount = filesArr.length
  let completedCount = 0
  const uploadedFiles: MediaFile[] = []

  try {
    const results = await Promise.allSettled(
      filesArr.map(async (file) => {
        const res = await uploadMediaFile(
          file,
          moduleFilter.value || props.defaultModule || undefined,
          props.entityType || undefined,
          props.entityId || undefined,
          (percent) => {
            uploadProgress.value = percent
          },
        )
        const payload = res.data?.data ?? res.data
        completedCount++
        uploadProgress.value = Math.round((completedCount / totalCount) * 100)
        uploadStatusText.value = `${completedCount} / ${totalCount}`
        const mediaFile: MediaFile = {
          filename: payload?.filename || payload?.path || payload?.url || file.name,
          url: payload?.url || payload?.path || '',
          size: payload?.size ?? file.size,
          size_bytes: payload?.size ?? file.size,
          createdAt: payload?.createdAt || new Date().toISOString(),
          module: payload?.module || moduleFilter.value || props.defaultModule || null,
          entity_type: payload?.entityType || props.entityType || null,
          entity_id: payload?.entityId || props.entityId || null,
          original_name: payload?.originalName || payload?.originalname || file.name,
        }
        uploadedFiles.push(mediaFile)
        return mediaFile
      }),
    )

    const failedCount = results.filter((result) => result.status === 'rejected').length
    if (failedCount === 0) {
      ElMessage.success(`${totalCount} file(s) uploaded`)
    } else if (completedCount - failedCount > 0) {
      ElMessage.warning(`${totalCount - failedCount} uploaded, ${failedCount} failed`)
    } else {
      ElMessage.error('All uploads failed')
    }

    await fetchFiles()
    await checkOrphanCount()

    if (isPickerMode.value && uploadedFiles.length) {
      if (props.multiple) {
        const next = [...selectedFilenames.value]
        for (const uploaded of uploadedFiles) {
          if (!uploaded.filename || next.includes(uploaded.filename)) continue
          if (next.length >= props.limit) break
          next.push(uploaded.filename)
        }
        selectedFilenames.value = next
      } else if (uploadedFiles[0]?.filename) {
        selectedFilenames.value = [uploadedFiles[0].filename]
      }
    }
  } catch {
    ElMessage.error('Upload failed')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    uploadStatusText.value = ''
    input.value = ''
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchFiles()
}

function resetSelection() {
  const urls = Array.isArray(props.selectedUrls) ? props.selectedUrls : []
  selectedFilenames.value = urls
    .filter((url) => typeof url === 'string' && url.trim())
    .map((url) => buildSelectionKey(url))
}

function getSelectedUrls() {
  return selectedMediaFiles.value.map((file) => file.url)
}

defineExpose({
  fetchFiles,
  resetSelection,
  getSelectedUrls,
  selectedMediaFiles,
})

onMounted(() => {
  fetchFiles()
  checkOrphanCount()
})
</script>

<template>
  <div class="media-library" v-loading="loading">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select v-model="moduleFilter" placeholder="All modules" clearable @change="fetchFiles" style="width: 140px">
          <el-option label="All" value="" />
          <el-option v-for="m in modules.filter(Boolean)" :key="m" :label="m" :value="m" />
        </el-select>

        <el-input
          v-model="searchQuery"
          placeholder="Search files..."
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
          @click="showOrphans = !showOrphans; page = 1; fetchFiles()"
        >
          <el-icon style="margin-right: 4px"><Warning /></el-icon>
          {{ showOrphans ? 'Back to library' : `Orphans (${orphanCount})` }}
        </el-button>

        <el-button
          v-if="!isPickerMode && selectedFilenames.length > 0"
          type="danger"
          size="small"
          @click="handleBatchDelete"
        >
          Delete selected ({{ selectedFilenames.length }})
        </el-button>

        <span v-if="isPickerMode" class="selection-chip">{{ selectionSummary }}</span>
      </div>

      <div class="toolbar-right">
        <span class="file-count">Total {{ total }} file(s)</span>
        <el-button
          v-if="isPickerMode && selectedFilenames.length > 0"
          text
          @click="clearSelection"
        >
          Clear selection
        </el-button>
        <el-button type="primary" :loading="uploading" @click="triggerUploadPicker">
          {{ uploading ? 'Uploading...' : (isPickerMode ? 'Upload to library' : 'Upload file') }}
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

    <div class="picker-hint" v-if="isPickerMode">
      Click cards to add or remove them from the selection. Referenced images stay available here even when they were not uploaded through the media library.
    </div>

    <div class="media-grid" v-if="displayFiles.length > 0">
      <div
        v-for="file in displayFiles"
        :key="file.filename"
        class="media-card"
        :class="{ selected: selectedFilenames.includes(file.filename), orphan: showOrphans }"
        @click="toggleSelect(file)"
      >
        <div class="media-thumb">
          <img :src="getFullUrl(file)" :alt="file.filename" loading="lazy" />
          <div class="media-overlay">
            <el-button size="small" circle @click.stop="copyUrl(file)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
            <el-button
              v-if="!isVirtualFile(file)"
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
          <p class="media-name" :title="file.filename">{{ (file.original_name || file.filename).split('/').pop() }}</p>
          <p class="media-meta">{{ file.size_bytes || file.size ? formatSize(file.size_bytes ?? file.size) : 'Referenced image' }}</p>
          <p class="media-meta" v-if="formatTimestamp(file.createdAt)">{{ formatTimestamp(file.createdAt) }}</p>
          <p class="media-detail" v-if="file.module || file.entity_type">
            <span v-if="file.module" class="tag">{{ file.module }}</span>
            <span v-if="file.entity_type" class="tag entity">{{ file.entity_type }}{{ file.entity_id ? ':' + file.entity_id.slice(0, 8) : '' }}</span>
          </p>
        </div>
      </div>
    </div>

    <el-empty v-else :description="showOrphans ? 'No orphan files' : 'No media files yet'" />

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
  cursor: pointer;
  transition: all 0.2s;
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

.media-thumb img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
</style>
