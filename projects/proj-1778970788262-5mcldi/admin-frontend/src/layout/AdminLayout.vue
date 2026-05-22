<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
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
} from '@element-plus/icons-vue'
import { ref, computed, watch } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapse = ref(false)

function toggleSidebar() {
  isCollapse.value = !isCollapse.value
}

function handleLogout() {
  authStore.logout()
}

// 计算当前激活的菜单项，跟随路由变化
const activeMenu = ref(route.path)
watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath
  }
)

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
      { path: '/admin/cities', title: '城市管理', icon: MapLocation },
      { path: '/admin/routes', title: '路线管理', icon: Guide },
    ],
  },
  {
    title: '商城管理',
    items: [
      { path: '/admin/shop/collections', title: '系列管理', icon: Collection },
      { path: '/admin/shop/products', title: '商品管理', icon: Goods },
      { path: '/admin/orders', title: '订单管理', icon: Document },
    ],
  },
  {
    title: '口译服务',
    items: [
      { path: '/admin/interpreting/modes', title: '服务模式', icon: SetUp },
      { path: '/admin/interpreting/profiles', title: '口译员', icon: UserFilled },
      { path: '/admin/interpreting/bookings', title: '预约管理', icon: Calendar },
      { path: '/admin/interpreting/faqs', title: 'FAQ', icon: ChatLineSquare },
    ],
  },
  {
    title: '运营管理',
    items: [
      { path: '/admin/events', title: '活动管理', icon: Present },
      { path: '/admin/community', title: '社区帖子', icon: ChatDotSquare },
      { path: '/admin/home', title: '首页配置', icon: HomeFilled },
      { path: '/admin/operations/audit', title: '数据体检', icon: WarningFilled },
    ],
  },
  {
    title: '系统管理',
    items: [
      { path: '/admin/users', title: '用户管理', icon: Avatar, roles: ['admin'] },
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

function handleMenuSelect(path: string) {
  router.push(path)
}
</script>

<template>
  <el-container class="admin-container">
    <!-- 左侧 Sidebar -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-aside">
      <div class="logo-area" @click="router.push('/admin/dashboard')">
        <span v-if="!isCollapse" class="logo-text">凌云游管理后台</span>
        <span v-else class="logo-text-short">凌云游</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
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
          <el-icon class="collapse-btn" @click="toggleSidebar">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <span class="header-title">凌云游管理后台</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><Avatar /></el-icon>
              <span>{{ authStore.currentUser?.name || '管理员' }}</span>
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
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-container {
  height: 100vh;
}

.admin-aside {
  background-color: #304156;
  overflow-x: hidden;
  transition: width 0.3s;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
}

.logo-text-short {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.collapse-btn:hover {
  color: #409EFF;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.admin-main {
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
  overflow-y: auto;
}

/* 覆盖 Element Plus 菜单样式 */
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item-group__title) {
  color: #8899aa;
  font-size: 12px;
  padding: 16px 20px 8px;
}

:deep(.el-menu-item) {
  font-size: 14px;
}
</style>
