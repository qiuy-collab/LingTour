<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Check, Delete, RefreshRight, Right } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { gsap } from 'gsap'
import { useNotificationStore } from '@/store/notification'
import { notificationApi } from '@/api/notifications'
import { NOTIFICATION_TYPE_LABELS, type Notification } from '@/types/notification'
import { formatDateTime } from '@/utils/format'
import { prefersReducedMotion } from '@/utils/motion'
import PageSkeleton from '@/components/PageSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const notifStore = useNotificationStore()
const pageRoot = ref<HTMLElement | null>(null)
const loading = ref(false)
const list = computed(() => notifStore.notifications)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filterType = ref('')
const filterRead = ref('')
const isFirstLoad = ref(true)
let motionContext: ReturnType<typeof gsap.context> | null = null

const activeFilterLabel = computed(() => {
  if (filterType.value) return NOTIFICATION_TYPE_LABELS[filterType.value]
  if (filterRead.value === 'unread') return '未读事项'
  if (filterRead.value === 'read') return '已处理事项'
  return '全部动态'
})

async function fetchList(animate = true) {
  loading.value = true
  try {
    const params: Record<string, string | number | boolean> = { page: page.value, pageSize: pageSize.value }
    if (filterType.value) params.type = filterType.value
    if (filterRead.value !== '') params.read = filterRead.value === 'read'
    const result = await notifStore.fetchNotifications(params)
    total.value = result?.total ?? list.value.length
    if (animate) await revealList()
  } finally {
    loading.value = false
    isFirstLoad.value = false
  }
}

async function revealList() {
  motionContext?.revert()
  if (prefersReducedMotion()) return
  await nextTick()
  if (!pageRoot.value) return
  motionContext = gsap.context(() => {
    gsap.fromTo('[data-notification-row]', { autoAlpha: 0, y: 10 }, {
      autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.045, ease: 'power2.out', clearProps: 'all',
    })
  }, pageRoot.value)
}

onMounted(async () => {
  await Promise.all([fetchList(), notifStore.fetchUnreadCount()])
})
onBeforeUnmount(() => motionContext?.revert())

function applyFilter() { page.value = 1; fetchList() }

async function openNotification(notification: Notification) {
  if (!notification.read) await notifStore.markAsRead(notification.id)
  if (notification.link) await router.push(notification.link)
}

async function markAllRead() {
  const success = await notifStore.markAllAsRead()
  if (!success) return
  ElMessage.success('所有通知已标记为已读')
  await fetchList(false)
}

async function removeNotification(id: string) {
  try {
    await ElMessageBox.confirm('删除后无法恢复，确定删除这条通知吗？', '删除通知', {
      type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消',
    })
    await notificationApi.delete(id)
    ElMessage.success('通知已删除')
    await Promise.all([fetchList(false), notifStore.fetchUnreadCount()])
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败，请稍后重试')
  }
}

function setPage(value: number) { page.value = value; fetchList() }
function setPageSize(value: number) { pageSize.value = value; page.value = 1; fetchList() }
</script>

<template>
  <main ref="pageRoot" class="notification-page">
    <header class="page-intro">
      <div class="intro-copy">
        <span class="eyebrow">OPERATIONS INBOX</span>
        <h1>通知中心</h1>
        <p>订单、口译预约和社区审核会在发生时自动汇入这里。</p>
      </div>
      <div class="intro-actions">
        <el-button :icon="RefreshRight" :loading="loading" @click="fetchList(false)">刷新</el-button>
        <el-button type="primary" :icon="Check" :disabled="!notifStore.hasUnread" @click="markAllRead">全部已读</el-button>
      </div>
    </header>

    <section class="inbox-shell" aria-label="通知列表">
      <aside class="inbox-summary">
        <span class="summary-label">当前视图</span>
        <strong>{{ activeFilterLabel }}</strong>
        <p>共 {{ total }} 条</p>
        <div class="unread-meter" :class="{ quiet: !notifStore.hasUnread }">
          <span>{{ notifStore.unreadCount }}</span><small>条未读</small>
        </div>
        <p class="summary-hint">点击通知可标记已读，并直接进入对应业务页面。</p>
      </aside>

      <div class="inbox-content">
        <div class="filter-rail" aria-label="通知筛选">
          <el-select v-model="filterType" placeholder="全部来源" clearable @change="applyFilter">
            <el-option v-for="(label, key) in NOTIFICATION_TYPE_LABELS" :key="key" :label="label" :value="key" />
          </el-select>
          <el-select v-model="filterRead" placeholder="全部状态" clearable @change="applyFilter">
            <el-option label="未读" value="unread" /><el-option label="已读" value="read" />
          </el-select>
          <span class="live-status"><i /> 实时业务数据</span>
        </div>

        <el-alert v-if="notifStore.lastError" class="error-alert" type="error" :closable="false" title="通知加载失败，请检查接口或稍后刷新。" />
        <PageSkeleton v-if="isFirstLoad && loading" type="list" :rows="6" />

        <div v-else-if="list.length" class="notification-list">
          <article v-for="notification in list" :key="notification.id" class="notification-row" :class="{ unread: !notification.read }" data-notification-row>
            <button class="notification-main" type="button" @click="openNotification(notification)">
              <span class="status-mark" aria-hidden="true" />
              <span class="notification-copy">
                <span class="notification-meta">
                  <em>{{ NOTIFICATION_TYPE_LABELS[notification.type] || notification.type }}</em>
                  <time>{{ formatDateTime(notification.createdAt) }}</time>
                </span>
                <strong>{{ notification.title }}</strong>
                <span v-if="notification.body && notification.body !== notification.title" class="notification-body">{{ notification.body }}</span>
              </span>
              <el-icon v-if="notification.link" class="open-icon"><Right /></el-icon>
            </button>
            <div class="row-actions">
              <el-button v-if="!notification.read" link type="primary" @click="notifStore.markAsRead(notification.id)">标记已读</el-button>
              <el-button link type="danger" :icon="Delete" aria-label="删除通知" @click="removeNotification(notification.id)" />
            </div>
          </article>
        </div>

        <EmptyState v-else-if="!loading" title="当前没有通知" description="新的订单、预约和审核事项出现时，会自动显示在这里。" :icon="Bell" />
        <footer v-if="total > pageSize" class="pagination-wrap">
          <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @current-change="setPage" @size-change="setPageSize" />
        </footer>
      </div>
    </section>
  </main>
</template>

<style scoped>
.notification-page { min-width: 0; }
.page-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
.intro-copy { min-width: 0; }
.eyebrow { display: block; margin-bottom: 8px; color: var(--lt-accent); font-size: 10px; font-weight: 750; letter-spacing: .16em; }
.page-intro h1 { margin: 0; color: var(--lt-text-primary); font-size: clamp(24px, 2.4vw, 36px); font-weight: 650; letter-spacing: -.035em; }
.page-intro p { margin: 8px 0 0; color: var(--lt-text-secondary); line-height: 1.6; }
.intro-actions { display: flex; flex: 0 0 auto; gap: 8px; }
.inbox-shell { display: grid; grid-template-columns: minmax(190px, 250px) minmax(0, 1fr); overflow: hidden; border: 1px solid var(--lt-border-light); border-radius: var(--lt-radius-xl); background: var(--lt-bg-card); box-shadow: var(--lt-shadow-sm); }
.inbox-summary { display: flex; min-width: 0; flex-direction: column; padding: 24px; border-right: 1px solid var(--lt-border-light); background: linear-gradient(155deg, var(--lt-primary-soft), transparent 62%); }
.summary-label { color: var(--lt-text-secondary); font-size: 11px; letter-spacing: .08em; }
.inbox-summary > strong { margin-top: 8px; color: var(--lt-text-primary); font-size: 20px; }
.inbox-summary > p { margin: 5px 0 0; color: var(--lt-text-secondary); font-size: 12px; }
.unread-meter { display: grid; width: 112px; height: 112px; place-content: center; margin: 34px 0; border: 1px solid color-mix(in srgb, var(--lt-primary) 34%, transparent); border-radius: 50%; background: var(--lt-bg-card); text-align: center; box-shadow: 0 16px 35px color-mix(in srgb, var(--lt-primary) 10%, transparent); }
.unread-meter span { color: var(--lt-primary); font-size: 32px; font-weight: 650; line-height: 1; }
.unread-meter small { margin-top: 6px; color: var(--lt-text-secondary); }
.unread-meter.quiet { opacity: .62; }
.inbox-summary .summary-hint { margin-top: auto; line-height: 1.6; }
.inbox-content { min-width: 0; }
.filter-rail { display: flex; align-items: center; gap: 10px; min-height: 68px; padding: 13px 18px; border-bottom: 1px solid var(--lt-border-light); }
.filter-rail :deep(.el-select) { width: 140px; }
.live-status { display: inline-flex; align-items: center; gap: 7px; margin-left: auto; color: var(--lt-text-secondary); font-size: 11px; white-space: nowrap; }
.live-status i { width: 6px; height: 6px; border-radius: 50%; background: var(--lt-success); box-shadow: 0 0 0 4px color-mix(in srgb, var(--lt-success) 14%, transparent); }
.error-alert { margin: 14px 18px 0; }
.notification-list { display: grid; }
.notification-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; min-width: 0; border-bottom: 1px solid var(--lt-border-lighter); transition: background-color 180ms ease; }
.notification-row:last-child { border-bottom: 0; }
.notification-row:hover { background: var(--lt-bg-hover); }
.notification-row.unread { background: color-mix(in srgb, var(--lt-primary-soft) 65%, var(--lt-bg-card)); }
.notification-main { display: grid; grid-template-columns: 8px minmax(0, 1fr) auto; gap: 14px; min-width: 0; padding: 18px; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
.status-mark { width: 7px; height: 7px; margin-top: 7px; border: 1px solid var(--lt-border-color); border-radius: 50%; background: transparent; }
.unread .status-mark { border-color: var(--lt-primary); background: var(--lt-primary); box-shadow: 0 0 0 4px var(--lt-primary-soft); }
.notification-copy { display: grid; min-width: 0; gap: 5px; }
.notification-meta { display: flex; min-width: 0; align-items: center; gap: 10px; }
.notification-meta em { color: var(--lt-accent); font-size: 10px; font-style: normal; font-weight: 750; letter-spacing: .08em; }
.notification-meta time { color: var(--lt-text-placeholder); font-size: 11px; }
.notification-copy > strong { overflow-wrap: anywhere; color: var(--lt-text-primary); font-size: 14px; font-weight: 650; line-height: 1.45; }
.notification-body { overflow-wrap: anywhere; color: var(--lt-text-secondary); font-size: 12px; line-height: 1.55; }
.open-icon { align-self: center; color: var(--lt-text-placeholder); }
.row-actions { display: flex; align-items: center; gap: 2px; padding: 12px 16px 12px 0; }
.pagination-wrap { display: flex; justify-content: flex-end; overflow-x: auto; padding: 16px 18px; border-top: 1px solid var(--lt-border-light); }
@media (max-width: 900px) {
  .inbox-shell { grid-template-columns: 1fr; }
  .inbox-summary { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 4px 16px; padding: 18px; border-right: 0; border-bottom: 1px solid var(--lt-border-light); }
  .inbox-summary > strong, .inbox-summary > p { grid-column: 1; }
  .unread-meter { grid-column: 2; grid-row: 1 / span 3; width: 72px; height: 72px; margin: 0; }
  .unread-meter span { font-size: 23px; }
  .summary-hint { display: none; }
}
@media (max-width: 640px) {
  .page-intro { align-items: stretch; flex-direction: column; gap: 14px; }
  .intro-actions { display: grid; grid-template-columns: 1fr 1fr; }
  .intro-actions :deep(.el-button) { margin: 0; }
  .filter-rail { overflow-x: auto; padding: 11px 14px; scrollbar-width: none; }
  .filter-rail :deep(.el-select) { width: 132px; flex: 0 0 132px; }
  .live-status { margin-left: 4px; }
  .notification-row { grid-template-columns: minmax(0, 1fr); }
  .notification-main { padding: 16px 14px 8px; }
  .row-actions { justify-content: flex-end; padding: 0 12px 10px; }
  .notification-meta { align-items: flex-start; flex-direction: column; gap: 3px; }
  .open-icon { display: none; }
  .pagination-wrap { justify-content: flex-start; }
}
@media (prefers-reduced-motion: reduce) { .notification-row { transition: none; } }
</style>
