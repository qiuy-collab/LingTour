<script setup lang="ts">
import { onMounted } from 'vue'
import { getSettings } from '@/api/settings'
import { useAuthStore } from '@/store/auth'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.isLoggedIn) return
  // Settings 是 admin-only 资源；editor 请求只会得到 403 噪音（P3-11）。
  // editor 直接使用 CSS 默认字号回退。
  if (authStore.currentUser?.role !== 'admin') return
  try {
    const res = await getSettings()
    const settings = res.data.data
    const root = document.documentElement
    root.style.setProperty('--admin-font-page-title', `${settings.pageTitleFontSize || 20}px`)
    root.style.setProperty('--admin-font-section-title', `${settings.sectionTitleFontSize || 15}px`)
    root.style.setProperty('--admin-font-body', `${settings.bodyFontSize || 14}px`)
    root.style.setProperty('--admin-font-hint', `${settings.hintFontSize || 12}px`)
  } catch {
    // use fallback values
  }
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>
