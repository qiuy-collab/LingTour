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
  border-radius: 18px;
  background:
    radial-gradient(circle at top left, rgba(64, 158, 255, 0.16), transparent 34%),
    linear-gradient(135deg, #f7fbff 0%, #ffffff 65%);
  border: 1px solid #d9ecff;
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
  color: #409eff;
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
  color: #1f2a37;
}

.workspace-active {
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

.workspace-description {
  margin: 10px 0 0;
  max-width: 720px;
  font-size: 13px;
  line-height: 1.6;
  color: #5b6472;
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
  border: 1px solid #d7deea;
  border-radius: 14px;
  background: #fff;
  color: #526071;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
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
  border-radius: 999px;
  background: rgba(31, 42, 55, 0.08);
  color: #6b7483;
  font-size: 11px;
  font-weight: 600;
}

.workspace-tab.active .workspace-tab__badge {
  background: rgba(64, 158, 255, 0.14);
  color: #1767c6;
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
