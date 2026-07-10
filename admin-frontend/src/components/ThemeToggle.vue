<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import type { ThemeMode } from '@/composables/useTheme'
import { Moon, Sunny, Monitor } from '@element-plus/icons-vue'

const { themeMode, isDark, setTheme } = useTheme()

const themeOptions: { value: ThemeMode; label: string; icon: any }[] = [
  { value: 'light', label: 'Light', icon: Sunny },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

function handleCommand(mode: ThemeMode) {
  setTheme(mode)
}
</script>

<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <el-tooltip :content="isDark ? 'Theme: Dark' : 'Theme: Light'" placement="bottom">
      <button type="button" class="theme-toggle-btn" aria-label="Change admin theme">
        <el-icon>
          <Moon v-if="isDark" />
          <Sunny v-else />
        </el-icon>
      </button>
    </el-tooltip>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="opt in themeOptions"
          :key="opt.value"
          :command="opt.value"
          :class="{ 'is-active': themeMode === opt.value }"
        >
          <el-icon><component :is="opt.icon" /></el-icon>
          <span>{{ opt.label }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped>
.theme-toggle-btn {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: var(--lt-radius-md);
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  color: var(--lt-text-regular);
  transition: color 0.2s, background-color 0.2s;
}

.theme-toggle-btn:hover {
  color: var(--lt-primary);
  background: var(--lt-bg-hover);
}

:deep(.is-active) {
  color: var(--lt-primary);
  font-weight: 600;
}
</style>
