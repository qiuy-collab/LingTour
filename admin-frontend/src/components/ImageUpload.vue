<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Delete,
  Picture,
  VideoCamera,
  ZoomIn,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { resolveMediaUrl } from '@/utils/media'
import MediaPickerDialog from '@/components/media/MediaPickerDialog.vue'

type UploadItem = {
  uid: string
  name: string
  url: string
  rawUrl: string
  kind: 'image' | 'video'
}

const props = withDefaults(
  defineProps<{
    modelValue: string | string[]
    mode?: 'single' | 'multiple'
    multiple?: boolean
    limit?: number
    accept?: string
    mediaKind?: 'image' | 'video' | 'mixed'
    module?: string
    sortable?: boolean
    entityType?: string
    entityId?: string
  }>(),
  {
    mode: 'single',
    multiple: false,
    limit: 1,
    accept: '',
    mediaKind: 'image',
    module: '',
    sortable: true,
    entityType: '',
    entityId: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const fileList = ref<UploadItem[]>([])
const pickerVisible = ref(false)
const isMultiple = computed(() => props.mode === 'multiple' || props.multiple)
const uploadLimit = computed(() => (isMultiple.value ? props.limit : 1))
const hasReachedLimit = computed(
  () => isMultiple.value && fileList.value.length >= uploadLimit.value,
)
const effectiveAccept = computed(() => {
  if (props.accept) return props.accept
  if (props.mediaKind === 'video') return 'video/mp4,video/webm,video/quicktime,video/x-m4v'
  if (props.mediaKind === 'mixed')
    return 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/x-m4v'
  return 'image/jpeg,image/png,image/webp,image/gif'
})
const mediaNoun = computed(() => (props.mediaKind === 'video' ? '视频' : '图片'))

function isVideoSource(url: string) {
  if (props.mediaKind === 'video') return true
  return /\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(url)
}

const triggerLabel = computed(() => {
  if (!fileList.value.length) return '选择媒体'
  if (!isMultiple.value) return `更换${mediaNoun.value}`
  if (hasReachedLimit.value) return '管理已选文件'
  return '继续添加'
})
const helperCopy = computed(() => {
  if (isMultiple.value) {
    return `已选择 ${fileList.value.length}/${uploadLimit.value}`
  }
  return fileList.value.length
    ? `已选择 1 个${mediaNoun.value}`
    : `尚未选择${mediaNoun.value}`
})

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      fileList.value = []
      return
    }

    const urls =
      isMultiple.value && Array.isArray(value)
        ? value
        : typeof value === 'string' && value
          ? [value]
          : []

    fileList.value = urls.map((url, index) => ({
      uid: `${index}-${url}`,
      name: `image-${index + 1}`,
      url: resolveMediaUrl(url),
      rawUrl: url,
      kind: isVideoSource(url) ? 'video' : 'image',
    }))
  },
  { immediate: true },
)

function readUrls(): string[] {
  if (isMultiple.value) {
    return Array.isArray(props.modelValue) ? [...props.modelValue] : []
  }

  return typeof props.modelValue === 'string' && props.modelValue ? [props.modelValue] : []
}

const currentUrls = computed(() => readUrls())

function syncValue(urls: string[]) {
  if (isMultiple.value) {
    emit('update:modelValue', urls)
    return
  }

  emit('update:modelValue', urls[0] || '')
}

function openMediaPicker() {
  pickerVisible.value = true
}

function handlePickerConfirm(urls: string[]) {
  if (!urls.length) return

  if (isMultiple.value) {
    const existing = readUrls()
    const deduped = urls.filter((url) => !existing.includes(url))
    const remainingSlots = Math.max(uploadLimit.value - existing.length, 0)
    const nextUrls = existing.concat(deduped.slice(0, remainingSlots))

    if (deduped.length > remainingSlots) {
      ElMessage.warning(`最多可选择 ${uploadLimit.value} 个媒体文件`)
    }

    syncValue(nextUrls)
    return
  }

  syncValue([urls[0]])
}

function handleRemove(index: number) {
  const urls = readUrls()
  urls.splice(index, 1)
  syncValue(urls)
}

function moveItem(index: number, delta: -1 | 1) {
  if (!isMultiple.value) return

  const target = index + delta
  const urls = readUrls()
  if (target < 0 || target >= urls.length) return
  ;[urls[index], urls[target]] = [urls[target], urls[index]]
  syncValue(urls)
}
</script>

<template>
  <div class="image-upload">
    <div class="image-preview-list">
      <div v-for="(item, index) in fileList" :key="item.uid" class="image-preview-item">
        <video
          v-if="item.kind === 'video'"
          :src="item.url"
          class="preview-image preview-video"
          muted
          playsinline
          preload="metadata"
        />
        <el-image
          v-else
          :src="item.url"
          fit="cover"
          class="preview-image"
          :preview-src-list="[item.url]"
          preview-teleported
        />
        <div class="image-overlay">
          <el-icon class="preview-icon">
            <ZoomIn />
          </el-icon>
          <el-icon
            v-if="isMultiple && sortable"
            class="sort-icon"
            :class="{ disabled: index === 0 }"
            @click.stop="moveItem(index, -1)"
          >
            <ArrowLeft />
          </el-icon>
          <el-icon
            v-if="isMultiple && sortable"
            class="sort-icon"
            :class="{ disabled: index === fileList.length - 1 }"
            @click.stop="moveItem(index, 1)"
          >
            <ArrowRight />
          </el-icon>
          <el-icon class="delete-icon" @click.stop="handleRemove(index)">
            <Delete />
          </el-icon>
        </div>
      </div>

      <button type="button" class="upload-trigger" @click="openMediaPicker">
        <el-icon class="upload-icon">
          <VideoCamera v-if="mediaKind === 'video'" />
          <Picture v-else />
        </el-icon>
        <span class="upload-trigger-text">{{ triggerLabel }}</span>
      </button>
    </div>

    <div class="upload-meta">
      <span>{{ helperCopy }}</span>
      <span>{{
        isMultiple ? `最多 ${uploadLimit} 个媒体文件` : `单个${mediaNoun}`
      }}</span>
      <span>从媒体库选择，或在弹窗中上传本地文件。</span>
      <span v-if="module">分类：{{ module }}</span>
    </div>

    <MediaPickerDialog
      v-model="pickerVisible"
      :multiple="isMultiple"
      :limit="uploadLimit"
      :accept="effectiveAccept"
      :media-type="mediaKind === 'mixed' ? undefined : mediaKind"
      :module="module"
      :entity-type="entityType || undefined"
      :entity-id="entityId || undefined"
      :selected-urls="currentUrls"
      @confirm="handlePickerConfirm"
    />
  </div>
</template>

<style scoped>
.image-upload {
  width: 100%;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-preview-item {
  position: relative;
  width: 120px;
  height: 120px;
  overflow: hidden;
  border: 1px solid var(--lt-border-color);
  border-radius: var(--lt-radius-md);
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.preview-video {
  display: block;
  object-fit: cover;
  background: var(--lt-text-primary);
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: color-mix(in srgb, var(--lt-text-primary) 52%, transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-preview-item:hover .image-overlay {
  opacity: 1;
}

.preview-icon,
.sort-icon,
.delete-icon {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.sort-icon.disabled {
  opacity: 0.35;
  pointer-events: none;
}

.delete-icon:hover {
  color: var(--lt-danger);
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 120px;
  height: 120px;
  border: 1px dashed var(--lt-border-color);
  border-radius: var(--lt-radius-md);
  background: var(--lt-bg-card);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.upload-trigger:hover {
  border-color: var(--lt-primary);
  background: var(--lt-bg-hover);
  transform: translateY(-1px);
}

.upload-icon {
  font-size: 28px;
  color: var(--lt-primary);
}

.upload-trigger-text {
  font-size: 12px;
  color: var(--lt-text-regular);
  text-align: center;
  padding: 0 8px;
}

.upload-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--lt-text-secondary);
}
</style>
