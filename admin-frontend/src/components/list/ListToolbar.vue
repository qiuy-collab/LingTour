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
    searchPlaceholder: 'Search...',
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
  <div class="list-toolbar">
    <div class="list-toolbar__left">
      <el-input
        v-model="keyword"
        :placeholder="searchPlaceholder"
        :prefix-icon="Search"
        clearable
        class="list-toolbar__search"
        @keyup="handleKeyEnter"
        @clear="handleClear"
      />
      <!-- Slot for additional filter controls (el-select, el-date-picker, etc.) -->
      <slot />
      <el-button type="primary" :icon="Search" @click="$emit('search')">Search</el-button>
      <el-button v-if="showReset" :icon="RefreshRight" @click="handleReset">Reset</el-button>
    </div>
    <div class="list-toolbar__right">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.list-toolbar__left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.list-toolbar__search {
  width: 260px;
}

.list-toolbar__right {
  display: flex;
  gap: 8px;
  align-items: center;
}

@media (max-width: 767px) {
  .list-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .list-toolbar__search {
    width: 100% !important;
  }
  .list-toolbar__left {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .list-toolbar__left .el-select {
    width: 100% !important;
  }
  .list-toolbar__right {
    display: flex;
    gap: 8px;
  }
  .list-toolbar__right .el-button {
    flex: 1;
  }
}
</style>
