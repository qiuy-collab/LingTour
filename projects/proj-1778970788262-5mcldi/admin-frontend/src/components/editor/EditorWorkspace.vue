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
  border: 1px solid #d9ecff;
  border-radius: 18px;
  background:
    radial-gradient(circle at top left, rgba(64, 158, 255, 0.16), transparent 34%),
    linear-gradient(135deg, #f7fbff 0%, #ffffff 65%);
}

.workspace-eyebrow {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #409eff;
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
  color: #1f2a37;
}

.workspace-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(64, 158, 255, 0.12);
  color: #1767c6;
  font-size: 12px;
  font-weight: 600;
}

.workspace-intro p {
  margin: 10px 0 0;
  max-width: 760px;
  color: #5b6472;
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
  border: 1px solid #d7deea;
  border-radius: 14px;
  background: #fff;
  color: #526071;
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
  color: #98a3b3;
  font-size: 11px;
  font-weight: 700;
}

.workspace-tab:hover {
  border-color: #b9d9ff;
  box-shadow: 0 8px 20px rgba(31, 42, 55, 0.06);
  transform: translateY(-1px);
}

.workspace-tab.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #eff7ff 0%, #f7fbff 100%);
  color: #1767c6;
  box-shadow: 0 10px 24px rgba(64, 158, 255, 0.14);
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
