<script setup lang="ts">
import { onMounted } from 'vue'
import { getSettings } from '@/api/settings'
import en from 'element-plus/es/locale/lang/en'

onMounted(async () => {
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
  <el-config-provider :locale="en">
    <router-view />
  </el-config-provider>
</template>
