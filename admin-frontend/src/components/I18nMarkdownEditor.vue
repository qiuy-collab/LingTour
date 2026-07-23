<script setup lang="ts">
import { computed } from 'vue'
import { readContentValue, type I18nObject } from '@/types/common'

const props = defineProps<{
  modelValue: I18nObject
  rows?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: I18nObject): void
}>()

const body = computed(() => readContentValue(props.modelValue))

function updateBody(nextValue: string) {
  emit('update:modelValue', { zh: '', en: nextValue })
}
</script>

<template>
  <label class="body-editor">
    <span class="body-label">
      <strong>正文</strong>
      <small>请填写英文，支持 Markdown，前台按原文展示</small>
    </span>
    <el-input
      :model-value="body"
      type="textarea"
      :rows="rows"
      :placeholder="placeholder || '请输入英文正文内容'"
      @update:model-value="updateBody"
    />
  </label>
</template>

<style scoped>
.body-editor {
  display: grid;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.body-label {
  display: flex;
  align-items: baseline;
  gap: 7px;
  color: var(--lt-text-secondary);
  font-size: 11px;
  line-height: 1.2;
}

.body-label strong {
  color: var(--lt-text-regular);
  font-weight: 650;
}

.body-label small {
  color: var(--lt-text-placeholder);
  font-size: 10px;
}
</style>
