<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Minus, Picture, Upload } from '@element-plus/icons-vue'
import { MdEditor, NormalToolbar, type ExposeParam, type ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { uploadMediaFile } from '@/api/media'
import MediaPickerDialog from '@/components/media/MediaPickerDialog.vue'
import { extractErrorMessage } from '@/utils/i18n'

const model = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{
  disabled?: boolean
  entityId?: string
  module?: string
  placeholder?: string
}>(), {
  disabled: false,
  module: 'cities',
  placeholder: '请填写英文正文，支持 Markdown 排版',
})
const emit = defineEmits<{
  save: []
  'uploading-change': [value: boolean]
}>()
const editorRef = ref<ExposeParam>()
const fileInput = ref<HTMLInputElement>()
const editorId = `markdown-${useId()}`
const mode = ref<'edit' | 'split' | 'preview'>('split')
const uploading = ref(false)
const progress = ref(0)
const mediaPickerVisible = ref(false)
const uploadError = ref('')
const busy = computed(() => props.disabled || uploading.value)
const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const maxImageSize = 10 * 1024 * 1024
const toolbars: ToolbarNames[] = [
  'revoke', 'next', '-', 'bold', 'italic', 'underline', 'strikeThrough',
  'title', '-', 'unorderedList', 'orderedList', 'task', 'quote', 0,
  'table', 'link', 'image', 1, 2, '-', 'codeRow', 'code',
]
let selection: { anchor: number; head: number } | undefined
let mounted = true

watch(uploading, value => emit('uploading-change', value), { flush: 'sync' })
watch(mode, async value => {
  await nextTick()
  if (value !== 'preview') editorRef.value?.getEditorView()?.requestMeasure()
})

function rememberSelection() {
  const range = editorRef.value?.getEditorView()?.state.selection.main
  if (range) selection = { anchor: range.anchor, head: range.head }
}

function restoreSelection() {
  const view = editorRef.value?.getEditorView()
  if (view && selection) {
    const max = view.state.doc.length
    view.dispatch({ selection: {
      anchor: Math.min(selection.anchor, max),
      head: Math.min(selection.head, max),
    } })
    view.focus()
  } else {
    editorRef.value?.focus()
  }
}

function imageUrl(value: string) {
  const raw = value.trim()
  if (/^\/(?:uploads|editorial)\//.test(raw)) {
    const url = new URL(raw, 'https://media.invalid')
    if (!/^\/(?:uploads|editorial)\//.test(url.pathname)) throw new Error('图片路径无效')
    return `${url.pathname}${url.search}${url.hash}`.replaceAll('(', '%28').replaceAll(')', '%29')
  }
  const url = new URL(raw)
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('图片地址必须使用 HTTP 或 HTTPS')
  return url.href.replaceAll('(', '%28').replaceAll(')', '%29')
}

function insertImages(images: Array<{ url: string; alt: string }>) {
  const markdown = images.map(image => {
    const alt = image.alt.replace(/[\\\[\]\r\n]/g, ' ')
    return `![${alt}](${imageUrl(image.url)})`
  }).join('\n\n')
  if (model.value.length + markdown.length + 3 > 200000) {
    throw new Error('插入图片后正文会超过 200000 字符。图片已入库，请缩短正文后从媒体库重新插入。')
  }
  restoreSelection()
  // Keep any selected text; CodeMirror owns the insertion and undo history.
  editorRef.value?.insert(selected => ({
    targetValue: `${selected}${selected ? '\n\n' : ''}${markdown}\n`,
    select: false,
  }))
}

function chooseUpload() {
  if (busy.value) return
  rememberSelection()
  fileInput.value?.click()
}

function chooseMedia() {
  if (busy.value) return
  rememberSelection()
  mediaPickerVisible.value = true
}

async function uploadImages(files: File[]) {
  if (busy.value || !files.length) return
  uploadError.value = ''
  const invalid = files.find(file => !imageTypes.includes(file.type) || file.size > maxImageSize || !file.size)
  if (invalid) {
    restoreSelection()
    uploadError.value = `“${invalid.name}”不符合要求，请使用 10 MB 以内的 JPG、PNG、WebP 或 GIF 图片。`
    ElMessage.error(uploadError.value)
    return
  }
  uploading.value = true
  progress.value = 0
  const images: Array<{ url: string; alt: string }> = []
  const failures: string[] = []
  try {
    for (const [index, file] of files.entries()) {
      try {
        const res = await uploadMediaFile(file, props.module, 'city', props.entityId, percent => {
          progress.value = Math.round((index + percent / 100) / files.length * 100)
        })
        const payload = res.data?.data ?? res.data
        const url = payload?.url || payload?.path
        if (typeof url !== 'string' || !url.trim()) throw new Error('上传接口未返回图片地址')
        images.push({ url: imageUrl(url), alt: file.name })
      } catch (error) {
        failures.push(`${file.name}：${extractErrorMessage(error, '上传失败')}`)
      }
    }
  } finally {
    uploading.value = false
    await nextTick()
  }
  if (!mounted) return
  if (images.length) {
    try {
      insertImages(images)
      ElMessage.success(`已插入 ${images.length} 张图片`)
    } catch (error) {
      failures.push(extractErrorMessage(error, '图片插入失败，正文已保留'))
    }
  } else {
    restoreSelection()
  }
  if (failures.length) {
    uploadError.value = failures.join('；')
    ElMessage.error('部分图片上传失败，正文已保留，请重试')
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''
  void uploadImages(files)
}

function handleDrop(event: DragEvent) {
  const files = Array.from(event.dataTransfer?.files || [])
  if (!files.length) return
  event.preventDefault()
  event.stopImmediatePropagation()
  const view = editorRef.value?.getEditorView()
  const position = view?.posAtCoords({ x: event.clientX, y: event.clientY })
  if (position != null) selection = { anchor: position, head: position }
  else rememberSelection()
  void uploadImages(files)
}

function handlePaste(event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files || [])
  if (!files.length) return
  event.preventDefault()
  event.stopImmediatePropagation()
  rememberSelection()
  void uploadImages(files)
}

async function onMediaSelected(urls: string[]) {
  await nextTick()
  try {
    insertImages(urls.map(url => ({ url, alt: 'Image description' })))
  } catch (error) {
    uploadError.value = extractErrorMessage(error, '图片插入失败，正文已保留')
    ElMessage.error(uploadError.value)
  }
}

function insertDivider() {
  editorRef.value?.insert(selected => ({ targetValue: `${selected}\n\n---\n\n`, select: false }))
}

// This component deliberately never renders library-generated HTML. Only the real
// frontend slot previews authored content; the empty sanitizer is defense in depth.
function discardBuiltInHtml() { return '' }
onBeforeUnmount(() => { mounted = false })
onMounted(() => {
  editorRef.value?.on('preview', visible => { if (visible) editorRef.value?.togglePreview(false) })
  editorRef.value?.on('htmlPreview', visible => { if (visible) editorRef.value?.toggleHtmlPreview(false) })
  editorRef.value?.on('previewOnly', visible => { if (visible) editorRef.value?.togglePreviewOnly(false) })
})
</script>

<template>
  <section class="markdown-workspace" aria-label="Markdown 正文编辑器">
    <div class="workspace-heading">
      <div>
        <h3>正文</h3>
        <p>英文原文保存，预览与前台一致</p>
      </div>
      <el-radio-group v-model="mode" aria-label="编辑器显示模式" :disabled="uploading">
        <el-radio-button value="edit">编辑</el-radio-button>
        <el-radio-button value="split">分屏预览</el-radio-button>
        <el-radio-button value="preview">仅预览</el-radio-button>
      </el-radio-group>
    </div>
    <el-alert v-if="uploadError" :title="uploadError" type="error" show-icon :closable="false" />
    <p v-if="uploading" role="status" class="upload-status">图片上传中 {{ progress }}%，完成前暂时锁定正文以保留光标。</p>
    <div class="workspace-panes" :class="`mode-${mode}`">
      <div
        v-show="mode !== 'preview'"
        class="source-pane"
        :aria-busy="uploading"
        @drop.capture="handleDrop"
        @paste.capture="handlePaste"
      >
        <MdEditor
          :id="editorId"
          ref="editorRef"
          v-model="model"
          language="zh-CN"
          :toolbars="toolbars"
          :footers="['markdownTotal']"
          :preview="false"
          :html-preview="false"
          :sanitize="discardBuiltInHtml"
          :disabled="busy"
          :max-length="200000"
          :placeholder="placeholder"
          no-highlight
          no-mermaid
          no-katex
          no-echarts
          no-prettier
          no-upload-img
          :show-code-row-number="false"
          @on-save="emit('save')"
          @on-error="error => ElMessage.warning(error.name === 'overlength' ? '正文不能超过 200000 字符' : error.message)"
        >
          <template #defToolbars>
            <NormalToolbar title="分割线" @on-click="insertDivider"><el-icon><Minus /></el-icon></NormalToolbar>
            <NormalToolbar title="上传图片" @on-click="chooseUpload"><el-icon><Upload /></el-icon></NormalToolbar>
            <NormalToolbar title="从媒体库插入图片" @on-click="chooseMedia"><el-icon><Picture /></el-icon></NormalToolbar>
          </template>
        </MdEditor>
        <input ref="fileInput" type="file" :accept="imageTypes.join(',')" multiple hidden @change="onFileChange" />
        <p class="image-hint">支持拖放或粘贴图片；JPG、PNG、WebP、GIF，每张不超过 10 MB。代码仅基础展示，不高亮、不提供复制按钮。</p>
      </div>
      <div v-if="mode !== 'edit'" class="preview-pane"><slot name="preview" /></div>
    </div>
    <MediaPickerDialog
      v-model="mediaPickerVisible"
      multiple
      :limit="10"
      media-type="image"
      :module="module"
      :accept="imageTypes.join(',')"
      @confirm="onMediaSelected"
    />
  </section>
</template>

<style scoped>
.markdown-workspace { min-width: 0; margin: 24px 0; }
.workspace-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
.workspace-heading h3 { margin: 0; color: var(--lt-text-primary); font-size: 18px; }
.workspace-heading p, .image-hint, .upload-status { margin: 6px 0 0; color: var(--lt-text-secondary); font-size: 12px; line-height: 1.6; }
.workspace-panes { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; align-items: start; }
.mode-split { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); }
.source-pane, .preview-pane { min-width: 0; }
.preview-pane { position: sticky; top: 20px; min-height: 500px; }
.source-pane :deep(.md-editor) { height: 620px; min-height: 500px; resize: vertical; overflow: auto; border-color: var(--lt-border-color); --md-bk-color: var(--lt-bg-card); --md-color: var(--lt-text-primary); }
.source-pane :deep(.md-editor-toolbar-wrapper) { flex-wrap: wrap; height: auto; min-height: 44px; }
.source-pane :deep(.md-editor-toolbar) { flex-wrap: wrap; }
.source-pane :deep(.md-editor-toolbar-item) { min-width: 34px; min-height: 34px; }
.source-pane :deep(.cm-content) { font-size: 15px; line-height: 1.8; padding-block: 16px; }
.source-pane :deep(.cm-editor) { min-width: 0; }
.preview-pane :deep(.frontend-preview) { display: block; position: static; min-height: 500px; }
.upload-status, .markdown-workspace > .el-alert { margin-bottom: 12px; }
@media (max-width: 1100px) {
  .mode-split { grid-template-columns: minmax(0, 1fr); }
  .preview-pane { position: static; }
}
@media (max-width: 767px) {
  .source-pane :deep(.cm-content) { font-size: 16px; }
  .source-pane :deep(.md-editor-toolbar-item) { min-width: 44px; min-height: 44px; }
  .workspace-heading :deep(.el-radio-button__inner) { min-height: 44px; display: inline-flex; align-items: center; padding-inline: 12px; }
}
</style>
