import { ref } from 'vue'

export type EditorLocale = 'zh' | 'en'

const editorLocale = ref<EditorLocale>('en')

const editorLocaleOptions = [
  { label: 'English', value: 'en' },
]

export function useEditorLocale() {
  return {
    editorLocale,
    editorLocaleOptions,
  }
}
