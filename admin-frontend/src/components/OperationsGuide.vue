<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Close, QuestionFilled } from '@element-plus/icons-vue'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '@/utils/motion'

const STORAGE_KEY = 'lingtour-admin-guide-collapsed'
const router = useRouter()
const root = ref<HTMLElement | null>(null)
const expanded = ref(localStorage.getItem(STORAGE_KEY) !== 'true')
let motionContext: ReturnType<typeof gsap.context> | null = null

const steps = [
  {
    number: '01',
    title: '准备媒体',
    description: '先上传图片与视频，编辑内容时直接从媒体库选择。',
    action: '打开媒体库',
    path: '/admin/media',
  },
  {
    number: '02',
    title: '编辑内容',
    description: '填写中英文内容并关联城市、路线、商品或服务。',
    action: '管理城市',
    path: '/admin/cities',
  },
  {
    number: '03',
    title: '预览确认',
    description: '保存前预览桌面与手机效果，检查图片、视频和排版。',
    action: '管理路线',
    path: '/admin/routes',
  },
  {
    number: '04',
    title: '发布检查',
    description: '发布后运行数据体检，确认线上页面和媒体文件可访问。',
    action: '开始体检',
    path: '/admin/operations/audit',
  },
]

function setExpanded(value: boolean) {
  expanded.value = value
  localStorage.setItem(STORAGE_KEY, String(!value))
}

watch(expanded, async (value) => {
  motionContext?.revert()
  if (!value || prefersReducedMotion()) return
  await nextTick()
  if (!root.value) return
  motionContext = gsap.context(() => {
    gsap.fromTo(
      '[data-guide-step]',
      { autoAlpha: 0, y: 8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.32,
        stagger: 0.045,
        ease: 'power2.out',
        clearProps: 'all',
      },
    )
  }, root.value)
})

onBeforeUnmount(() => motionContext?.revert())
</script>

<template>
  <section ref="root" class="operations-guide" aria-label="后台操作指引">
    <header class="guide-header">
      <div>
        <el-icon><QuestionFilled /></el-icon>
        <span>操作指引</span>
        <small>媒体 → 编辑 → 预览 → 发布检查</small>
      </div>
      <button
        type="button"
        class="guide-toggle"
        :aria-expanded="expanded"
        @click="setExpanded(!expanded)"
      >
        <template v-if="expanded"><el-icon><Close /></el-icon> 收起</template>
        <template v-else>展开指引 <el-icon><ArrowRight /></el-icon></template>
      </button>
    </header>

    <div v-if="expanded" class="guide-steps">
      <button
        v-for="step in steps"
        :key="step.number"
        type="button"
        class="guide-step"
        data-guide-step
        @click="router.push(step.path)"
      >
        <span class="guide-number">{{ step.number }}</span>
        <span class="guide-copy">
          <strong>{{ step.title }}</strong>
          <small>{{ step.description }}</small>
          <em>{{ step.action }} <el-icon><ArrowRight /></el-icon></em>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.operations-guide {
  margin-bottom: 18px;
  overflow: hidden;
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-xl);
  background: var(--lt-bg-card);
}

.guide-header {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
}

.guide-header > div {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  color: var(--lt-text-primary);
}

.guide-header > div > .el-icon {
  color: var(--lt-primary);
}

.guide-header span {
  flex: 0 0 auto;
  font-weight: 650;
}

.guide-header small {
  overflow: hidden;
  color: var(--lt-text-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.guide-toggle {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--lt-primary);
  cursor: pointer;
  font-size: 12px;
}

.guide-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--lt-border-light);
}

.guide-step {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 11px;
  min-width: 0;
  padding: 16px;
  border: 0;
  border-right: 1px solid var(--lt-border-light);
  background: transparent;
  color: var(--lt-text-primary);
  text-align: left;
  cursor: pointer;
  transition: background-color 180ms ease;
}

.guide-step:last-child {
  border-right: 0;
}

.guide-step:hover {
  background: var(--lt-bg-hover);
}

.guide-number {
  color: var(--lt-primary);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
}

.guide-copy {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.guide-copy strong {
  font-size: 13px;
}

.guide-copy small {
  color: var(--lt-text-secondary);
  font-size: 11px;
  line-height: 1.55;
}

.guide-copy em {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--lt-primary);
  font-size: 11px;
  font-style: normal;
  font-weight: 650;
}

@media (max-width: 1080px) {
  .guide-steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .guide-step:nth-child(2) {
    border-right: 0;
  }

  .guide-step:nth-child(-n + 2) {
    border-bottom: 1px solid var(--lt-border-light);
  }
}

@media (max-width: 640px) {
  .guide-header small {
    display: none;
  }

  .guide-steps {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
  }

  .guide-step {
    min-width: min(82vw, 290px);
    border-right: 1px solid var(--lt-border-light) !important;
    border-bottom: 0 !important;
    scroll-snap-align: start;
  }
}
</style>
