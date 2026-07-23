<script setup lang="ts">
import { computed } from 'vue'
import type { I18nObject } from '@/types/common'

const props = defineProps<{
  modelValue: I18nObject
  rows?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: I18nObject): void
}>()

const value = computed(() => props.modelValue || { zh: '', en: '' })
const body = computed(() => value.value.zh?.trim() ? value.value.zh : value.value.en || '')

function updateBody(nextValue: string) {
  emit('update:modelValue', { zh: nextValue, en: nextValue })
}
</script>

<template>
  <label class="body-editor">
    <span class="body-label"><strong>正文</strong><small>支持 Markdown</small></span>
    <el-input
      :model-value="body"
      type="textarea"
      :rows="rows"
      :placeholder="placeholder || '请输入正文内容'"
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
  line-height: 1;
}

.body-label strong {
  color: var(--lt-text-regular);
  font-weight: 650;
}

.body-label small {
  color: var(--lt-text-placeholder);
  font-size: 9px;
  letter-spacing: .08em;
}

</style>
