<script setup lang="ts">
import { computed } from 'vue'
import type { I18nObject } from '@/types/common'

const props = defineProps<{
  modelValue: I18nObject
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

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderMarkdown(input: string): string {
  const escaped = escapeHtml(input || '')
  const lines = escaped.split('\n')
  const html: string[] = []
  let inList = false
  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push('<p></p>')
      continue
    }
    if (line.startsWith('### ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h3>${line.slice(4)}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h2>${line.slice(3)}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(`<h1>${line.slice(2)}</h1>`)
      continue
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${line.slice(2)}</li>`)
      continue
    }
    if (inList) {
      html.push('</ul>')
      inList = false
    }
    html.push(`<p>${line}</p>`)
  }
  if (inList) html.push('</ul>')
  return html
    .join('')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

const previewZh = computed(() => renderMarkdown(internalValue.value.zh))
const previewEn = computed(() => renderMarkdown(internalValue.value.en))
</script>

<template>
  <div class="i18n-md-editor">
    <el-tabs type="border-card">
      <el-tab-pane label="中文 (ZH)">
        <div class="md-editor-layout">
          <div class="md-pane">
            <el-input
              :model-value="internalValue.zh"
              @update:model-value="updateZh"
              type="textarea"
              :rows="rows"
              :placeholder="placeholder || '请输入中文 Markdown 内容'"
            />
          </div>
          <div class="md-pane">
            <div class="md-preview" v-html="previewZh" />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="English (EN)">
        <div class="md-editor-layout">
          <div class="md-pane">
            <el-input
              :model-value="internalValue.en"
              @update:model-value="updateEn"
              type="textarea"
              :rows="rows"
              :placeholder="placeholder || 'Enter English Markdown content'"
            />
          </div>
          <div class="md-pane">
            <div class="md-preview" v-html="previewEn" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.i18n-md-editor {
  width: 100%;
}
.md-editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.md-preview {
  min-height: 156px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  padding: 10px 12px;
  color: #303133;
  line-height: 1.7;
}
:deep(.el-tabs--border-card) {
  box-shadow: none;
}
@media (max-width: 960px) {
  .md-editor-layout {
    grid-template-columns: 1fr;
  }
}
</style>
