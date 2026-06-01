import { ref } from 'vue'

export type EditorLocale = 'zh' | 'en'

const editorLocale = ref<EditorLocale>('zh')

const editorLocaleOptions = [
  { label: '中文', value: 'zh' },
  { label: 'EN', value: 'en' },
]

export function useEditorLocale() {
  return {
    editorLocale,
    editorLocaleOptions,
  }
}
