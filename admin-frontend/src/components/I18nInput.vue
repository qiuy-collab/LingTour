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
  (event: 'update:modelValue', value: I18nObject): void
}>()

const value = computed(() => props.modelValue || { zh: '', en: '' })

function updateLocale(locale: keyof I18nObject, nextValue: string) {
  emit('update:modelValue', { ...value.value, [locale]: nextValue })
}
</script>

<template>
  <div class="bilingual-input" :class="{ 'is-textarea': type === 'textarea' }">
    <label class="language-field">
      <span class="language-label"><strong>中文</strong><small>ZH</small></span>
      <el-input
        :model-value="value.zh || ''"
        :type="type"
        :rows="rows"
        :placeholder="placeholder || '请输入中文内容'"
        @update:model-value="updateLocale('zh', $event)"
      />
    </label>
    <label class="language-field">
      <span class="language-label"><strong>英文</strong><small>EN</small></span>
      <el-input
        :model-value="value.en || ''"
        :type="type"
        :rows="rows"
        :placeholder="placeholder || 'Enter English content'"
        @update:model-value="updateLocale('en', $event)"
      />
    </label>
  </div>
</template>

<style scoped>
.bilingual-input {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}

.language-field {
  display: grid;
  min-width: 0;
  gap: 7px;
}

.language-label {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: var(--lt-text-secondary);
  font-size: 11px;
  line-height: 1;
}

.language-label strong {
  color: var(--lt-text-regular);
  font-weight: 650;
}

.language-label small {
  color: var(--lt-text-placeholder);
  font-size: 9px;
  letter-spacing: .08em;
}

@media (max-width: 640px) {
  .bilingual-input {
    grid-template-columns: 1fr;
  }
}
</style>
