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
    module?: string
    entityType?: string
    entityId?: string
    selectedUrls?: string[]
  }>(),
  {
    multiple: false,
    limit: 1,
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
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      browserRef.value?.resetSelection()
    }
  },
)

function handleConfirm() {
  const urls = browserRef.value?.getSelectedUrls() || []
  if (!urls.length) {
    ElMessage.warning('请先选择图片')
    return
  }
  emit('confirm', urls)
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="媒体库"
    width="1100px"
    top="5vh"
    destroy-on-close
  >
    <MediaLibraryBrowser
      ref="browserRef"
      mode="picker"
      :multiple="multiple"
      :limit="limit"
      :default-module="module"
      :entity-type="entityType"
      :entity-id="entityId"
      :seed-urls="selectedUrls"
      :selected-urls="selectedUrls"
    />

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
