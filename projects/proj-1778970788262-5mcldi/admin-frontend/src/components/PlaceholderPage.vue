<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <div class="placeholder-page">
    <el-card>
      <el-empty :description="title || '页面开发中'" />
    </el-card>
  </div>
</template>

<style scoped>
.placeholder-page {
  padding: 20px;
}
</style>
