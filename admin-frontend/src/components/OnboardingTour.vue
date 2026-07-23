<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '@/utils/motion'

const STORAGE_KEY = 'lingtour-admin-onboarding-v1'
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const steps = [
  {
    target: '[data-tour="quick-actions"]',
    title: '快捷创建',
    body: '从这里新建路线、商品，或直接进入媒体库。',
  },
  {
    target: '[data-tour="stats"]',
    title: '实时状态',
    body: '这些卡片汇总用户、内容、预约和订单，点击即可进入对应列表。',
  },
  {
    target: '[data-tour="pending-bookings"]',
    title: '优先处理预约',
    body: '待处理预约是每天最先需要确认的服务事项。',
  },
  {
    target: '[data-tour="charts"]',
    title: '查看运营趋势',
    body: '订单趋势、服务构成和热门城市集中在这里查看。',
  },
  {
    target: '[data-tour="content-nav"]',
    title: '管理内容',
    body: '城市、路线等前台内容从左侧内容管理进入。',
  },
]

const activeIndex = ref(0)
const popover = ref<HTMLElement | null>(null)
const targetRect = ref({ top: 0, left: 0, width: 0, height: 0 })
let motionContext: gsap.Context | undefined
let updateTimer: number | undefined

const currentStep = computed(() => steps[activeIndex.value])
const isLast = computed(() => activeIndex.value === steps.length - 1)

const focusStyle = computed(() => ({
  top: `${targetRect.value.top - 6}px`,
  left: `${targetRect.value.left - 6}px`,
  width: `${targetRect.value.width + 12}px`,
  height: `${targetRect.value.height + 12}px`,
}))

const popoverStyle = computed(() => {
  const width = Math.min(360, window.innerWidth - 32)
  const estimatedHeight = 220
  const gap = 18
  const canFitBelow =
    targetRect.value.top + targetRect.value.height + gap + estimatedHeight < window.innerHeight
  const top = canFitBelow
    ? targetRect.value.top + targetRect.value.height + gap
    : Math.max(16, targetRect.value.top - estimatedHeight - gap)
  const centeredLeft = targetRect.value.left + targetRect.value.width / 2 - width / 2
  const left = Math.min(Math.max(16, centeredLeft), window.innerWidth - width - 16)
  return { top: `${top}px`, left: `${left}px`, width: `${width}px` }
})

function findTarget() {
  return document.querySelector<HTMLElement>(currentStep.value.target)
}

function updatePosition(scrollTarget = false) {
  const target = findTarget()
  if (!target) return
  if (scrollTarget) {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
  }
  window.clearTimeout(updateTimer)
  updateTimer = window.setTimeout(() => {
    const rect = target.getBoundingClientRect()
    targetRect.value = {
      top: Math.max(8, rect.top),
      left: Math.max(8, rect.left),
      width: Math.min(rect.width, window.innerWidth - 16),
      height: Math.min(rect.height, window.innerHeight - 16),
    }
    animatePopover()
  }, scrollTarget ? 260 : 0)
}

function animatePopover() {
  motionContext?.revert()
  if (!popover.value || prefersReducedMotion()) return
  motionContext = gsap.context(() => {
    gsap.fromTo(
      popover.value,
      { autoAlpha: 0, y: 10, scale: 0.98 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out', clearProps: 'transform' },
    )
  }, popover.value)
}

function finish() {
  localStorage.setItem(STORAGE_KEY, 'done')
  emit('update:modelValue', false)
}

function next() {
  if (isLast.value) {
    finish()
    return
  }
  activeIndex.value += 1
}

function previous() {
  if (activeIndex.value > 0) activeIndex.value -= 1
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.modelValue) return
  if (event.key === 'Escape') finish()
  if (event.key === 'ArrowRight') next()
  if (event.key === 'ArrowLeft') previous()
}

function handleViewportChange() {
  updatePosition()
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    activeIndex.value = 0
    await nextTick()
    updatePosition(true)
  },
)

watch(activeIndex, async () => {
  await nextTick()
  updatePosition(true)
})

onMounted(() => {
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('scroll', handleViewportChange, true)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.clearTimeout(updateTimer)
  motionContext?.revert()
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="tour-layer" role="dialog" aria-modal="true" aria-label="后台新手引导">
      <div class="tour-dim" />
      <div class="tour-focus" :style="focusStyle" />
      <section ref="popover" class="tour-popover" :style="popoverStyle">
        <header>
          <span>{{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(steps.length).padStart(2, '0') }}</span>
          <button type="button" @click="finish">跳过</button>
        </header>
        <h2>{{ currentStep.title }}</h2>
        <p>{{ currentStep.body }}</p>
        <footer>
          <button type="button" class="tour-button tour-button--ghost" :disabled="activeIndex === 0" @click="previous">
            上一步
          </button>
          <button type="button" class="tour-button tour-button--primary" @click="next">
            {{ isLast ? '完成' : '下一步' }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.tour-layer {
  position: fixed;
  inset: 0;
  z-index: 5000;
  pointer-events: none;
}

.tour-dim {
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: auto;
}

.tour-focus {
  position: fixed;
  z-index: 1;
  border: 2px solid #d7ad68;
  border-radius: 16px;
  background: transparent;
  box-shadow: 0 0 0 9999px rgba(8, 19, 16, 0.68), 0 0 0 6px rgba(215, 173, 104, 0.18);
  pointer-events: none;
  transition: inset 240ms ease, width 240ms ease, height 240ms ease;
}

.tour-popover {
  position: fixed;
  z-index: 2;
  padding: 22px;
  border: 1px solid rgba(23, 55, 47, 0.12);
  border-radius: 20px;
  background: #f7f3e9;
  color: #17372f;
  box-shadow: 0 24px 70px rgba(4, 14, 11, 0.28);
  pointer-events: auto;
}

.tour-popover header,
.tour-popover footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tour-popover header span {
  color: #9c7334;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.12em;
}

.tour-popover header button {
  border: 0;
  background: transparent;
  color: #60736c;
  cursor: pointer;
  font-size: 12px;
}

.tour-popover h2 {
  margin: 22px 0 8px;
  font-size: 23px;
  letter-spacing: -0.03em;
}

.tour-popover p {
  margin: 0;
  color: #60736c;
  font-size: 13px;
  line-height: 1.7;
}

.tour-popover footer {
  justify-content: flex-end;
  margin-top: 24px;
}

.tour-button {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 11px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 650;
}

.tour-button--ghost {
  border: 1px solid rgba(23, 55, 47, 0.14);
  background: transparent;
  color: #17372f;
}

.tour-button--ghost:disabled {
  cursor: default;
  opacity: 0.35;
}

.tour-button--primary {
  border: 1px solid #17372f;
  background: #17372f;
  color: #fff;
}

@media (prefers-reduced-motion: reduce) {
  .tour-focus {
    transition: none;
  }
}
</style>
