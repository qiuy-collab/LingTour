<script setup lang="ts">
import { computed } from 'vue'
import { Search, RefreshRight } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    /** v-model bound search keyword */
    modelValue?: string
    /** Placeholder text for the search input */
    searchPlaceholder?: string
    /** Whether to show the reset button */
    showReset?: boolean
  }>(),
  {
    modelValue: '',
    searchPlaceholder: '搜索...',
    showReset: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: []
  reset: []
}>()

const keyword = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
})

function handleKeyEnter(e: KeyboardEvent) {
  if (e.key === 'Enter') emit('search')
}

function handleClear() {
  emit('search')
}

function handleReset() {
  emit('reset')
}
</script>

<template>
  <section class="list-toolbar" role="search" aria-label="列表筛选">
    <div class="list-toolbar__query">
      <el-input
        v-model="keyword"
        :placeholder="searchPlaceholder"
        :prefix-icon="Search"
        clearable
        class="list-toolbar__search"
        @keyup="handleKeyEnter"
        @clear="handleClear"
      />
      <el-button type="primary" :icon="Search" aria-label="执行搜索" @click="$emit('search')">
        <span class="button-label">搜索</span>
      </el-button>
      <el-button
        v-if="showReset"
        :icon="RefreshRight"
        aria-label="重置筛选"
        @click="handleReset"
      >
        <span class="button-label">重置</span>
      </el-button>
    </div>
    <div v-if="$slots.default" class="list-toolbar__filters">
      <slot />
    </div>
    <div class="list-toolbar__right">
      <slot name="right" />
    </div>
  </section>
</template>

<style scoped>
.list-toolbar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 11px;
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-lg);
  background: color-mix(in srgb, var(--lt-bg-card) 88%, transparent);
  box-shadow: var(--lt-shadow-sm);
}

.list-toolbar__query {
  display: grid;
  grid-template-columns: minmax(220px, 300px) auto auto;
  gap: 8px;
  align-items: center;
}

.list-toolbar__search {
  width: 100%;
}

.list-toolbar__filters {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.list-toolbar__filters::-webkit-scrollbar {
  display: none;
}

.list-toolbar__right {
  display: flex;
  gap: 8px;
  align-items: center;
}

@media (max-width: 1180px) {
  .list-toolbar {
    grid-template-columns: 1fr auto;
  }

  .list-toolbar__filters {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}

@media (max-width: 767px) {
  .list-toolbar {
    grid-template-columns: 1fr;
    padding: 10px;
  }

  .list-toolbar__query {
    grid-template-columns: minmax(0, 1fr) 42px 42px;
    gap: 6px;
  }

  .list-toolbar__query :deep(.el-button) {
    width: 42px;
    min-height: 40px;
    margin: 0;
    padding: 0;
  }

  .button-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .list-toolbar__filters {
    grid-column: 1;
    grid-row: auto;
    margin-inline: -10px;
    padding: 2px 10px 3px;
    scroll-snap-type: x proximity;
  }

  .list-toolbar__filters :deep(> *) {
    flex: 0 0 auto;
    scroll-snap-align: start;
  }

  .list-toolbar__right {
    display: flex;
    width: 100%;
    gap: 8px;
  }

  .list-toolbar__right .el-button {
    flex: 1;
  }
}
</style>
