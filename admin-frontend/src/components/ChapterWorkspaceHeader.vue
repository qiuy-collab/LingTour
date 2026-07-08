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

    <div class="workspace-tabs" role="tablist" aria-label="章节导航">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="workspace-tab"
        :class="{ active: modelValue === tab.key }"
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
  padding: 18px 20px;
  border-radius: var(--lt-radius-lg);
  background:
    radial-gradient(circle at top left, var(--lt-primary-soft), transparent 34%),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--lt-primary-soft) 38%, var(--lt-bg-card)) 0%,
      var(--lt-bg-card) 65%
    );
  border: 1px solid color-mix(in srgb, var(--lt-primary) 18%, var(--lt-border-color));
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
  gap: 10px;
}

.workspace-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid var(--lt-border-color);
  border-radius: var(--lt-radius-lg);
  background: var(--lt-bg-card);
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
  border-color: color-mix(in srgb, var(--lt-primary) 28%, var(--lt-border-color));
  box-shadow: var(--lt-shadow-md);
  transform: translateY(-1px);
}

.workspace-tab.active {
  border-color: var(--lt-primary);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--lt-primary-soft) 76%, var(--lt-bg-card)) 0%,
    color-mix(in srgb, var(--lt-primary-soft) 38%, var(--lt-bg-card)) 100%
  );
  color: var(--lt-primary-dark);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--lt-primary) 14%, transparent);
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
