<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
  rows?: number
  placeholder?: string
}>(), {
  rows: 6,
  placeholder: 'Input Markdown content...',
})

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

const previewHtml = computed(() => renderMarkdown(model.value))
</script>

<template>
  <div class="md-editor">
    <div class="md-pane">
      <div class="md-pane-title">Markdown</div>
      <el-input
        v-model="model"
        type="textarea"
        :rows="rows"
        :placeholder="placeholder"
      />
    </div>
    <div class="md-pane">
      <div class="md-pane-title">Preview</div>
      <div class="md-preview" v-html="previewHtml" />
    </div>
  </div>
</template>

<style scoped>
.md-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.md-pane-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
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

:deep(.md-preview h1),
:deep(.md-preview h2),
:deep(.md-preview h3) {
  margin: 8px 0;
}

:deep(.md-preview p) {
  margin: 6px 0;
}

:deep(.md-preview ul) {
  margin: 6px 0 6px 18px;
}

@media (max-width: 960px) {
  .md-editor {
    grid-template-columns: 1fr;
  }
}
</style>
