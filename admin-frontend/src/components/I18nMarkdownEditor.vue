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

function updateLocale(locale: keyof I18nObject, nextValue: string) {
  emit('update:modelValue', { ...value.value, [locale]: nextValue })
}
</script>

<template>
  <div class="bilingual-markdown">
    <label class="language-editor">
      <span class="language-label"><strong>中文正文</strong><small>ZH · MARKDOWN</small></span>
      <el-input
        :model-value="value.zh || ''"
        type="textarea"
        :rows="rows"
        :placeholder="placeholder || '请输入中文 Markdown 内容'"
        @update:model-value="updateLocale('zh', $event)"
      />
    </label>
    <label class="language-editor">
      <span class="language-label"><strong>英文正文</strong><small>EN · MARKDOWN</small></span>
      <el-input
        :model-value="value.en || ''"
        type="textarea"
        :rows="rows"
        :placeholder="placeholder || 'Enter English Markdown content'"
        @update:model-value="updateLocale('en', $event)"
      />
    </label>
  </div>
</template>

<style scoped>
.bilingual-markdown {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
}

.language-editor {
  display: grid;
  min-width: 0;
  gap: 8px;
}

.language-label {
  display: flex;
  align-items: baseline;
  gap: 7px;
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

@media (max-width: 720px) {
  .bilingual-markdown {
    grid-template-columns: 1fr;
  }
}
</style>
