<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import MediaLibraryBrowser from '@/components/media/MediaLibraryBrowser.vue'

type MediaBrowserExpose = {
  getSelectedUrls: () => string[]
  resetSelection: () => void
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    multiple?: boolean
    limit?: number
    accept?: string
    mediaType?: '' | 'image' | 'video'
    module?: string
    entityType?: string
    entityId?: string
    selectedUrls?: string[]
  }>(),
  {
    multiple: false,
    limit: 1,
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    mediaType: '',
    module: '',
    entityType: '',
    entityId: '',
    selectedUrls: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [urls: string[]]
}>()

const browserRef = ref<MediaBrowserExpose>()
const selectionCount = ref(0)
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})
const mediaNoun = computed(() =>
  props.mediaType === 'video' ? '视频' : props.mediaType === 'image' ? '图片' : '媒体文件',
)
const dialogTitle = computed(() =>
  props.multiple ? '选择媒体文件' : `选择${mediaNoun.value}`,
)
const selectionLabel = computed(() => {
  if (!selectionCount.value) {
    return props.multiple ? '尚未选择媒体文件' : `尚未选择${mediaNoun.value}`
  }

  if (props.multiple) {
    return `已选择 ${selectionCount.value}/${props.limit} 项`
  }

  return '已选择 1 项'
})

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      browserRef.value?.resetSelection()
      selectionCount.value = 0
    }
  },
)

function handleConfirm() {
  const urls = browserRef.value?.getSelectedUrls() || []
  if (!urls.length) {
    ElMessage.warning(`请先选择至少一个${mediaNoun.value}`)
    return
  }
  emit('confirm', urls)
  visible.value = false
}

function handleSelectionChange(files: Array<{ url: string }>) {
  selectionCount.value = files.length
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="min(1100px, calc(100vw - 32px))"
    top="3vh"
    destroy-on-close
    class="media-picker-dialog"
  >
    <div class="dialog-intro">
      <p class="dialog-summary">{{ selectionLabel }}</p>
      <p class="dialog-meta">
        <span>{{ multiple ? `最多可选 ${limit} 项` : `选择一个${mediaNoun}` }}</span>
        <span v-if="module">目录：{{ module }}</span>
      </p>
    </div>

    <MediaLibraryBrowser
      ref="browserRef"
      mode="picker"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :media-type="mediaType"
      :default-module="module"
      :entity-type="entityType"
      :entity-id="entityId"
      :selected-urls="selectedUrls"
      @selection-change="handleSelectionChange"
    />

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :disabled="selectionCount === 0" @click="handleConfirm">
          {{ selectionCount === 0 ? '选择媒体' : `使用所选 ${selectionCount} 项` }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-intro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  margin-bottom: 16px;
}

.dialog-summary {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--lt-text-primary);
}

.dialog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin: 0;
  font-size: 12px;
  color: var(--lt-text-secondary);
}

@media (max-width: 767px) {
  .dialog-intro {
    align-items: flex-start;
  }
}
</style>
