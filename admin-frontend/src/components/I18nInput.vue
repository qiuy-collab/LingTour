<script setup lang="ts">
import { computed } from 'vue'
import { readContentValue, type I18nObject } from '@/types/common'

const props = defineProps<{
  modelValue: I18nObject
  label?: string
  type?: 'input' | 'textarea'
  rows?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: I18nObject): void
}>()

const content = computed(() => readContentValue(props.modelValue))

function updateContent(nextValue: string) {
  emit('update:modelValue', { zh: '', en: nextValue })
}
</script>

<template>
  <label class="content-field">
    <span v-if="label" class="content-label">{{ label }}</span>
    <el-input
      :model-value="content"
      :type="type"
      :rows="rows"
      :placeholder="placeholder || '请输入英文内容，前台将按原文展示'"
      @update:model-value="updateContent"
    />
  </label>
</template>

<style scoped>
.content-field {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 7px;
}

.content-label {
  color: var(--lt-text-regular);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.3;
}
</style>
