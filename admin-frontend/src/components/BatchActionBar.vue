<script setup lang="ts">
import { Delete, Download, Upload } from '@element-plus/icons-vue'

defineProps<{
  /** Number of selected items */
  selectedCount: number
  /** Whether to show delete button */
  showDelete?: boolean
  /** Whether to show publish/unpublish buttons */
  showPublish?: boolean
  /** Whether to show export button */
  showExport?: boolean
  /** Custom action buttons labels */
  actions?: Array<{ label: string; type?: string; event: string }>
}>()

defineEmits<{
  'batch-delete': []
  'batch-publish': []
  'batch-unpublish': []
  'batch-export': []
  'custom-action': [event: string]
}>()
</script>

<template>
  <Transition name="batch-bar-slide">
    <div v-if="selectedCount > 0" class="batch-action-bar">
      <div class="batch-info">
        <span class="batch-count">已选择 <strong>{{ selectedCount }}</strong> 项</span>
      </div>
      <div class="batch-actions">
        <el-button
          v-if="showDelete !== false"
          type="danger"
          :icon="Delete"
          size="small"
          @click="$emit('batch-delete')"
        >
          批量删除
        </el-button>
        <el-button
          v-if="showPublish"
          type="success"
          :icon="Upload"
          size="small"
          @click="$emit('batch-publish')"
        >
          批量发布
        </el-button>
        <el-button
          v-if="showPublish"
          type="warning"
          :icon="Download"
          size="small"
          @click="$emit('batch-unpublish')"
        >
          批量下架
        </el-button>
        <el-button
          v-if="showExport !== false"
          :icon="Download"
          size="small"
          @click="$emit('batch-export')"
        >
          导出选中
        </el-button>
        <el-button
          v-for="action in (actions || [])"
          :key="action.event"
          :type="(action.type as any) || 'default'"
          size="small"
          @click="$emit('custom-action', action.event)"
        >
          {{ action.label }}
        </el-button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.batch-action-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border: 1px solid #ebeef5;
}

.batch-info {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.batch-count strong {
  color: #409eff;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

/* Slide transition */
.batch-bar-slide-enter-active,
.batch-bar-slide-leave-active {
  transition: all 0.3s ease;
}

.batch-bar-slide-enter-from,
.batch-bar-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
