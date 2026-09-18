<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Connection, Message, Promotion } from '@element-plus/icons-vue'
import { gsap } from 'gsap'
import {
  getSmtpSettings,
  saveSmtpSettings,
  sendTestEmail,
  testSmtpConnection,
} from '@/api/email'
import type { SmtpSettingsView } from '@/types/email'
import { prefersReducedMotion } from '@/utils/motion'
import PageSkeleton from '@/components/PageSkeleton.vue'
import EmailTemplatePanel from './EmailTemplatePanel.vue'
import EmailLogPanel from './EmailLogPanel.vue'

const pageRoot = ref<HTMLElement | null>(null)
const activeTab = ref('smtp')
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const testSendVisible = ref(false)
const testSendLoading = ref(false)
const testRecipient = ref('')
let motionContext: ReturnType<typeof gsap.context> | null = null

const view = ref<SmtpSettingsView | null>(null)

// ─── 表单：加载后由现有配置回填，示例值只出现在 placeholder 里 ───
const form = reactive({
  host: '',
  port: 587,
  username: '',
  password: '',
  fromEmail: '',
  fromName: '',
  useTls: true,
})

const passwordPlaceholder = ref('留空以保留现有密码')

async function fetchSettings() {
  loading.value = true
  try {
    const data = await getSmtpSettings()
    view.value = data
    // 回填当前系统已有的 SMTP 配置（数据库优先，环境变量兜底）。
    // 绝不写入示例默认值：未配置的字段保持空白，等管理员填写。
    form.host = data.host || ''
    form.port = data.port || 587
    form.username = data.username || ''
    form.fromEmail = data.fromEmail || ''
    form.fromName = data.fromName || ''
    form.useTls = data.useTls ?? true
    form.password = ''
    passwordPlaceholder.value = data.hasPassword
      ? '留空以保留现有密码'
      : '尚未配置密码'
  } catch (error) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || '获取邮箱设置失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

function validateForm(): boolean {
  if (!form.host.trim()) {
    ElMessage.warning('请填写 SMTP 主机')
    return false
  }
  if (!Number.isInteger(form.port) || form.port < 1 || form.port > 65535) {
    ElMessage.warning('SMTP 端口需为 1-65535 的整数')
    return false
  }
  if (!form.username.trim()) {
    ElMessage.warning('请填写 SMTP 用户名')
    return false
  }
  if (form.fromEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.fromEmail.trim())) {
    ElMessage.warning('发件人邮箱格式不正确')
    return false
  }
  return true
}

async function handleSave() {
  if (!validateForm()) return
  saving.value = true
  try {
    const res = await saveSmtpSettings({
      host: form.host.trim(),
      port: form.port,
      username: form.username.trim(),
      // 留空 = 保留已存密码，后端负责不覆盖
      password: form.password,
      fromEmail: form.fromEmail.trim(),
      fromName: form.fromName.trim(),
      useTls: form.useTls,
    })
    view.value = res.data.data
    form.password = ''
    passwordPlaceholder.value = res.data.data.hasPassword
      ? '留空以保留现有密码'
      : '尚未配置密码'
    ElMessage.success('SMTP 配置已保存')
  } catch (error) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || '保存失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}

/** 测试连接使用表单当前值（含未保存的修改），密码留空则沿用已存密码 */
async function handleTestConnection() {
  testing.value = true
  try {
    const res = await testSmtpConnection({
      host: form.host.trim(),
      port: form.port,
      username: form.username.trim(),
      password: form.password,
      useTls: form.useTls,
    })
    if (res.data.data.ok) {
      ElMessage.success(res.data.data.message)
    } else {
      ElMessage.error(res.data.data.message)
    }
  } catch (error) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || '测试请求失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    testing.value = false
  }
}

async function handleSendTest() {
  const to = testRecipient.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    ElMessage.warning('请填写正确的收件人邮箱')
    return
  }
  testSendLoading.value = true
  try {
    const res = await sendTestEmail({
      host: form.host.trim(),
      port: form.port,
      username: form.username.trim(),
      password: form.password,
      fromEmail: form.fromEmail.trim(),
      fromName: form.fromName.trim(),
      useTls: form.useTls,
      to,
    })
    if (res.data.data.ok) {
      ElMessage.success(res.data.data.message)
      testSendVisible.value = false
      testRecipient.value = ''
    } else {
      ElMessage.error(res.data.data.message)
    }
  } catch (error) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || '发送请求失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    testSendLoading.value = false
  }
}

const sourceLabel = (view: SmtpSettingsView | null) => {
  if (!view) return ''
  if (view.source === 'database') return '当前配置来自后台保存（数据库）'
  return '当前配置来自服务器环境变量（后台保存后将覆盖环境变量）'
}

const passwordSourceLabel = (view: SmtpSettingsView | null) => {
  if (!view || !view.hasPassword) return '密码尚未配置，测试连接与真实发信都会失败'
  if (view.passwordSource === 'database') return '密码已保存在数据库中，留空保存不会覆盖'
  return '密码来自服务器环境变量，保存后将以数据库中的密码优先'
}

onMounted(async () => {
  await fetchSettings()
  if (prefersReducedMotion() || !pageRoot.value) return
  await nextTick()
  motionContext = gsap.context(() => {
    gsap.fromTo(
      '[data-reveal]',
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.06, ease: 'power2.out', clearProps: 'all' },
    )
  }, pageRoot.value)
})
onBeforeUnmount(() => motionContext?.revert())
</script>

<template>
  <main ref="pageRoot" class="email-settings-page">
    <header class="page-intro">
      <div class="intro-copy">
        <span class="eyebrow">EMAIL DELIVERY</span>
        <h1>邮箱设置</h1>
        <p>配置发送验证码等系统邮件的 SMTP 服务，并按业务事件自定义通知邮件的内容。保存前可先测试连通性与真实发信。</p>
      </div>
    </header>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane name="smtp">
        <template #label>
          <span class="tab-label">SMTP 服务</span>
        </template>

        <PageSkeleton v-if="loading" type="form" :rows="8" />

        <section v-else class="settings-shell" aria-label="SMTP 配置">
          <div class="section-head" data-reveal>
            <div class="section-copy">
              <h2>SMTP 服务</h2>
              <p>
                系统邮件（验证码、通知等）均通过此服务发送。
                表单已自动回填当前生效的配置；测试连接只校验参数能否连通，
                「发送测试邮件」会真实发出一封信用于确认。
              </p>
            </div>
            <div class="section-actions">
              <el-button :icon="Connection" :loading="testing" :disabled="loading" @click="handleTestConnection">
                测试连接
              </el-button>
              <el-button type="primary" :icon="Promotion" :disabled="loading" @click="testSendVisible = true">
                发送测试邮件
              </el-button>
            </div>
          </div>

          <div data-reveal>
            <el-alert
              v-if="view && view.source === 'environment'"
              type="info"
              :closable="false"
              show-icon
              :title="sourceLabel(view)"
              class="source-alert"
            />
            <el-alert
              v-else-if="view && view.source === 'database'"
              type="success"
              :closable="false"
              show-icon
              :title="sourceLabel(view)"
              class="source-alert"
            />
          </div>

          <el-form label-position="top" class="smtp-form" data-reveal @submit.prevent>
            <div class="form-grid">
              <el-form-item label="SMTP 主机" required>
                <el-input v-model="form.host" placeholder="smtp.gmail.com" autocomplete="off" />
              </el-form-item>
              <el-form-item label="SMTP 端口" required>
                <el-input-number v-model="form.port" :min="1" :max="65535" :controls="false" class="port-input" />
              </el-form-item>
              <el-form-item label="SMTP 用户名" required>
                <el-input v-model="form.username" placeholder="your-email@gmail.com" autocomplete="off" />
              </el-form-item>
              <el-form-item label="SMTP 密码">
                <el-input
                  v-model="form.password"
                  type="password"
                  :placeholder="passwordPlaceholder"
                  autocomplete="new-password"
                  show-password
                />
              </el-form-item>
              <el-form-item label="发件人邮箱">
                <el-input v-model="form.fromEmail" placeholder="noreply@example.com" autocomplete="off" />
              </el-form-item>
              <el-form-item label="发件人名称">
                <el-input v-model="form.fromName" placeholder="Culvoy" autocomplete="off" />
              </el-form-item>
            </div>

            <div class="tls-row">
              <div class="tls-copy">
                <strong>使用 TLS</strong>
                <p>为 SMTP 连接启用 TLS 加密（465 端口为隐式 TLS，587 端口为 STARTTLS）。</p>
              </div>
              <el-switch v-model="form.useTls" />
            </div>

            <p v-if="view" class="password-hint">{{ passwordSourceLabel(view) }}</p>

            <div class="form-actions">
              <el-button type="primary" :icon="Message" :loading="saving" @click="handleSave">保存配置</el-button>
            </div>
          </el-form>
        </section>
      </el-tab-pane>

      <el-tab-pane lazy name="templates">
        <template #label>
          <span class="tab-label">邮件模板</span>
        </template>
        <EmailTemplatePanel />
      </el-tab-pane>

      <el-tab-pane lazy name="logs">
        <template #label>
          <span class="tab-label">发送日志</span>
        </template>
        <EmailLogPanel />
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="testSendVisible" title="发送测试邮件" width="440px">
      <el-form label-position="top" @submit.prevent>
        <el-form-item label="收件人邮箱" required>
          <el-input
            v-model="testRecipient"
            placeholder="test@example.com"
            autocomplete="off"
            @keyup.enter="handleSendTest"
          />
        </el-form-item>
      </el-form>
      <p class="dialog-hint">将使用「SMTP 服务」表单的当前配置发送一封测试邮件；密码留空时沿用已保存的密码。</p>
      <template #footer>
        <el-button @click="testSendVisible = false">取消</el-button>
        <el-button type="primary" :loading="testSendLoading" @click="handleSendTest">发送</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<style scoped>
.email-settings-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-intro .intro-copy h1 {
  margin: 0;
}

.page-intro .intro-copy p {
  margin: 8px 0 0;
  max-width: 680px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

.settings-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.settings-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

.tab-label {
  font-size: 14px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.section-copy h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-copy p {
  margin: 6px 0 0;
  max-width: 640px;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

.section-actions {
  display: flex;
  flex-shrink: 0;
}

.source-alert {
  border-radius: 10px;
}

.settings-shell {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  padding: 24px;
}

.smtp-form {
  margin-top: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 24px;
}

.port-input {
  width: 100%;
}

.port-input :deep(.el-input__inner) {
  text-align: left;
}

.tls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background: var(--el-fill-color-lighter);
}

.tls-copy strong {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.tls-copy p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.password-hint {
  margin: 12px 2px 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-head {
    flex-direction: column;
    gap: 12px;
  }

  .settings-shell {
    padding: 16px;
  }
}
</style>
