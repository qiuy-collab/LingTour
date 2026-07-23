<script setup lang="ts">
import { computed } from "vue";
import FrontendPagePreview from "@/components/FrontendPagePreview.vue";

type PreviewType =
  | "city"
  | "route"
  | "product"
  | "event"
  | "collection"
  | "service"
  | "interpreter"
  | "faq"
  | "home";

const props = defineProps<{
  modelValue: boolean;
  type: PreviewType;
  model: Record<string, any>;
  meta?: Record<string, any>;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<template>
  <el-drawer
    v-model="visible"
    title="前台预览"
    size="100%"
    direction="rtl"
    destroy-on-close
    append-to-body
    class="frontend-preview-drawer"
  >
    <p class="drawer-hint">预览会同步当前尚未保存的编辑内容。</p>
    <FrontendPagePreview mobile-mode :type="type" :model="model" :meta="meta" />
  </el-drawer>
</template>

<style scoped>
.drawer-hint {
  margin: 0 0 14px;
  color: var(--lt-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

:global(.frontend-preview-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--lt-border-light);
}

:global(.frontend-preview-drawer .el-drawer__body) {
  padding: 14px;
}
</style>
