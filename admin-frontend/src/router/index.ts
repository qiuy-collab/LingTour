import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ElMessage } from 'element-plus'

// Layout
import AdminLayout from '@/layout/AdminLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: 'Login', requiresAuth: false },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: 'Dashboard' },
      },
      // 城市管理
      {
        path: 'cities',
        name: 'Cities',
        component: () => import('@/views/cities/CitiesList.vue'),
        meta: { title: 'Cities' },
      },
      {
        path: 'cities/create',
        name: 'CityCreate',
        component: () => import('@/views/cities/CityEdit.vue'),
        meta: { title: 'Create City' },
      },
      {
        path: 'cities/:id/edit',
        name: 'CityEdit',
        component: () => import('@/views/cities/CityEdit.vue'),
        meta: { title: 'Edit City' },
      },
      // 路线管理
      {
        path: 'routes',
        name: 'Routes',
        component: () => import('@/views/routes/RoutesList.vue'),
        meta: { title: 'Routes' },
      },
      {
        path: 'routes/create',
        name: 'RouteCreate',
        component: () => import('@/views/routes/RouteEdit.vue'),
        meta: { title: 'Create Route' },
      },
      {
        path: 'routes/:id/edit',
        name: 'RouteEdit',
        component: () => import('@/views/routes/RouteEdit.vue'),
        meta: { title: 'Edit Route' },
      },
      // 商城 - 系列管理
      {
        path: 'shop/collections',
        name: 'Collections',
        component: () => import('@/views/shop/CollectionsList.vue'),
        meta: { title: 'Collections' },
      },
      {
        path: 'shop/collections/create',
        name: 'CollectionCreate',
        component: () => import('@/views/shop/CollectionEdit.vue'),
        meta: { title: 'Create Collection' },
      },
      {
        path: 'shop/collections/:id/edit',
        name: 'CollectionEdit',
        component: () => import('@/views/shop/CollectionEdit.vue'),
        meta: { title: 'Edit Collection' },
      },
      // 商城 - 商品管理
      {
        path: 'shop/products',
        name: 'Products',
        component: () => import('@/views/shop/ProductsList.vue'),
        meta: { title: 'Products' },
      },
      {
        path: 'shop/products/create',
        name: 'ProductCreate',
        component: () => import('@/views/shop/ProductEdit.vue'),
        meta: { title: 'Create Product' },
      },
      {
        path: 'shop/products/:id/edit',
        name: 'ProductEdit',
        component: () => import('@/views/shop/ProductEdit.vue'),
        meta: { title: 'Edit Product' },
      },
      // 订单管理
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/shop/OrdersList.vue'),
        meta: { title: 'Orders' },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/shop/OrderDetail.vue'),
        meta: { title: 'Order Details' },
      },
      // 口译 - 服务模式
      {
        path: 'interpreting/modes',
        name: 'ServiceModes',
        component: () => import('@/views/interpreting/ServiceModesList.vue'),
        meta: { title: 'Service Modes' },
      },
      {
        path: 'interpreting/modes/create',
        name: 'ServiceModeCreate',
        component: () => import('@/views/interpreting/ServiceModeEdit.vue'),
        meta: { title: 'Create Service Mode' },
      },
      {
        path: 'interpreting/modes/:id/edit',
        name: 'ServiceModeEdit',
        component: () => import('@/views/interpreting/ServiceModeEdit.vue'),
        meta: { title: 'Edit Service Mode' },
      },
      // 口译 - 口译员
      {
        path: 'interpreting/profiles',
        name: 'Interpreters',
        component: () => import('@/views/interpreting/InterpretersList.vue'),
        meta: { title: 'Interpreters' },
      },
      {
        path: 'interpreting/profiles/create',
        name: 'InterpreterCreate',
        component: () => import('@/views/interpreting/InterpreterEdit.vue'),
        meta: { title: 'Create Interpreter' },
      },
      {
        path: 'interpreting/profiles/:id/edit',
        name: 'InterpreterEdit',
        component: () => import('@/views/interpreting/InterpreterEdit.vue'),
        meta: { title: 'Edit Interpreter' },
      },
      // 口译 - 预约管理
      {
        path: 'interpreting/bookings',
        name: 'Bookings',
        component: () => import('@/views/interpreting/BookingsList.vue'),
        meta: { title: 'Bookings' },
      },
      // 口译 - FAQ
      {
        path: 'interpreting/faqs',
        name: 'FAQs',
        component: () => import('@/views/interpreting/FAQsList.vue'),
        meta: { title: 'FAQs' },
      },
      {
        path: 'interpreting/faqs/create',
        name: 'FAQCreate',
        component: () => import('@/views/interpreting/FAQEdit.vue'),
        meta: { title: 'Create FAQ' },
      },
      {
        path: 'interpreting/faqs/:id/edit',
        name: 'FAQEdit',
        component: () => import('@/views/interpreting/FAQEdit.vue'),
        meta: { title: 'Edit FAQ' },
      },
      // 活动管理
      {
        path: 'events',
        name: 'Events',
        component: () => import('@/views/events/EventsList.vue'),
        meta: { title: 'Events' },
      },
      {
        path: 'events/create',
        name: 'EventCreate',
        component: () => import('@/views/events/EventEdit.vue'),
        meta: { title: 'Create Event' },
      },
      {
        path: 'events/:id/edit',
        name: 'EventEdit',
        component: () => import('@/views/events/EventEdit.vue'),
        meta: { title: 'Edit Event' },
      },
      // 社区帖子
      {
        path: 'community',
        name: 'Community',
        component: () => import('@/views/community/CommunityPostsList.vue'),
        meta: { title: 'Community Posts' },
      },
      {
        path: 'community/:id',
        name: 'CommunityDetail',
        component: () => import('@/views/community/PostDetail.vue'),
        meta: { title: 'Post Details' },
      },
      // 首页配置
      {
        path: 'home',
        name: 'HomeConfig',
        component: () => import('@/views/home/HomeConfig.vue'),
        meta: { title: 'Homepage' },
      },
      {
        path: 'operations/audit',
        name: 'ContentAudit',
        component: () => import('@/views/operations/ContentAudit.vue'),
        meta: { title: 'Content Audit' },
      },
      // 媒体库
      {
        path: 'media',
        name: 'MediaLibrary',
        component: () => import('@/views/media/MediaLibrary.vue'),
        meta: { title: 'Media Library' },
      },
      // 用户管理
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UsersList.vue'),
        meta: { title: 'Users', roles: ['admin'] },
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: () => import('@/views/users/UserDetail.vue'),
        meta: { title: 'User Details', roles: ['admin'] },
      },
      // 系统设置
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/Settings.vue'),
        meta: { title: 'Settings', roles: ['admin'] },
      },
      // 操作日志
      {
        path: 'system/audit-logs',
        name: 'AuditLogs',
        component: () => import('@/views/system/AuditLogs.vue'),
        meta: { title: 'Audit Logs', roles: ['admin'] },
      },
      // 通知中心
      {
        path: 'system/notifications',
        name: 'Notifications',
        component: () => import('@/views/system/Notifications.vue'),
        meta: { title: 'Notifications' },
      },
      // 默认重定向
      {
        path: '',
        redirect: '/admin/dashboard',
      },
    ],
  },
  {
    path: '/',
    redirect: '/admin/dashboard',
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'Page Not Found', requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫:未登录 → /login(并保留来源路径 redirect);已登录访问 /login → dashboard;角色不足拒绝
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false
  const requiredRoles = to.meta.roles as string[] | undefined

  if (requiresAuth && !authStore.isLoggedIn) {
    // 未登录,记录目标地址用于登录后跳回
    next({
      path: '/login',
      query: to.fullPath !== '/login' ? { redirect: to.fullPath } : undefined,
    })
    return
  }

  if (to.path === '/login' && authStore.isLoggedIn) {
    next('/admin/dashboard')
    return
  }

  if (requiredRoles && requiredRoles.length > 0) {
    // 角色受限路由必须有合法用户对象,否则拒绝并强制重新登录
    const role = authStore.currentUser?.role
    if (!role || !requiredRoles.includes(role)) {
      ElMessage.warning('Insufficient permissions')
      next('/login')
      return
    }
  }

  next()
})

export default router
