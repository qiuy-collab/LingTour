<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useTheme } from '@/composables/useTheme'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import {
  DataAnalysis,
  MapLocation,
  Guide,
  Collection,
  Goods,
  Document,
  SetUp,
  UserFilled,
  Calendar,
  ChatLineSquare,
  Present,
  ChatDotSquare,
  HomeFilled,
  Avatar,
  Setting,
  WarningFilled,
  SwitchButton,
  Expand,
  Fold,
  Picture,
  Search,
  Bell,
  List,
} from '@element-plus/icons-vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
useTheme()

const isCollapse = ref(false)
const isMobile = ref(false)
const mobileMenuOpen = ref(false)

// Responsive detection
function checkMobile() {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function toggleSidebar() {
  if (isMobile.value) {
    mobileMenuOpen.value = !mobileMenuOpen.value
  } else {
    isCollapse.value = !isCollapse.value
  }
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function handleLogout() {
  authStore.logout()
}

// 菜单分组配置
interface MenuItem {
  path: string
  title: string
  icon: any
  roles?: string[] // 为空表示所有角色可见
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Overview',
    items: [
      { path: '/admin/dashboard', title: 'Dashboard', icon: DataAnalysis },
    ],
  },
  {
    title: 'Content',
    items: [
      { path: '/admin/cities', title: 'Cities', icon: MapLocation },
      { path: '/admin/routes', title: 'Routes', icon: Guide },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { path: '/admin/shop/collections', title: 'Collections', icon: Collection },
      { path: '/admin/shop/products', title: 'Products', icon: Goods },
      { path: '/admin/orders', title: 'Orders', icon: Document },
    ],
  },
  {
    title: 'Interpreting',
    items: [
      { path: '/admin/interpreting/modes', title: 'Service Modes', icon: SetUp },
      { path: '/admin/interpreting/profiles', title: 'Interpreters', icon: UserFilled },
      { path: '/admin/interpreting/bookings', title: 'Bookings', icon: Calendar },
      { path: '/admin/interpreting/faqs', title: 'FAQ', icon: ChatLineSquare },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/admin/events', title: 'Events', icon: Present },
      { path: '/admin/community', title: 'Community Posts', icon: ChatDotSquare },
      { path: '/admin/home', title: 'Homepage', icon: HomeFilled },
      { path: '/admin/operations/audit', title: 'Content Audit', icon: WarningFilled },
      { path: '/admin/media', title: 'Media Library', icon: Picture },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/admin/users', title: 'Users', icon: Avatar, roles: ['admin'] },
      { path: '/admin/system/audit-logs', title: 'Audit Logs', icon: List, roles: ['admin'] },
      { path: '/admin/system/notifications', title: 'Notifications', icon: Bell },
      { path: '/admin/settings', title: 'Settings', icon: Setting, roles: ['admin'] },
    ],
  },
]

// 根据当前用户角色过滤菜单
const filteredMenuGroups = computed(() => {
  const role = authStore.currentUser?.role
  return menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || (role && item.roles.includes(role))),
    }))
    .filter((group) => group.items.length > 0)
})

// 计算当前激活的菜单项 — 匹配最长前缀的菜单路径
const allMenuPaths = menuGroups.flatMap(g => g.items.map(i => i.path))
const activeMenu = computed(() => {
  const path = route.path
  if (allMenuPaths.includes(path)) return path
  let best = ''
  for (const mp of allMenuPaths) {
    if (path.startsWith(mp) && mp.length > best.length) {
      best = mp
    }
  }
  return best || path
})

function handleMenuSelect(path: string) {
  router.push(path)
  if (isMobile.value) {
    mobileMenuOpen.value = false
  }
}

// Command Palette
const showCommandPalette = ref(false)

useKeyboardShortcuts([
  {
    key: 'ctrl+k',
    handler: () => {
      showCommandPalette.value = !showCommandPalette.value
    },
  },
])
</script>

<template>
  <el-container class="admin-container">
    <!-- Mobile sidebar mask -->
    <div
      class="mobile-sidebar-mask"
      :class="{ visible: mobileMenuOpen }"
      @click="closeMobileMenu"
    />

    <!-- 左侧 Sidebar -->
    <el-aside
      :width="isCollapse ? '64px' : '220px'"
      class="admin-aside"
      :class="{ 'mobile-open': mobileMenuOpen }"
    >
      <button
        type="button"
        class="logo-area"
        aria-label="Return to admin dashboard"
        @click="router.push('/admin/dashboard')"
      >
        <span v-if="!isCollapse" class="logo-text">LingTour Admin</span>
        <span v-else class="logo-text-short">LT</span>
      </button>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse && !isMobile"
        background-color="var(--lt-bg-sidebar)"
        text-color="var(--lt-sidebar-text)"
        active-text-color="var(--lt-sidebar-active)"
        @select="handleMenuSelect"
      >
        <template v-for="group in filteredMenuGroups" :key="group.title">
          <el-menu-item-group :title="group.title">
            <el-menu-item
              v-for="item in group.items"
              :key="item.path"
              :index="item.path"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <template #title>{{ item.title }}</template>
            </el-menu-item>
          </el-menu-item-group>
        </template>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-container>
      <!-- 顶部 Header -->
      <el-header class="admin-header">
        <div class="header-left">
          <button
            type="button"
            class="header-icon-button collapse-btn"
            :aria-label="isMobile ? 'Open navigation' : isCollapse ? 'Expand navigation' : 'Collapse navigation'"
            :aria-expanded="isMobile ? mobileMenuOpen : !isCollapse"
            @click="toggleSidebar"
          >
            <el-icon>
              <Fold v-if="!isCollapse && !isMobile" />
              <Expand v-else />
            </el-icon>
          </button>
          <span class="header-title hide-on-mobile">LingTour Admin</span>
        </div>
        <div class="header-right">
          <el-tooltip content="Search (Ctrl+K)" placement="bottom">
            <button
              type="button"
              class="header-icon-button header-action-btn"
              aria-label="Open search"
              @click="showCommandPalette = true"
            >
              <el-icon><Search /></el-icon>
            </button>
          </el-tooltip>
          <ThemeToggle />
          <NotificationBell />
          <el-dropdown>
            <span class="user-info">
              <el-icon><Avatar /></el-icon>
              <span class="hide-on-mobile">{{ authStore.currentUser?.name || 'Administrator' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  Sign out
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="admin-main">
        <AppBreadcrumb />
        <ErrorBoundary>
          <router-view v-slot="{ Component }">
            <Transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </router-view>
        </ErrorBoundary>
      </el-main>
    </el-container>

    <!-- Command Palette -->
    <CommandPalette v-model:visible="showCommandPalette" />
  </el-container>
</template>

<style scoped>
.admin-container {
  height: 100vh;
}

.admin-aside {
  background-color: var(--lt-bg-sidebar);
  overflow-x: hidden;
  overflow-y: auto;
  transition: transform 0.3s, background-color 0.3s;
}

.logo-area {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--lt-text-inverse) 10%, transparent);
  background: transparent;
}

.logo-text {
  color: var(--lt-text-inverse);
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
}

.logo-text-short {
  color: var(--lt-text-inverse);
  font-size: 14px;
  font-weight: bold;
}

.admin-header {
  background-color: var(--lt-bg-header);
  border-bottom: 1px solid var(--lt-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  transition: background-color 0.3s, border-color 0.3s;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  font-size: 20px;
  color: var(--lt-text-secondary);
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: var(--lt-primary);
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--lt-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.editor-locale-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-locale-label {
  color: var(--lt-text-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--lt-text-regular);
  font-size: 14px;
}

.admin-main {
  background-color: var(--lt-bg-page);
  min-height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 24px;
  transition: background-color 0.3s;
}

.header-action-btn {
  font-size: 18px;
  color: var(--lt-text-regular);
  transition: color 0.2s;
}

.header-action-btn:hover {
  color: var(--lt-primary);
}

.header-icon-button {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  border-radius: var(--lt-radius-md);
  background: transparent;
  cursor: pointer;
}

.header-icon-button:hover {
  background: var(--lt-bg-hover);
}

/* Page transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* 覆盖 Element Plus 菜单样式 */
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item-group__title) {
  color: color-mix(in srgb, var(--lt-text-inverse) 58%, transparent);
  font-size: 12px;
  padding: 16px 20px 8px;
}

:deep(.el-menu-item) {
  font-size: 14px;
}

/* Mobile sidebar */
@media (max-width: 768px) {
  .admin-aside {
    position: fixed !important;
    z-index: 2000;
    height: 100vh;
    width: 220px !important;
    transform: translateX(-100%);
  }

  .admin-aside.mobile-open {
    transform: translateX(0);
  }
}

/* Mobile sidebar mask */
.mobile-sidebar-mask {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--lt-bg-mask);
  z-index: 1999;
}

.mobile-sidebar-mask.visible {
  display: block;
}

/* Responsive utilities */
@media (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }

  .editor-locale-switch {
    display: none;
  }
}
</style>
