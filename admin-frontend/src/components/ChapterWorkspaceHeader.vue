<script setup lang="ts">
import { computed } from 'vue'

type ChapterTab = {
  key: string
  label: string
  badge?: string
}

const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    tabs: ChapterTab[]
    modelValue: string
  }>(),
  {
    eyebrow: '',
    description: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = computed(() => props.tabs.find((tab) => tab.key === props.modelValue) || null)

function selectTab(key: string) {
  emit('update:modelValue', key)
}
</script>

<template>
  <div class="workspace-header">
    <div class="workspace-hero">
      <div class="workspace-copy">
        <div v-if="eyebrow" class="workspace-eyebrow">{{ eyebrow }}</div>
        <div class="workspace-title-row">
          <h3 class="workspace-title">{{ title }}</h3>
          <span v-if="activeTab" class="workspace-active">{{ activeTab.label }}</span>
        </div>
        <p v-if="description" class="workspace-description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="workspace-actions">
        <slot name="actions" />
      </div>
    </div>

    <div class="workspace-tabs" role="tablist" aria-label="内容分区">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="workspace-tab"
        :class="{ active: modelValue === tab.key }"
        role="tab"
        :aria-selected="modelValue === tab.key"
        @click="selectTab(tab.key)"
      >
        <span class="workspace-tab__label">{{ tab.label }}</span>
        <span v-if="tab.badge" class="workspace-tab__badge">{{ tab.badge }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.workspace-header {
  display: grid;
  gap: 16px;
}

.workspace-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 0;
}

.workspace-copy {
  min-width: 0;
}

.workspace-eyebrow {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lt-primary);
}

.workspace-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.workspace-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: var(--lt-text-primary);
}

.workspace-active {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--lt-primary) 12%, transparent);
  color: var(--lt-primary-dark);
  font-size: 12px;
  font-weight: 600;
}

.workspace-description {
  margin: 10px 0 0;
  max-width: 720px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--lt-text-regular);
}

.workspace-actions {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.workspace-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border-radius: var(--lt-radius-lg);
  background: var(--lt-bg-hover);
}

.workspace-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: var(--lt-radius-md);
  background: transparent;
  color: var(--lt-text-regular);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.workspace-tab:hover {
  background: color-mix(in srgb, var(--lt-bg-card) 70%, transparent);
}

.workspace-tab.active {
  background: var(--lt-bg-card);
  color: var(--lt-primary-dark);
  box-shadow: var(--lt-shadow-sm);
}

.workspace-tab__label {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
}

.workspace-tab__badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--lt-text-primary) 8%, transparent);
  color: var(--lt-text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.workspace-tab.active .workspace-tab__badge {
  background: color-mix(in srgb, var(--lt-primary) 14%, transparent);
  color: var(--lt-primary-dark);
}

@media (max-width: 1100px) {
  .workspace-hero {
    flex-direction: column;
  }

  .workspace-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
