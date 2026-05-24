<script setup lang="ts">
import { computed } from 'vue'
import type { I18nObject } from '@/types/common'
import { useEditorLocale } from '@/composables/useEditorLocale'

const props = defineProps<{
  modelValue: I18nObject
  label?: string
  type?: 'input' | 'textarea'
  rows?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: I18nObject): void
}>()

const { editorLocale } = useEditorLocale()

const internalValue = computed({
  get: () => props.modelValue || { zh: '', en: '' },
  set: (val) => emit('update:modelValue', val),
})

const currentValue = computed(() => internalValue.value[editorLocale.value] || '')

const currentPlaceholder = computed(() =>
  props.placeholder ||
  (editorLocale.value === 'zh' ? '请输入中文内容' : 'Enter English content'),
)

const localeLabel = computed(() => (editorLocale.value === 'zh' ? '中文 (ZH)' : 'English (EN)'))

const updateCurrent = (val: string) => {
  internalValue.value = { ...internalValue.value, [editorLocale.value]: val }
}
</script>

<template>
  <div class="i18n-input">
    <div class="locale-indicator">{{ localeLabel }}</div>
    <el-input
      :model-value="currentValue"
      @update:model-value="updateCurrent"
      :type="type"
      :rows="rows"
      :placeholder="currentPlaceholder"
    />
  </div>
</template>

<style scoped>
.i18n-input {
  width: 100%;
}

.locale-indicator {
  margin-bottom: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1;
}
</style>
