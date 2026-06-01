import { onMounted, onBeforeUnmount } from 'vue'

export interface ShortcutHandler {
  /** Key combination, e.g. 'ctrl+k', 'ctrl+s', 'escape' */
  key: string
  /** Handler function */
  handler: (e: KeyboardEvent) => void
  /** Whether to prevent default browser behavior (default: true) */
  preventDefault?: boolean
}

/**
 * Parse a key string like 'ctrl+k' into its parts
 */
function parseKey(key: string): { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean; code: string } {
  const parts = key.toLowerCase().split('+')
  return {
    ctrl: parts.includes('ctrl'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd'),
    code: parts.filter((p) => !['ctrl', 'shift', 'alt', 'meta', 'cmd'].includes(p))[0] || '',
  }
}

/**
 * Check if a keyboard event matches a key definition
 */
function matchesKey(e: KeyboardEvent, parsed: ReturnType<typeof parseKey>): boolean {
  const ctrlOrMeta = parsed.ctrl ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey)
  const shift = parsed.shift ? e.shiftKey : !e.shiftKey
  const alt = parsed.alt ? e.altKey : !e.altKey

  const eventKey = e.key.toLowerCase()
  const keyMatch =
    eventKey === parsed.code ||
    e.code.toLowerCase() === `key${parsed.code}` ||
    e.code.toLowerCase() === parsed.code

  return ctrlOrMeta && shift && alt && keyMatch
}

/**
 * Register keyboard shortcuts that are active while the component is mounted.
 * Automatically cleans up on unmount.
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: 'ctrl+s', handler: () => handleSave() },
 *   { key: 'ctrl+k', handler: () => openCommandPalette() },
 *   { key: 'escape', handler: () => closeDialog() },
 * ])
 */
export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  const parsedShortcuts = shortcuts.map((s) => ({
    ...s,
    parsed: parseKey(s.key),
    preventDefault: s.preventDefault !== false,
  }))

  function handleKeydown(e: KeyboardEvent) {
    // Don't trigger shortcuts when typing in inputs/textareas (unless it's Escape)
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    for (const shortcut of parsedShortcuts) {
      if (matchesKey(e, shortcut.parsed)) {
        // Allow Escape and Ctrl+combos even in inputs
        if (isInput && shortcut.parsed.code !== 'escape' && !shortcut.parsed.ctrl && !shortcut.parsed.meta) {
          continue
        }
        if (shortcut.preventDefault) {
          e.preventDefault()
          e.stopPropagation()
        }
        shortcut.handler(e)
        return
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown, true)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown, true)
  })
}
