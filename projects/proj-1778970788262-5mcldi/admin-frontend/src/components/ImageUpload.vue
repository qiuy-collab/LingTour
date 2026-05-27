<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, Delete, Loading, Plus, ZoomIn } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadMediaFile } from '@/api/media'
import { resolveMediaUrl } from '@/utils/media'

type UploadItem = {
  uid: string
  name: string
  url: string
  rawUrl: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string | string[]
    mode?: 'single' | 'multiple'
    multiple?: boolean
    limit?: number
    accept?: string
    module?: string
    sortable?: boolean
  }>(),
  {
    mode: 'single',
    multiple: false,
    limit: 1,
    accept: 'image/*',
    module: '',
    sortable: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const fileInputRef = ref<HTMLInputElement>()
const fileList = ref<UploadItem[]>([])
const uploading = ref(false)
const isMultiple = computed(() => props.mode === 'multiple' || props.multiple)
const uploadLimit = computed(() => (isMultiple.value ? props.limit : 1))

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

function syncValue(urls: string[]) {
  if (isMultiple.value) {
    emit('update:modelValue', urls)
    return
  }

  emit('update:modelValue', urls[0] || '')
}

function parseUploadUrl(payload: any): string {
  return payload?.data?.url || payload?.url || ''
}

function validateFile(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }

  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB')
    return false
  }

  return true
}

function openFileDialog() {
  if (uploading.value || fileList.value.length >= uploadLimit.value) return
  fileInputRef.value?.click()
}

async function handleNativeChange(event: Event) {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files || [])
  if (!selectedFiles.length) return

  const availableSlots = Math.max(uploadLimit.value - fileList.value.length, isMultiple.value ? 0 : 1)
  const filesToUpload = selectedFiles.filter(validateFile).slice(0, isMultiple.value ? availableSlots : 1)

  if (!filesToUpload.length) {
    input.value = ''
    return
  }

  if (isMultiple.value && selectedFiles.length > availableSlots) {
    ElMessage.warning(`最多只能上传 ${uploadLimit.value} 张图片`)
  }

  uploading.value = true
  try {
    const nextUrls = isMultiple.value ? readUrls() : []

    for (const file of filesToUpload) {
      const response = await uploadMediaFile(file, props.module || undefined)
      const url = parseUploadUrl(response.data)
      if (!url) {
        throw new Error('上传响应缺少图片地址')
      }

      if (isMultiple.value) {
        nextUrls.push(url)
      } else {
        nextUrls.splice(0, nextUrls.length, url)
      }
    }

    syncValue(nextUrls)
    ElMessage.success(isMultiple.value ? '图片已上传' : '封面已更新')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.message || '上传失败')
  } finally {
    uploading.value = false
    input.value = ''
  }
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
    <input
      ref="fileInputRef"
      class="native-file-input"
      type="file"
      :accept="accept"
      :multiple="isMultiple"
      @change="handleNativeChange"
    />

    <div class="image-preview-list">
      <div
        v-for="(item, index) in fileList"
        :key="item.uid"
        class="image-preview-item"
      >
        <el-image
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

      <button
        v-if="fileList.length < uploadLimit"
        type="button"
        class="upload-trigger"
        :disabled="uploading"
        @click="openFileDialog"
      >
        <el-icon v-if="uploading" class="upload-icon is-loading"><Loading /></el-icon>
        <el-icon v-else class="upload-icon"><Plus /></el-icon>
      </button>
    </div>

    <div class="upload-meta">
      <span>{{ isMultiple ? `最多 ${uploadLimit} 张图` : '单图上传' }}</span>
      <span>支持 JPG / PNG / WEBP / GIF，最大 10MB</span>
      <span v-if="module">目录：{{ module }}</span>
    </div>
  </div>
</template>

<style scoped>
.image-upload {
  width: 100%;
}

.native-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
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
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.52);
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
  color: #f56c6c;
}

.upload-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.upload-trigger:disabled {
  cursor: wait;
}

.upload-trigger:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 28px;
  color: #c0c4cc;
}

.upload-icon.is-loading {
  color: #409eff;
  animation: rotate 1s linear infinite;
}

.upload-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  color: #8b95a4;
  font-size: 12px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
