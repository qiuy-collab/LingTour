<script setup lang="ts">
import { FolderOpened } from '@element-plus/icons-vue'

defineProps<{
  /** Title text */
  title?: string
  /** Description text */
  description?: string
  /** Action button text */
  actionText?: string
  /** Custom icon component */
  icon?: any
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <el-empty :description="description || '暂无数据'">
      <template #image>
        <el-icon class="empty-icon" :size="48">
          <component :is="icon || FolderOpened" />
        </el-icon>
      </template>
      <template v-if="title" #description>
        <p class="empty-title">{{ title }}</p>
        <p v-if="description" class="empty-desc">{{ description }}</p>
      </template>
      <el-button v-if="actionText" type="primary" @click="$emit('action')">
        {{ actionText }}
      </el-button>
    </el-empty>
  </div>
</template>

<style scoped>
.empty-state {
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  color: var(--lt-text-placeholder);
}

.empty-title {
  font-size: 15px;
  color: var(--lt-text-regular);
  margin: 0 0 4px;
}

.empty-desc {
  font-size: 13px;
  color: var(--lt-text-secondary);
  margin: 0;
}
</style>
