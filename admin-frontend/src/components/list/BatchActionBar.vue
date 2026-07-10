<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Number of selected items */
    selectedCount: number
    /** Explicitly control visibility (defaults to auto-show when selectedCount > 0) */
    visible?: boolean
  }>(),
  {
    visible: undefined,
  },
)

const emit = defineEmits<{
  clear: []
}>()

const show = computed(() => {
  if (props.visible !== undefined) return props.visible
  return props.selectedCount > 0
})
</script>

<template>
  <Transition name="batch-bar-slide">
    <div v-if="show" class="batch-action-bar" role="status" aria-live="polite">
      <div class="batch-action-bar__info">
        已选择 <strong>{{ selectedCount }}</strong> 项
      </div>
      <div class="batch-action-bar__actions">
        <!-- Slot for batch action buttons (delete, publish, export, etc.) -->
        <slot name="actions" />
      </div>
      <el-button size="small" @click="emit('clear')">取消选择</el-button>
    </div>
  </Transition>
</template>

<style scoped>
.batch-action-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: var(--lt-bg-card);
  border-radius: var(--lt-radius-md);
  box-shadow: 0 -4px 12px rgba(17, 25, 35, 0.1);
  z-index: 100;
  border: 1px solid var(--lt-border-light);
  margin-top: 16px;
}

.batch-action-bar__info {
  font-size: 14px;
  color: var(--lt-text-regular);
  white-space: nowrap;
}

.batch-action-bar__info strong {
  color: var(--lt-primary);
}

.batch-action-bar__actions {
  display: flex;
  gap: 8px;
  flex: 1;
}

/* Slide transition */
.batch-bar-slide-enter-active,
.batch-bar-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.batch-bar-slide-enter-from,
.batch-bar-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 767px) {
  .batch-action-bar {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 12px;
  }
  .batch-action-bar__actions {
    flex-wrap: wrap;
    width: 100%;
  }
  .batch-action-bar__actions .el-button {
    flex: 1;
    min-width: 0;
  }
}
</style>
