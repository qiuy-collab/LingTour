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
import { useEditorLocale } from '@/composables/useEditorLocale'
import { animateRouteEnter, animateRouteLeave } from '@/utils/motion'
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
useTheme()
const { editorLocale, editorLocaleOptions } = useEditorLocale()

const isCollapse = ref(false)
const isMobile = ref(false)
const mobileMenuOpen = ref(false)
const showEditorLocaleSwitch = computed(() =>
  /\/create$|\/edit$|\/home$|\/settings$/.test(route.path),
)
const currentPageTitle = computed(() => (route.meta.title as string) || '工作台')

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
    title: '概览',
    items: [
      { path: '/admin/dashboard', title: '仪表盘', icon: DataAnalysis },
    ],
  },
  {
    title: '内容管理',
    items: [
      { path: '/admin/cities', title: '城市', icon: MapLocation },
      { path: '/admin/routes', title: '路线', icon: Guide },
    ],
  },
  {
    title: '商城管理',
    items: [
      { path: '/admin/shop/collections', title: '系列', icon: Collection },
      { path: '/admin/shop/products', title: '商品', icon: Goods },
      { path: '/admin/orders', title: '订单', icon: Document },
    ],
  },
  {
    title: '口译服务',
    items: [
      { path: '/admin/interpreting/modes', title: '服务模式', icon: SetUp },
      { path: '/admin/interpreting/profiles', title: '口译员', icon: UserFilled },
      { path: '/admin/interpreting/bookings', title: '预约', icon: Calendar },
      { path: '/admin/interpreting/faqs', title: 'FAQ', icon: ChatLineSquare },
    ],
  },
  {
    title: '运营管理',
    items: [
      { path: '/admin/events', title: '活动', icon: Present },
      { path: '/admin/community', title: '社区帖子', icon: ChatDotSquare },
      { path: '/admin/home', title: '首页配置', icon: HomeFilled },
      { path: '/admin/operations/audit', title: '数据体检', icon: WarningFilled },
      { path: '/admin/media', title: '媒体库', icon: Picture },
    ],
  },
  {
    title: '系统管理',
    items: [
      { path: '/admin/users', title: '用户', icon: Avatar, roles: ['admin'] },
      { path: '/admin/system/audit-logs', title: '操作日志', icon: List, roles: ['admin'] },
      { path: '/admin/system/notifications', title: '通知中心', icon: Bell },
      { path: '/admin/settings', title: '系统设置', icon: Setting, roles: ['admin'] },
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

const currentSectionTitle = computed(() => {
  const match = menuGroups.find((group) => group.items.some((item) => item.path === activeMenu.value))
  return match?.title || 'LingTour Operations'
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

watch(() => route.fullPath, closeMobileMenu)
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
      :width="isMobile ? '288px' : isCollapse ? '84px' : '256px'"
      class="admin-aside"
      :class="{ 'mobile-open': mobileMenuOpen }"
    >
      <button
        type="button"
        class="logo-area"
        aria-label="返回管理后台首页"
        @click="router.push('/admin/dashboard')"
      >
        <span class="brand-mark" aria-hidden="true">LT</span>
        <span v-if="!isCollapse || isMobile" class="brand-copy">
          <strong>LingTour</strong>
          <small>Field operations</small>
        </span>
      </button>

      <div v-if="!isCollapse || isMobile" class="sidebar-status" aria-label="当前使用线上接口数据">
        <span class="status-dot" />
        <span>线上数据</span>
        <small>Production API</small>
      </div>

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

      <div v-if="!isCollapse || isMobile" class="sidebar-footer">
        <span>Editorial system</span>
        <small>Content · Commerce · Service</small>
      </div>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-container>
      <!-- 顶部 Header -->
      <el-header class="admin-header">
        <div class="header-left">
          <button
            type="button"
            class="header-icon-button collapse-btn"
            :aria-label="isMobile ? '打开导航菜单' : isCollapse ? '展开导航菜单' : '收起导航菜单'"
            :aria-expanded="isMobile ? mobileMenuOpen : !isCollapse"
            @click="toggleSidebar"
          >
            <el-icon>
              <Fold v-if="!isCollapse && !isMobile" />
              <Expand v-else />
            </el-icon>
          </button>
          <div class="header-context">
            <span>{{ currentSectionTitle }}</span>
            <strong>{{ currentPageTitle }}</strong>
          </div>
        </div>
        <div class="header-right">
          <div class="api-status hide-on-mobile">
            <span class="status-dot" />
            <span>Online API</span>
          </div>
          <div v-if="showEditorLocaleSwitch" class="editor-locale-switch">
            <span class="editor-locale-label">编辑语言</span>
            <el-segmented v-model="editorLocale" :options="editorLocaleOptions" size="small" />
          </div>
          <el-tooltip content="搜索 (Ctrl+K)" placement="bottom">
            <button
              type="button"
              class="header-search-button"
              aria-label="打开搜索"
              @click="showCommandPalette = true"
            >
              <el-icon><Search /></el-icon>
              <span>搜索</span>
              <kbd>Ctrl K</kbd>
            </button>
          </el-tooltip>
          <div class="header-utility header-theme"><ThemeToggle /></div>
          <div class="header-utility"><NotificationBell /></div>
          <el-dropdown>
            <span class="user-info">
              <span class="user-avatar"><el-icon><Avatar /></el-icon></span>
              <span class="hide-on-mobile">{{ authStore.currentUser?.name || '管理员' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="admin-main">
        <div class="admin-content-shell">
          <AppBreadcrumb />
          <ErrorBoundary>
            <router-view v-slot="{ Component }">
              <Transition
                :css="false"
                mode="out-in"
                @enter="animateRouteEnter"
                @leave="animateRouteLeave"
              >
                <component :is="Component" :key="route.fullPath" class="admin-page-stage" />
              </Transition>
            </router-view>
          </ErrorBoundary>
        </div>
      </el-main>
    </el-container>

    <!-- Command Palette -->
    <CommandPalette v-model:visible="showCommandPalette" />
  </el-container>
</template>

<style scoped>
.admin-container {
  height: 100dvh;
  min-width: 0;
}

.admin-aside {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: var(--lt-bg-sidebar);
  background-image:
    radial-gradient(circle at 12% 0%, rgba(111, 175, 157, 0.16), transparent 18rem),
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent 32%);
  overflow-x: hidden;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.055);
  transition:
    width 0.36s var(--lt-ease-out),
    transform 0.36s var(--lt-ease-out),
    background-color 0.3s;
}

.logo-area {
  width: 100%;
  min-height: 84px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 0 18px;
  cursor: pointer;
  border: 0;
  background: transparent;
  text-align: left;
}

.brand-mark {
  display: inline-flex;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  flex: 0 0 46px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.08);
  color: #f3f7f4;
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0.08em;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.brand-copy {
  display: grid;
  min-width: 0;
  color: #f3f7f4;
  white-space: nowrap;
}

.brand-copy strong {
  font-size: 17px;
  font-weight: 680;
  letter-spacing: -0.02em;
}

.brand-copy small {
  margin-top: 3px;
  color: rgba(222, 233, 227, 0.55);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.sidebar-status {
  display: grid;
  grid-template-columns: 8px 1fr;
  align-items: center;
  column-gap: 9px;
  margin: 0 14px 8px;
  padding: 11px 12px;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.035);
  color: #dbe6e0;
  font-size: 12px;
}

.sidebar-status small {
  grid-column: 2;
  margin-top: 2px;
  color: rgba(219, 230, 224, 0.45);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #7fd7a5;
  box-shadow: 0 0 0 4px rgba(127, 215, 165, 0.12);
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 120;
  background-color: var(--lt-bg-header);
  backdrop-filter: blur(18px) saturate(140%);
  border-bottom: 1px solid var(--lt-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(14px, 2vw, 28px);
  height: 72px;
  transition: background-color 0.3s, border-color 0.3s;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 14px;
}

.collapse-btn {
  font-size: 20px;
  color: var(--lt-text-secondary);
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: var(--lt-primary);
}

.header-context {
  display: grid;
  min-width: 0;
}

.header-context span {
  margin-bottom: 2px;
  color: var(--lt-text-placeholder);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.header-context strong {
  overflow: hidden;
  color: var(--lt-text-primary);
  font-size: 15px;
  font-weight: 680;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.api-status {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid var(--lt-border-light);
  border-radius: 999px;
  color: var(--lt-text-secondary);
  font-size: 11px;
  font-weight: 600;
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
  gap: 8px;
  cursor: pointer;
  color: var(--lt-text-regular);
  font-size: 14px;
}

.user-avatar {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--lt-border-light);
  border-radius: 12px;
  background: var(--lt-bg-hover);
  color: var(--lt-primary);
}

.admin-main {
  background-color: var(--lt-bg-page);
  min-width: 0;
  min-height: calc(100dvh - 72px);
  overflow-y: auto;
  padding: clamp(18px, 2.2vw, 32px);
  transition: background-color 0.3s;
}

.admin-content-shell {
  width: min(100%, var(--lt-content-max));
  min-width: 0;
  margin-inline: auto;
}

.header-search-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  gap: 8px;
  padding: 0 10px 0 12px;
  border: 1px solid var(--lt-border-light);
  border-radius: 12px;
  background: color-mix(in srgb, var(--lt-bg-hover) 70%, transparent);
  color: var(--lt-text-secondary);
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease, color 180ms ease;
}

.header-search-button:hover {
  border-color: color-mix(in srgb, var(--lt-primary) 35%, var(--lt-border-color));
  background: var(--lt-bg-hover);
  color: var(--lt-primary);
}

.header-search-button span {
  font-size: 12px;
}

.header-search-button kbd {
  padding: 3px 6px;
  border: 1px solid var(--lt-border-light);
  border-radius: 6px;
  background: var(--lt-bg-card);
  color: var(--lt-text-placeholder);
  font: 9px/1 var(--lt-font-sans);
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

.header-utility {
  display: inline-flex;
}

.header-icon-button:hover {
  background: var(--lt-bg-hover);
}

/* 覆盖 Element Plus 菜单样式 */
:deep(.el-menu) {
  flex: 1;
  border-right: none;
  background: transparent;
}

:deep(.el-menu-item-group__title) {
  height: auto;
  padding: 17px 20px 7px;
  color: rgba(219, 230, 224, 0.4);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.14em;
  line-height: 1.2;
}

:deep(.el-menu-item) {
  height: 44px;
  margin: 3px 12px;
  padding-inline: 13px !important;
  border-radius: 12px;
  color: var(--lt-sidebar-text);
  font-size: 13px;
  font-weight: 560;
  line-height: 44px;
}

:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background: rgba(111, 175, 157, 0.17);
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(137, 205, 185, 0.13);
}

:deep(.el-menu--collapse .el-menu-item) {
  justify-content: center;
  margin-inline: 14px;
  padding: 0 !important;
}

.sidebar-footer {
  display: grid;
  gap: 3px;
  margin: 18px 18px 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  color: rgba(219, 230, 224, 0.58);
  font-size: 10px;
}

.sidebar-footer small {
  color: rgba(219, 230, 224, 0.32);
  font-size: 9px;
}

/* Mobile sidebar */
@media (max-width: 768px) {
  .admin-aside {
    position: fixed !important;
    z-index: 2000;
    height: 100vh;
    width: min(288px, 86vw) !important;
    transform: translateX(-100%);
    box-shadow: 24px 0 80px rgba(0, 0, 0, 0.24);
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
  background: color-mix(in srgb, var(--lt-bg-mask) 88%, transparent);
  backdrop-filter: blur(5px);
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

  .admin-header {
    height: 64px;
    padding-inline: 12px;
  }

  .admin-main {
    min-height: calc(100dvh - 64px);
  }

  .header-context {
    display: none;
  }

  .header-left,
  .header-right {
    gap: 5px;
  }

  .header-search-button {
    width: 36px;
    min-height: 36px;
    justify-content: center;
    padding: 0;
  }

  .header-search-button span,
  .header-search-button kbd,
  .editor-locale-label {
    display: none;
  }

  .editor-locale-switch :deep(.el-segmented) {
    --el-segmented-item-selected-bg-color: var(--lt-bg-card);
    padding: 2px;
  }

  .header-icon-button,
  .user-avatar {
    width: 36px;
    height: 36px;
  }

  .brand-copy {
    display: grid;
  }
}

@media (max-width: 480px) {
  .header-theme {
    display: none;
  }
}
</style>
