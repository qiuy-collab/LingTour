<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()

function goHome() {
  router.push('/admin/dashboard')
}
</script>

<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <h1 class="not-found-code">404</h1>
      <h2 class="not-found-title">页面不存在</h2>
      <p class="not-found-desc">你访问的页面不存在或已被移除</p>
      <el-button type="primary" :icon="HomeFilled" @click="goHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 40px;
}

.not-found-content {
  text-align: center;
}

.not-found-code {
  font-size: 96px;
  font-weight: 700;
  color: #dcdfe6;
  margin: 0;
  line-height: 1;
}

.not-found-title {
  font-size: 24px;
  color: #303133;
  margin: 16px 0 8px;
}

.not-found-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 32px;
}
</style>
