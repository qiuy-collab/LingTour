<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { UserFilled, Lock, Right } from '@element-plus/icons-vue'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '@/utils/motion'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loginRoot = ref<HTMLElement>()
const loading = ref(false)
let motionContext: gsap.Context | undefined

const form = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    ElMessage.success('登录成功')
    // 登录后跳回原页面或默认 dashboard
    const redirect = (route.query.redirect as string) || '/admin/dashboard'
    router.push(redirect)
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '登录失败,请检查邮箱和密码')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!loginRoot.value || prefersReducedMotion()) return

  motionContext = gsap.context(() => {
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    timeline
      .from('.login-brand', { autoAlpha: 0, y: -14, duration: 0.45 })
      .from('.story-copy > *', { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.08 }, '-=0.18')
      .from('.login-card', { autoAlpha: 0, x: 24, duration: 0.58 }, '-=0.5')
  }, loginRoot.value)
})

onUnmounted(() => motionContext?.revert())
</script>

<template>
  <main ref="loginRoot" class="login-container">
    <section class="login-story" aria-labelledby="login-story-title">
      <div class="login-brand">
        <span class="brand-mark" aria-hidden="true">LT</span>
        <span>
          <strong>LingTour</strong>
          <small>Field operations</small>
        </span>
      </div>

      <div class="story-copy">
        <div class="environment-pill">
          <span class="status-dot" />
          Production workspace
        </div>
        <p class="story-eyebrow">城市文化旅行的内容中枢</p>
        <h1 id="login-story-title">把灵感、服务与交易，<br />整理成同一段旅程。</h1>
        <p class="story-lead">
          在一个安静、清晰的工作台中维护城市、路线、商品、视频媒体与口译服务。
        </p>
      </div>

      <div class="story-footer" aria-hidden="true">
        <span>CONTENT</span>
        <i />
        <span>COMMERCE</span>
        <i />
        <span>SERVICE</span>
      </div>
    </section>

    <section class="login-panel" aria-label="后台登录">
      <div class="login-card">
        <div class="login-header">
          <p>LINGTOUR ADMIN</p>
          <h2>欢迎回来</h2>
          <span>登录后继续管理线上产品内容与运营工作流。</span>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="email" label="邮箱">
            <el-input
              v-model="form.email"
              placeholder="请输入管理邮箱"
              :prefix-icon="UserFilled"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="password" label="密码">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              size="large"
              class="login-btn"
              @click="handleLogin"
            >
              <span>进入工作台</span>
              <el-icon><Right /></el-icon>
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-meta">
          <span><i class="status-dot" />线上接口已连接</span>
          <small>Secure editorial access</small>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-container {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(420px, 0.65fr);
  min-height: 100dvh;
  background: #13241d;
}

.login-story {
  position: relative;
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: clamp(28px, 4vw, 64px);
  background:
    radial-gradient(circle at 78% 18%, rgba(125, 196, 174, 0.16), transparent 18rem),
    radial-gradient(circle at 18% 92%, rgba(196, 138, 54, 0.13), transparent 22rem),
    linear-gradient(145deg, #183229 0%, #10211a 58%, #0d1814 100%);
  color: #eff6f2;
}

.login-story::after {
  position: absolute;
  top: 12%;
  right: -18vw;
  width: min(60vw, 740px);
  aspect-ratio: 1;
  border: 1px solid rgba(236, 246, 240, 0.08);
  border-radius: 50%;
  box-shadow:
    0 0 0 80px rgba(236, 246, 240, 0.018),
    0 0 0 170px rgba(236, 246, 240, 0.012);
  content: '';
  pointer-events: none;
}

.login-brand {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 13px;
}

.brand-mark {
  display: inline-flex;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.07);
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0.08em;
}

.login-brand > span:last-child {
  display: grid;
}

.login-brand strong {
  font-size: 18px;
  letter-spacing: -0.025em;
}

.login-brand small {
  margin-top: 3px;
  color: rgba(229, 241, 234, 0.52);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.17em;
  text-transform: uppercase;
}

.story-copy {
  position: relative;
  z-index: 1;
  max-width: 820px;
  margin-block: clamp(80px, 15vh, 180px);
}

.environment-pill {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.045);
  color: rgba(229, 241, 234, 0.68);
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #80d8a7;
  box-shadow: 0 0 0 4px rgba(128, 216, 167, 0.12);
}

.story-eyebrow {
  margin: clamp(34px, 6vh, 64px) 0 14px;
  color: #d2a660;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.story-copy h1 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(42px, 5vw, 76px);
  font-weight: 520;
  letter-spacing: -0.055em;
  line-height: 1.08;
}

.story-lead {
  max-width: 620px;
  margin: 26px 0 0;
  color: rgba(229, 241, 234, 0.62);
  font-size: clamp(14px, 1.15vw, 17px);
  line-height: 1.85;
}

.story-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(229, 241, 234, 0.32);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.story-footer i {
  width: 24px;
  height: 1px;
  background: rgba(229, 241, 234, 0.18);
}

.login-panel {
  display: flex;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: clamp(28px, 4vw, 64px);
  background: var(--lt-bg-page);
}

.login-card {
  width: min(100%, 430px);
  padding: clamp(28px, 4vw, 48px);
  border: 1px solid var(--lt-border-light);
  border-radius: 24px;
  background: var(--lt-bg-card);
  box-shadow: var(--lt-shadow-lg);
}

.login-header {
  margin-bottom: 34px;
}

.login-header p {
  margin: 0 0 14px;
  color: var(--lt-primary);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.15em;
}

.login-header h2 {
  margin: 0;
  color: var(--lt-text-primary);
  font-size: clamp(30px, 3vw, 38px);
  font-weight: 660;
  letter-spacing: -0.045em;
}

.login-header > span {
  display: block;
  margin-top: 12px;
  color: var(--lt-text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

.login-btn {
  width: 100%;
  min-height: 48px;
  justify-content: space-between;
  margin-top: 8px;
  padding-inline: 18px;
  border-radius: 13px;
}

.login-card :deep(.el-form-item__label) {
  padding-bottom: 8px;
  color: var(--lt-text-primary);
  font-size: 12px;
  font-weight: 650;
}

.login-card :deep(.el-input__wrapper) {
  min-height: 48px;
  padding-inline: 14px;
  background: color-mix(in srgb, var(--lt-bg-hover) 60%, var(--lt-bg-card));
  box-shadow: 0 0 0 1px var(--lt-border-light) inset;
}

.login-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid var(--lt-border-lighter);
  color: var(--lt-text-secondary);
  font-size: 10px;
}

.login-meta span {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.login-meta small {
  color: var(--lt-text-placeholder);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

@media (max-width: 980px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-story {
    min-height: auto;
    padding: 24px;
  }

  .story-copy {
    margin: 60px 0 40px;
  }

  .story-copy h1 {
    max-width: 640px;
    font-size: clamp(38px, 8vw, 58px);
  }

  .story-footer {
    display: none;
  }

  .login-panel {
    min-height: auto;
    padding: 28px 18px 42px;
    background: #13241d;
  }

  .login-card {
    width: min(100%, 560px);
  }
}

@media (max-width: 560px) {
  .story-copy {
    margin: 46px 0 18px;
  }

  .environment-pill,
  .story-lead {
    display: none;
  }

  .story-eyebrow {
    margin-top: 0;
  }

  .story-copy h1 {
    font-size: 34px;
    line-height: 1.14;
  }

  .login-card {
    padding: 26px 22px;
    border-radius: 20px;
  }

  .login-meta small {
    display: none;
  }
}
</style>
