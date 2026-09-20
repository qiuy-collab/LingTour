import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * The admin breakpoint scale, in one place. Media queries in
 * src/styles/responsive.css, src/styles/theme.css (`--lt-bp-*`, documentation
 * only — CSS media queries cannot read custom properties) and the individual
 * component styles all follow this scale. `md` is the mobile/desktop split:
 * "mobile" means `<= md`, i.e. `(max-width: 768px)`.
 */
export const ADMIN_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

const QUERY = `(max-width: ${ADMIN_BREAKPOINTS.md}px)`

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
