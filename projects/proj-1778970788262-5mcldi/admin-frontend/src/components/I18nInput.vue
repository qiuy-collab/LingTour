<script setup lang="ts">
import { computed } from 'vue'
import type { I18nObject } from '@/types/common'

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

const internalValue = computed({
  get: () => props.modelValue || { zh: '', en: '' },
  set: (val) => emit('update:modelValue', val)
})

const updateZh = (val: string) => {
  internalValue.value = { ...internalValue.value, zh: val }
}

const updateEn = (val: string) => {
  internalValue.value = { ...internalValue.value, en: val }
}
</script>

<template>
  <div class="i18n-input">
    <el-tabs type="border-card">
      <el-tab-pane label="中文 (ZH)">
        <el-input
          :model-value="internalValue.zh"
          @update:model-value="updateZh"
          :type="type"
          :rows="rows"
          :placeholder="placeholder || '请输入中文内容'"
        />
      </el-tab-pane>
      <el-tab-pane label="English (EN)">
        <el-input
          :model-value="internalValue.en"
          @update:model-value="updateEn"
          :type="type"
          :rows="rows"
          :placeholder="placeholder || 'Enter English content'"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.i18n-input {
  margin-bottom: 0;
  width: 100%;
}
:deep(.el-tabs--border-card) {
  border: 1px solid #dcdfe6;
  box-shadow: none;
}
:deep(.el-tabs__content) {
  padding: 12px;
}
</style>
