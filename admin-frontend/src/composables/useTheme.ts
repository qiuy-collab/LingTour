import { ref, watch, onMounted, onUnmounted } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'culvoy-admin-theme'

// Singleton state shared across all component instances
const themeMode = ref<ThemeMode>(
  (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'light'
)
const isDark = ref(false)

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(mode: ThemeMode) {
  const dark = mode === 'dark' || (mode === 'system' && getSystemDark())
  isDark.value = dark

  const html = document.documentElement
  if (dark) {
    html.classList.add('dark')
    html.setAttribute('data-theme', 'dark')
  } else {
    html.classList.remove('dark')
    html.setAttribute('data-theme', 'light')
  }
}

export function useTheme() {
  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    localStorage.setItem(STORAGE_KEY, mode)
    applyTheme(mode)
  }

  function toggleTheme() {
    const next: ThemeMode = isDark.value ? 'light' : 'dark'
    setTheme(next)
  }

  let systemDarkMql: MediaQueryList | null = null
  let systemDarkHandler: (() => void) | null = null

  onMounted(() => {
    applyTheme(themeMode.value)

    // Listen for system theme changes
    systemDarkMql = window.matchMedia('(prefers-color-scheme: dark)')
    systemDarkHandler = () => {
      if (themeMode.value === 'system') {
        applyTheme('system')
      }
    }
    systemDarkMql.addEventListener('change', systemDarkHandler)
  })

  onUnmounted(() => {
    if (systemDarkMql && systemDarkHandler) {
      systemDarkMql.removeEventListener('change', systemDarkHandler)
    }
    systemDarkMql = null
    systemDarkHandler = null
  })

  watch(themeMode, (mode) => {
    applyTheme(mode)
  })

  return {
    themeMode,
    isDark,
    setTheme,
    toggleTheme,
  }
}
