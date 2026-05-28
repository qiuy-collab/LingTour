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
    meta: { title: '登录', requiresAuth: false },
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
        meta: { title: '仪表盘' },
      },
      // 城市管理
      {
        path: 'cities',
        name: 'Cities',
        component: () => import('@/views/cities/CitiesList.vue'),
        meta: { title: '城市管理' },
      },
      {
        path: 'cities/create',
        name: 'CityCreate',
        component: () => import('@/views/cities/CityEdit.vue'),
        meta: { title: '新增城市' },
      },
      {
        path: 'cities/:id/edit',
        name: 'CityEdit',
        component: () => import('@/views/cities/CityEdit.vue'),
        meta: { title: '编辑城市' },
      },
      // 路线管理
      {
        path: 'routes',
        name: 'Routes',
        component: () => import('@/views/routes/RoutesList.vue'),
        meta: { title: '路线管理' },
      },
      {
        path: 'routes/create',
        name: 'RouteCreate',
        component: () => import('@/views/routes/RouteEdit.vue'),
        meta: { title: '新增路线' },
      },
      {
        path: 'routes/:id/edit',
        name: 'RouteEdit',
        component: () => import('@/views/routes/RouteEdit.vue'),
        meta: { title: '编辑路线' },
      },
      // 商城 - 系列管理
      {
        path: 'shop/collections',
        name: 'Collections',
        component: () => import('@/views/shop/CollectionsList.vue'),
        meta: { title: '系列管理' },
      },
      {
        path: 'shop/collections/create',
        name: 'CollectionCreate',
        component: () => import('@/views/shop/CollectionEdit.vue'),
        meta: { title: '新增系列' },
      },
      {
        path: 'shop/collections/:id/edit',
        name: 'CollectionEdit',
        component: () => import('@/views/shop/CollectionEdit.vue'),
        meta: { title: '编辑系列' },
      },
      // 商城 - 商品管理
      {
        path: 'shop/products',
        name: 'Products',
        component: () => import('@/views/shop/ProductsList.vue'),
        meta: { title: '商品管理' },
      },
      {
        path: 'shop/products/create',
        name: 'ProductCreate',
        component: () => import('@/views/shop/ProductEdit.vue'),
        meta: { title: '新增商品' },
      },
      {
        path: 'shop/products/:id/edit',
        name: 'ProductEdit',
        component: () => import('@/views/shop/ProductEdit.vue'),
        meta: { title: '编辑商品' },
      },
      // 订单管理
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/shop/OrdersList.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/shop/OrderDetail.vue'),
        meta: { title: '订单详情' },
      },
      // 口译 - 服务模式
      {
        path: 'interpreting/modes',
        name: 'ServiceModes',
        component: () => import('@/views/interpreting/ServiceModesList.vue'),
        meta: { title: '服务模式' },
      },
      {
        path: 'interpreting/modes/create',
        name: 'ServiceModeCreate',
        component: () => import('@/views/interpreting/ServiceModeEdit.vue'),
        meta: { title: '新增模式' },
      },
      {
        path: 'interpreting/modes/:id/edit',
        name: 'ServiceModeEdit',
        component: () => import('@/views/interpreting/ServiceModeEdit.vue'),
        meta: { title: '编辑模式' },
      },
      // 口译 - 口译员
      {
        path: 'interpreting/profiles',
        name: 'Interpreters',
        component: () => import('@/views/interpreting/InterpretersList.vue'),
        meta: { title: '口译员管理' },
      },
      {
        path: 'interpreting/profiles/create',
        name: 'InterpreterCreate',
        component: () => import('@/views/interpreting/InterpreterEdit.vue'),
        meta: { title: '新增口译员' },
      },
      {
        path: 'interpreting/profiles/:id/edit',
        name: 'InterpreterEdit',
        component: () => import('@/views/interpreting/InterpreterEdit.vue'),
        meta: { title: '编辑口译员' },
      },
      // 口译 - 预约管理
      {
        path: 'interpreting/bookings',
        name: 'Bookings',
        component: () => import('@/views/interpreting/BookingsList.vue'),
        meta: { title: '预约管理' },
      },
      // 口译 - FAQ
      {
        path: 'interpreting/faqs',
        name: 'FAQs',
        component: () => import('@/views/interpreting/FAQsList.vue'),
        meta: { title: 'FAQ管理' },
      },
      {
        path: 'interpreting/faqs/create',
        name: 'FAQCreate',
        component: () => import('@/views/interpreting/FAQEdit.vue'),
        meta: { title: '新增FAQ' },
      },
      {
        path: 'interpreting/faqs/:id/edit',
        name: 'FAQEdit',
        component: () => import('@/views/interpreting/FAQEdit.vue'),
        meta: { title: '编辑FAQ' },
      },
      // 活动管理
      {
        path: 'events',
        name: 'Events',
        component: () => import('@/views/events/EventsList.vue'),
        meta: { title: '活动管理' },
      },
      {
        path: 'events/create',
        name: 'EventCreate',
        component: () => import('@/views/events/EventEdit.vue'),
        meta: { title: '新增活动' },
      },
      {
        path: 'events/:id/edit',
        name: 'EventEdit',
        component: () => import('@/views/events/EventEdit.vue'),
        meta: { title: '编辑活动' },
      },
      // 社区帖子
      {
        path: 'community',
        name: 'Community',
        component: () => import('@/views/community/CommunityPostsList.vue'),
        meta: { title: '社区帖子' },
      },
      {
        path: 'community/:id',
        name: 'CommunityDetail',
        component: () => import('@/views/community/PostDetail.vue'),
        meta: { title: '帖子详情' },
      },
      // 首页配置
      {
        path: 'home',
        name: 'HomeConfig',
        component: () => import('@/views/home/HomeConfig.vue'),
        meta: { title: '首页配置' },
      },
      {
        path: 'operations/audit',
        name: 'ContentAudit',
        component: () => import('@/views/operations/ContentAudit.vue'),
        meta: { title: '数据体检' },
      },
      // 媒体库
      {
        path: 'media',
        name: 'MediaLibrary',
        component: () => import('@/views/media/MediaLibrary.vue'),
        meta: { title: '媒体库' },
      },
      // 用户管理
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UsersList.vue'),
        meta: { title: '用户管理', roles: ['admin'] },
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: () => import('@/views/users/UserDetail.vue'),
        meta: { title: '用户详情', roles: ['admin'] },
      },
      // 系统设置
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/Settings.vue'),
        meta: { title: '系统设置', roles: ['admin'] },
      },
      // 操作日志
      {
        path: 'system/audit-logs',
        name: 'AuditLogs',
        component: () => import('@/views/system/AuditLogs.vue'),
        meta: { title: '操作日志', roles: ['admin'] },
      },
      // 通知中心
      {
        path: 'system/notifications',
        name: 'Notifications',
        component: () => import('@/views/system/Notifications.vue'),
        meta: { title: '通知中心' },
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
    meta: { title: '页面不存在', requiresAuth: false },
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
      ElMessage.warning('权限不足')
      next('/login')
      return
    }
  }

  next()
})

export default router
