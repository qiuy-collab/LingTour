// 邮箱设置 API（SMTP 配置 + 邮件模板）
import api from './index'
import type {
  EmailEventView,
  EmailLogDetail,
  EmailLogListResult,
  EmailLogStats,
  EmailTemplatePayload,
  EmailTemplatePreview,
  SmtpSettingsPayload,
  SmtpSettingsView,
  SmtpTestResult,
} from '@/types/email'

type Envelope<T> = { data: { code: number; data: T; message: string } }

function unwrap<T>(res: unknown): T {
  const body = (res as { data?: { data?: T } }).data
  return (body?.data ?? (body as unknown as T)) as T
}

/** 获取当前生效的 SMTP 配置（密码脱敏，只返回 hasPassword） */
export async function getSmtpSettings(): Promise<SmtpSettingsView> {
  const res = await api.get('/email-settings/smtp')
  return unwrap<SmtpSettingsView>(res)
}

/** 保存 SMTP 配置；password 为空字符串时保留已存密码 */
export function saveSmtpSettings(payload: SmtpSettingsPayload): Promise<Envelope<SmtpSettingsView>> {
  return api.put('/email-settings/smtp', payload)
}

/** 测试连接：用表单当前值（密码可留空，沿用已存密码） */
export function testSmtpConnection(payload: Partial<SmtpSettingsPayload>): Promise<Envelope<SmtpTestResult>> {
  return api.post('/email-settings/smtp/test', payload)
}

/** 发送测试邮件 */
export function sendTestEmail(payload: Partial<SmtpSettingsPayload> & { to: string }): Promise<Envelope<SmtpTestResult>> {
  return api.post('/email-settings/smtp/test-send', payload)
}

/** 事件 × 已存模板全量列表 */
export async function listEmailTemplateEvents(): Promise<EmailEventView[]> {
  const res = await api.get('/email-settings/templates')
  const body = unwrap<{ events: EmailEventView[] }>(res)
  return body.events
}

/** 保存某事件的模板（当前仅 locale = 'en'） */
export function saveEmailTemplate(eventKey: string, payload: EmailTemplatePayload): Promise<Envelope<EmailEventView>> {
  return api.put(`/email-settings/templates/${eventKey}`, payload)
}

/** 用示例变量渲染模板预览（草稿内容优先） */
export function previewEmailTemplate(
  eventKey: string,
  payload: { locale?: string; subject?: string; bodyHtml?: string },
): Promise<Envelope<EmailTemplatePreview>> {
  return api.post(`/email-settings/templates/${eventKey}/preview`, payload)
}

/**
 * 按事件模板真实发送一封测试邮件：后端渲染（已存启用模板优先、系统默认兜底），
 * 传 subject/bodyHtml 时用当前编辑器内容（含未保存修改）覆盖。
 * 这是唯一能看到「用户实际收到什么」的入口，与 smtp/test-send 的固定探针不同。
 */
export function sendEventTemplateTestEmail(
  eventKey: string,
  payload: Partial<SmtpSettingsPayload> & {
    to: string
    subject?: string
    bodyHtml?: string
  },
): Promise<Envelope<SmtpTestResult>> {
  return api.post(`/email-settings/templates/${eventKey}/test-send`, payload)
}

/** 发送日志：每次真实投递（含失败与未投递）都会留一条记录 */
export async function listEmailLogs(
  params: {
    page?: number
    limit?: number
    status?: 'sent' | 'failed' | 'skipped'
    eventKey?: string
    recipient?: string
  } = {},
): Promise<EmailLogListResult> {
  const res = await api.get('/email-settings/logs', { params })
  return unwrap<EmailLogListResult>(res)
}

/**
 * 投递总量（按结果分组）。独立端点而非挂在列表响应上：响应拦截器会把
 * 带 data 数组的返回统一改写成 { data, total, page, pageSize }，任何与它并列
 * 的字段都到不了页面。
 */
export async function getEmailLogStats(): Promise<EmailLogStats> {
  const res = await api.get('/email-settings/logs/stats')
  return unwrap<EmailLogStats>(res)
}

/** 单条发送日志详情，含当时渲染后的 HTML 正文 */
export async function getEmailLog(id: string): Promise<EmailLogDetail> {
  const res = await api.get(`/email-settings/logs/${id}`)
  return unwrap<EmailLogDetail>(res)
}

/** 重发一条失败/未投递的记录：直接用存下的渲染结果投递，与首次发送逐字一致 */
export function resendEmailLog(id: string): Promise<Envelope<SmtpTestResult>> {
  return api.post(`/email-settings/logs/${id}/resend`)
}
