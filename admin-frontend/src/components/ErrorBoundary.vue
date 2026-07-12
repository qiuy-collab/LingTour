<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { Warning } from '@element-plus/icons-vue'

const hasError = ref(false)
const errorMessage = ref('')

function handleRetry() {
  hasError.value = false
  errorMessage.value = ''
}

onErrorCaptured((err: Error) => {
  hasError.value = true
  errorMessage.value = err.message || '页面渲染出错'
  console.error('[ErrorBoundary]', err)
  return false // prevent propagation
})
</script>

<template>
  <div v-if="hasError" class="error-boundary" role="alert" aria-live="assertive">
    <div class="error-content">
      <el-icon class="error-icon" :size="64"><Warning /></el-icon>
      <h2 class="error-title">页面出现了问题</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <el-button type="primary" @click="handleRetry">重新加载</el-button>
    </div>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  color: var(--lt-danger);
  margin-bottom: 16px;
}

.error-title {
  font-size: 20px;
  color: var(--lt-text-primary);
  margin: 0 0 8px;
}

.error-message {
  font-size: 14px;
  color: var(--lt-text-secondary);
  margin: 0 0 24px;
  word-break: break-word;
}
</style>
