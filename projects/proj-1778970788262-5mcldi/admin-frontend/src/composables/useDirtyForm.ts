import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { ElMessageBox } from 'element-plus'

export interface DirtyFormOptions {
  /** The reactive form object to track */
  form: Record<string, any>
  /** Whether to show browser beforeunload warning (default: true) */
  beforeUnload?: boolean
  /** Whether to show route leave warning (default: true) */
  routeLeave?: boolean
  /** Custom warning message */
  message?: string
}

export function useDirtyForm(options: DirtyFormOptions) {
  const { form, beforeUnload = true, routeLeave = true, message = '当前页面有未保存的修改，确定离开吗？' } = options

  const isDirty = ref(false)
  const snapshot = ref<string>('')
  const isEnabled = ref(true)

  // Take a snapshot of the current form state
  function takeSnapshot() {
    snapshot.value = JSON.stringify(form)
    isDirty.value = false
  }

  // Reset dirty state (call after successful save)
  function resetDirty() {
    takeSnapshot()
  }

  // Disable dirty checking (e.g., during programmatic navigation after save)
  function disableDirtyCheck() {
    isEnabled.value = false
    isDirty.value = false
  }

  // Watch form changes
  watch(
    () => JSON.stringify(form),
    (newVal) => {
      if (!isEnabled.value) return
      isDirty.value = newVal !== snapshot.value
    },
    { deep: false } // We're already stringifying, no need for deep
  )

  // Browser beforeunload warning
  function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (isDirty.value && isEnabled.value) {
      e.preventDefault()
      e.returnValue = message
      return message
    }
  }

  onMounted(() => {
    // Delay snapshot to allow form to be populated from API
    setTimeout(() => {
      if (isEnabled.value) {
        takeSnapshot()
      }
    }, 500)

    if (beforeUnload) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  // Vue Router leave guard
  if (routeLeave) {
    onBeforeRouteLeave(async (_to, _from, next) => {
      if (!isDirty.value || !isEnabled.value) {
        next()
        return
      }
      try {
        await ElMessageBox.confirm(message, '未保存的修改', {
          confirmButtonText: '离开',
          cancelButtonText: '留在此页',
          type: 'warning',
        })
        next()
      } catch {
        next(false)
      }
    })
  }

  return {
    isDirty,
    resetDirty,
    takeSnapshot,
    disableDirtyCheck,
  }
}
