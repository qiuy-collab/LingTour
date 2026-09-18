// 邮箱设置模块类型定义

export interface SmtpSettingsView {
  host: string
  port: number
  username: string
  fromEmail: string
  fromName: string
  useTls: boolean
  /** 后端永不回传密码明文，只有「是否已配置」与其存储来源 */
  hasPassword: boolean
  passwordSource: 'database' | 'environment' | 'none'
  source: 'database' | 'environment'
}

/** 保存表单；password 留空（空字符串）表示保留已存密码 */
export interface SmtpSettingsPayload {
  host: string
  port: number
  username: string
  password: string
  fromEmail: string
  fromName: string
  useTls: boolean
}

export interface SmtpTestResult {
  ok: boolean
  message: string
}

export interface EmailEventVariable {
  key: string
  label: string
  example: string
}

export interface StoredTemplate {
  subject: string
  bodyHtml: string
  isActive: boolean
  updatedAt: string
}

export interface EmailEventView {
  key: string
  label: string
  description: string
  status: 'active' | 'planned'
  variables: EmailEventVariable[]
  defaultSubject: string
  defaultBodyHtml: string
  templates: Record<string, StoredTemplate>
}

export interface EmailTemplatePayload {
  locale: string
  subject: string
  bodyHtml: string
  isActive?: boolean
}

export interface EmailTemplatePreview {
  subject: string
  bodyHtml: string
  /** 预览内容来源：草稿（未保存编辑）/ 已存模板 / 系统默认 */
  source: 'draft' | 'stored' | 'default'
  /** 已存模板存在但处于停用状态——真实发送会忽略它并使用系统默认模板 */
  storedDisabled: boolean
}

/**
 * 一次通知邮件的投递记录。保存的是当时真正交给 SMTP 的渲染结果，
 * 因此「详情」看到的就是用户收到的那封信，重发也与之逐字一致。
 */
export interface EmailLogView {
  id: string
  eventKey: string
  eventLabel: string
  recipient: string
  subject: string
  status: 'sent' | 'failed' | 'skipped'
  error: string | null
  attempts: number
  resourceType: string | null
  resourceId: string | null
  lastAttemptAt: string
  createdAt: string
}

export interface EmailLogDetail extends EmailLogView {
  /** 渲染后的 HTML 正文（非模板源码） */
  bodyHtml: string
}

export interface EmailLogListResult {
  data: EmailLogView[]
  total: number
  page: number
  pageSize: number
}

/** Delivery totals across every log row (not affected by the list filters) */
export interface EmailLogStats {
  sent: number
  failed: number
  skipped: number
}
