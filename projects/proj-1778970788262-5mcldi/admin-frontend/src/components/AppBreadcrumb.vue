<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

interface BreadcrumbItem {
  title: string
  path?: string
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched
  const items: BreadcrumbItem[] = []

  for (const record of matched) {
    // Skip the layout wrapper (no title)
    if (!record.meta?.title) continue
    // Skip login
    if (record.path === '/login') continue

    items.push({
      title: record.meta.title as string,
      path: record.path === route.path ? undefined : record.path,
    })
  }

  return items
})

function handleClick(path?: string) {
  if (path) {
    router.push(path)
  }
}
</script>

<template>
  <el-breadcrumb separator="/" class="app-breadcrumb" v-if="breadcrumbs.length > 1">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="index"
    >
      <span
        v-if="item.path && index < breadcrumbs.length - 1"
        class="breadcrumb-link"
        @click="handleClick(item.path)"
      >
        {{ item.title }}
      </span>
      <span v-else class="breadcrumb-current">{{ item.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped>
.app-breadcrumb {
  margin-bottom: 16px;
}

.breadcrumb-link {
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #409eff;
}

.breadcrumb-current {
  color: #303133;
  font-weight: 500;
}
</style>
