export const ADMIN_ONBOARDING_VERSION = 'lingtour-admin-onboarding-v2'

export type AdminOnboardingStep = {
  id: string
  routeName?: string
  target: string
  mobileTarget?: string
  title: string
  body: string
}

export const ADMIN_ONBOARDING_STEPS: AdminOnboardingStep[] = [
  {
    id: 'quick-actions',
    routeName: 'Dashboard',
    target: '[data-tour="quick-actions"]',
    title: '快捷创建',
    body: '从这里新建路线、商品，或直接进入媒体库。',
  },
  {
    id: 'stats',
    routeName: 'Dashboard',
    target: '[data-tour="stats"]',
    title: '实时状态',
    body: '这些卡片汇总用户、内容、预约和订单，点击即可进入对应列表。',
  },
  {
    id: 'pending-bookings',
    routeName: 'Dashboard',
    target: '[data-tour="pending-bookings"]',
    title: '优先处理预约',
    body: '待处理预约是每天最先需要确认的服务事项。',
  },
  {
    id: 'charts',
    routeName: 'Dashboard',
    target: '[data-tour="charts"]',
    title: '查看运营趋势',
    body: '订单趋势、服务构成和热门城市集中在这里查看。',
  },
  {
    id: 'content-navigation',
    target: '[data-tour="content-nav"]',
    mobileTarget: '[data-tour="nav-toggle"]',
    title: '管理内容',
    body: '城市、路线和其他前台内容从左侧导航进入。手机端可先打开导航菜单。',
  },
  {
    id: 'help-menu',
    target: '[data-tour="help-menu"]',
    title: '随时重新查看',
    body: '以后可从顶部帮助菜单重新打开这份引导。',
  },
]

export function getAdminOnboardingStorageKey(staffId: string | null | undefined) {
  const normalized = staffId?.trim()
  return normalized ? `${ADMIN_ONBOARDING_VERSION}:${normalized}` : ''
}
