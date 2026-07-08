<script setup lang="ts">
export interface EditorWorkspaceTab {
  key: string
  label: string
  badge?: string
}

withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    activeLabel?: string
    tabs: EditorWorkspaceTab[]
    modelValue: string
  }>(),
  {
    eyebrow: 'Content Workspace',
    description: '',
    activeLabel: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <el-card shadow="never" class="editor-workspace">
    <template #header>
      <div class="workspace-header">
        <div class="workspace-intro">
          <div class="workspace-eyebrow">{{ eyebrow }}</div>
          <div class="workspace-headline">
            <h3>{{ title }}</h3>
            <span v-if="activeLabel" class="workspace-pill">{{ activeLabel }}</span>
          </div>
          <p v-if="description">{{ description }}</p>
        </div>
        <slot name="toolbar" />
      </div>
      <div class="workspace-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="workspace-tab"
          :class="{ active: modelValue === tab.key }"
          @click="emit('update:modelValue', tab.key)"
        >
          <span>{{ tab.label }}</span>
          <small v-if="tab.badge">{{ tab.badge }}</small>
        </button>
      </div>
    </template>

    <div class="workspace-panel">
      <slot />
    </div>
  </el-card>
</template>

<style scoped>
.editor-workspace :deep(.el-card__header) {
  padding-bottom: 18px;
}

.editor-workspace :deep(.el-card__body) {
  padding-top: 18px;
}

.workspace-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
}

.workspace-intro {
  padding: 18px 20px;
  border: 1px solid color-mix(in srgb, var(--lt-primary) 18%, var(--lt-border-color));
  border-radius: var(--lt-radius-lg);
  background:
    radial-gradient(circle at top left, var(--lt-primary-soft), transparent 34%),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--lt-primary-soft) 38%, var(--lt-bg-card)) 0%,
      var(--lt-bg-card) 65%
    );
}

.workspace-eyebrow {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lt-primary);
}

.workspace-headline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.workspace-headline h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: var(--lt-text-primary);
}

.workspace-pill {
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

.workspace-intro p {
  margin: 10px 0 0;
  max-width: 760px;
  color: var(--lt-text-regular);
  font-size: 13px;
  line-height: 1.6;
}

.workspace-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
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
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.workspace-tab small {
  color: var(--lt-text-secondary);
  font-size: 11px;
  font-weight: 700;
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

.workspace-panel {
  min-height: 240px;
}

@media (max-width: 960px) {
  .workspace-header {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .workspace-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .workspace-tabs::-webkit-scrollbar {
    display: none;
  }

  .workspace-tab {
    flex-shrink: 0;
    padding: 6px 12px;
    font-size: 12px;
    min-height: 36px;
  }
}
</style>
