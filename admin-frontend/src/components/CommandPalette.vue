<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const router = useRouter()
const searchQuery = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement>()

// All navigable items
interface CommandItem {
  title: string
  path: string
  group: string
  keywords?: string
}

const allItems: CommandItem[] = [
  { title: 'Dashboard', path: '/admin/dashboard', group: 'Overview', keywords: 'dashboard home analytics' },
  { title: 'Cities', path: '/admin/cities', group: 'Content', keywords: 'city archive' },
  { title: 'Add City', path: '/admin/cities/create', group: 'Content', keywords: 'city create' },
  { title: 'Routes', path: '/admin/routes', group: 'Content', keywords: 'route itinerary' },
  { title: 'Add Route', path: '/admin/routes/create', group: 'Content', keywords: 'route create' },
  { title: 'Collections', path: '/admin/shop/collections', group: 'Shop', keywords: 'collection series' },
  { title: 'Products', path: '/admin/shop/products', group: 'Shop', keywords: 'product goods' },
  { title: 'Add Product', path: '/admin/shop/products/create', group: 'Shop', keywords: 'product create' },
  { title: 'Orders', path: '/admin/orders', group: 'Shop', keywords: 'order purchase' },
  { title: 'Service Modes', path: '/admin/interpreting/modes', group: 'Interpreting', keywords: 'mode service' },
  { title: 'Interpreters', path: '/admin/interpreting/profiles', group: 'Interpreting', keywords: 'interpreter profile' },
  { title: 'Bookings', path: '/admin/interpreting/bookings', group: 'Interpreting', keywords: 'booking request' },
  { title: 'FAQs', path: '/admin/interpreting/faqs', group: 'Interpreting', keywords: 'faq questions' },
  { title: 'Events', path: '/admin/events', group: 'Operations', keywords: 'event festival' },
  { title: 'Community Posts', path: '/admin/community', group: 'Operations', keywords: 'community posts' },
  { title: 'Home Content', path: '/admin/home', group: 'Operations', keywords: 'home content' },
  { title: 'Content Audit', path: '/admin/operations/audit', group: 'Operations', keywords: 'audit check' },
  { title: 'Media Library', path: '/admin/media', group: 'Operations', keywords: 'media image' },
  { title: 'Users', path: '/admin/users', group: 'System', keywords: 'user account' },
  { title: 'Settings', path: '/admin/settings', group: 'System', keywords: 'settings configuration' },
]

// Fuzzy filter
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return allItems
  const q = searchQuery.value.toLowerCase()
  return allItems.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q) ||
      (item.keywords && item.keywords.toLowerCase().includes(q))
    )
  })
})

// Reset active index when results change
watch(filteredItems, () => {
  activeIndex.value = 0
})

// Focus input when opened
watch(
  () => props.visible,
  (val) => {
    if (val) {
      searchQuery.value = ''
      activeIndex.value = 0
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  }
)

function close() {
  emit('update:visible', false)
}

function navigate(item: CommandItem) {
  router.push(item.path)
  close()
}

function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, filteredItems.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      if (filteredItems.value[activeIndex.value]) {
        navigate(filteredItems.value[activeIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      close()
      break
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="palette-fade">
      <div v-if="props.visible" class="command-palette-overlay" @click.self="close">
        <div class="command-palette">
          <div class="palette-header">
            <el-icon class="search-icon"><Search /></el-icon>
            <input
              ref="inputRef"
              v-model="searchQuery"
              class="palette-input"
              placeholder="Search pages or actions..."
              @keydown="handleKeydown"
            />
            <kbd class="palette-kbd">ESC</kbd>
          </div>
          <div class="palette-body" v-if="filteredItems.length > 0">
            <div
              v-for="(item, index) in filteredItems"
              :key="item.path"
              :class="['palette-item', { active: index === activeIndex }]"
              @click="navigate(item)"
              @mouseenter="activeIndex = index"
            >
              <span class="item-title">{{ item.title }}</span>
              <span class="item-group">{{ item.group }}</span>
            </div>
          </div>
          <div v-else class="palette-empty">
            No matching pages
          </div>
          <div class="palette-footer">
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Open</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.command-palette-overlay {
  position: fixed;
  inset: 0;
  background: var(--lt-bg-mask);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 120px;
  z-index: 2100;
}

.command-palette {
  width: 560px;
  max-width: 90vw;
  background: var(--lt-bg-card);
  border: 1px solid var(--lt-border-color);
  border-radius: var(--lt-radius-lg);
  box-shadow: var(--lt-shadow-lg);
  overflow: hidden;
}

.palette-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--lt-border-light);
  gap: 10px;
}

.search-icon {
  font-size: 18px;
  color: var(--lt-text-secondary);
  flex-shrink: 0;
}

.palette-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--lt-text-primary);
  background: transparent;
}

.palette-input::placeholder {
  color: var(--lt-text-placeholder);
}

.palette-kbd {
  font-size: 11px;
  padding: 2px 6px;
  background: var(--lt-bg-hover);
  border: 1px solid var(--lt-border-color);
  border-radius: var(--lt-radius-sm);
  color: var(--lt-text-secondary);
  font-family: monospace;
}

.palette-body {
  max-height: 360px;
  overflow-y: auto;
  padding: 8px;
}

.palette-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: var(--lt-radius-md);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.palette-item:hover,
.palette-item.active {
  background: var(--lt-primary-soft);
}

.item-title {
  font-size: 14px;
  color: var(--lt-text-primary);
}

.item-group {
  font-size: 12px;
  color: var(--lt-text-secondary);
}

.palette-item.active .item-title {
  color: var(--lt-primary);
}

.palette-empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--lt-text-secondary);
  font-size: 14px;
}

.palette-footer {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  border-top: 1px solid var(--lt-border-light);
  background: color-mix(in srgb, var(--lt-bg-hover) 70%, var(--lt-bg-card));
  font-size: 12px;
  color: var(--lt-text-secondary);
}

.palette-footer kbd {
  font-size: 11px;
  padding: 1px 4px;
  background: var(--lt-bg-card);
  border: 1px solid var(--lt-border-color);
  border-radius: var(--lt-radius-sm);
  font-family: monospace;
  margin-right: 4px;
}

/* Transition */
.palette-fade-enter-active,
.palette-fade-leave-active {
  transition: opacity 0.2s ease;
}

.palette-fade-enter-from,
.palette-fade-leave-to {
  opacity: 0;
}
</style>
