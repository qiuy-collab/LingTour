<script setup lang="ts">
defineProps<{
  /** Skeleton type: 'list' for table pages, 'form' for edit pages, 'detail' for detail pages */
  type?: 'list' | 'form' | 'detail'
  /** Number of rows for list skeleton (default: 5) */
  rows?: number
}>()
</script>

<template>
  <div class="page-skeleton">
    <!-- List skeleton -->
    <template v-if="type === 'form'">
      <el-skeleton :rows="0" animated class="skeleton-header">
        <template #template>
          <el-skeleton-item variant="h1" style="width: 200px; height: 28px;" />
        </template>
      </el-skeleton>
      <div class="skeleton-form">
        <div v-for="i in 6" :key="i" class="skeleton-form-item">
          <el-skeleton :rows="0" animated>
            <template #template>
              <el-skeleton-item variant="text" style="width: 80px; height: 14px; margin-bottom: 8px;" />
              <el-skeleton-item variant="rect" style="width: 100%; height: 32px;" />
            </template>
          </el-skeleton>
        </div>
      </div>
    </template>

    <template v-else-if="type === 'detail'">
      <el-skeleton :rows="0" animated class="skeleton-header">
        <template #template>
          <el-skeleton-item variant="h1" style="width: 240px; height: 28px;" />
        </template>
      </el-skeleton>
      <el-skeleton :rows="8" animated />
    </template>

    <!-- Default: list skeleton -->
    <template v-else>
      <!-- Toolbar skeleton -->
      <el-skeleton :rows="0" animated class="skeleton-toolbar">
        <template #template>
          <div style="display: flex; gap: 12px; align-items: center;">
            <el-skeleton-item variant="rect" style="width: 200px; height: 32px; border-radius: 4px;" />
            <el-skeleton-item variant="rect" style="width: 120px; height: 32px; border-radius: 4px;" />
            <el-skeleton-item variant="button" style="width: 64px; height: 32px; border-radius: 4px;" />
          </div>
        </template>
      </el-skeleton>
      <!-- Table skeleton -->
      <div class="skeleton-table">
        <div class="skeleton-table-header">
          <el-skeleton :rows="0" animated>
            <template #template>
              <div style="display: flex; gap: 16px;">
                <el-skeleton-item v-for="i in 5" :key="i" variant="text" style="flex: 1; height: 16px;" />
              </div>
            </template>
          </el-skeleton>
        </div>
        <div v-for="i in (rows || 5)" :key="i" class="skeleton-table-row">
          <el-skeleton :rows="0" animated>
            <template #template>
              <div style="display: flex; gap: 16px; align-items: center;">
                <el-skeleton-item v-for="j in 5" :key="j" variant="text" style="flex: 1; height: 14px;" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-skeleton {
  padding: 4px 0;
}

.skeleton-header {
  margin-bottom: 20px;
}

.skeleton-toolbar {
  margin-bottom: 16px;
}

.skeleton-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.skeleton-table-header {
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.skeleton-table-row {
  padding: 14px 16px;
  border-bottom: 1px solid #ebeef5;
}

.skeleton-table-row:last-child {
  border-bottom: none;
}

.skeleton-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 800px;
}

.skeleton-form-item {
  padding: 4px 0;
}
</style>
