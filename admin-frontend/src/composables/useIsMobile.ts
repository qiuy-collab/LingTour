import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

const QUERY = '(max-width: 767px)'

/**
 * 移动端断点检测（与 AdminLayout 的 ≤768px 口径对齐）。
 * 使用 matchMedia 而非 resize 监听：横竖屏切换、软键盘弹出都能触发重算。
 */
export function useIsMobile(): Ref<boolean> {
  const isMobile = ref(false)
  let mql: MediaQueryList | null = null

  const sync = () => {
    isMobile.value = mql?.matches ?? false
  }

  onMounted(() => {
    mql = window.matchMedia(QUERY)
    sync()
    mql.addEventListener('change', sync)
  })

  onBeforeUnmount(() => {
    mql?.removeEventListener('change', sync)
    mql = null
  })

  return isMobile
}
