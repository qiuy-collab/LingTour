<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { gsap } from 'gsap'
import { ADMIN_ONBOARDING_STEPS } from '@/constants/onboarding'
import { prefersReducedMotion } from '@/utils/motion'

const props = defineProps<{ modelValue: boolean; storageKey: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const router = useRouter()
const route = useRoute()
const activeIndex = ref(0)
const activating = ref(false)
const targetReady = ref(false)
const popover = ref<HTMLElement | null>(null)
const targetRect = ref({ top: 0, left: 0, width: 0, height: 0 })
const popoverPosition = ref({ top: 16, left: 16, width: 360 })
let currentTarget: HTMLElement | null = null
let motionContext: gsap.Context | undefined
let targetObserver: ResizeObserver | null = null
let popoverObserver: ResizeObserver | null = null
let updateFrame = 0
let activationId = 0
let restoreFocusTo: HTMLElement | null = null

const steps = ADMIN_ONBOARDING_STEPS
const currentStep = computed(() => steps[activeIndex.value])
const isLast = computed(() => activeIndex.value === steps.length - 1)
const focusStyle = computed(() => ({
  top: `${targetRect.value.top - 6}px`,
  left: `${targetRect.value.left - 6}px`,
  width: `${targetRect.value.width + 12}px`,
  height: `${targetRect.value.height + 12}px`,
}))
const popoverStyle = computed(() => ({
  top: `${popoverPosition.value.top}px`,
  left: `${popoverPosition.value.left}px`,
  width: `${popoverPosition.value.width}px`,
}))

function nextFrame() {
  return new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }
    requestAnimationFrame(finish)
    window.setTimeout(finish, 80)
  })
}

function safePersist() {
  if (!props.storageKey) return
  try {
    localStorage.setItem(props.storageKey, 'done')
  } catch {
    // The tour remains usable when storage is unavailable.
  }
}

function resolveTargetSelector() {
  const step = currentStep.value
  return window.innerWidth <= 768 && step.mobileTarget ? step.mobileTarget : step.target
}

function isRenderableTarget(element: HTMLElement) {
  if (!element.isConnected || element.getClientRects().length === 0) return false
  const style = getComputedStyle(element)
  const rect = element.getBoundingClientRect()
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
}

function measurePosition() {
  if (!currentTarget || !isRenderableTarget(currentTarget)) return
  const rect = currentTarget.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const clippedTop = Math.max(8, rect.top)
  const clippedLeft = Math.max(8, rect.left)
  const clippedRight = Math.min(viewportWidth - 8, rect.right)
  const clippedBottom = Math.min(viewportHeight - 8, rect.bottom)
  targetRect.value = {
    top: clippedTop,
    left: clippedLeft,
    width: Math.max(1, clippedRight - clippedLeft),
    height: Math.max(1, clippedBottom - clippedTop),
  }

  const width = Math.min(360, viewportWidth - 32)
  const height = popover.value?.getBoundingClientRect().height || 0
  const gap = 18
  const below = rect.bottom + gap
  const above = rect.top - height - gap
  const top = below + height <= viewportHeight - 16
    ? below
    : above >= 16
      ? above
      : 16
  const centeredLeft = rect.left + rect.width / 2 - width / 2
  popoverPosition.value = {
    top: Math.min(Math.max(16, top), Math.max(16, viewportHeight - height - 16)),
    left: Math.min(Math.max(16, centeredLeft), viewportWidth - width - 16),
    width,
  }
}

function scheduleMeasure() {
  cancelAnimationFrame(updateFrame)
  updateFrame = requestAnimationFrame(measurePosition)
}

function observeCurrentElements() {
  targetObserver?.disconnect()
  popoverObserver?.disconnect()
  if (typeof ResizeObserver === 'undefined') return
  targetObserver = new ResizeObserver(scheduleMeasure)
  popoverObserver = new ResizeObserver(scheduleMeasure)
  if (currentTarget) targetObserver.observe(currentTarget)
  if (popover.value) popoverObserver.observe(popover.value)
}

function animatePopover() {
  motionContext?.revert()
  if (!popover.value || prefersReducedMotion()) return
  motionContext = gsap.context(() => {
    gsap.fromTo(
      popover.value,
      { autoAlpha: 0, y: 10, scale: 0.98 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
    )
  }, popover.value)
}

async function findStepTarget(token: number) {
  const selector = resolveTargetSelector()
  for (let attempt = 0; attempt < 25; attempt += 1) {
    if (token !== activationId) return null
    const target = document.querySelector<HTMLElement>(selector)
    if (target && isRenderableTarget(target)) return target
    await nextFrame()
  }
  return null
}

async function activateStep(index: number, direction: 1 | -1 = 1, visited = new Set<number>()) {
  if (!props.modelValue || visited.has(index) || index < 0 || index >= steps.length) {
    if (visited.size >= steps.length) closeTour(false, true)
    return
  }
  visited.add(index)
  const token = ++activationId
  activating.value = true
  targetReady.value = false
  activeIndex.value = index
  const step = steps[index]

  if (step.routeName && route.name !== step.routeName) {
    await router.push({ name: step.routeName })
  }
  await nextTick()
  await nextFrame()
  await nextFrame()
  if (token !== activationId) return

  let target = await findStepTarget(token)
  if (target && token === activationId) {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await nextFrame()
      if (token !== activationId) return
      const rect = target.getBoundingClientRect()
      if (rect.bottom > 0 && rect.top < window.innerHeight) break
    }
    target = isRenderableTarget(target) ? target : null
  }

  if (!target) {
    const nextIndex = index + direction
    if (nextIndex >= 0 && nextIndex < steps.length) {
      await activateStep(nextIndex, direction, visited)
    } else {
      closeTour(false, true)
    }
    return
  }

  currentTarget = target
  targetReady.value = true
  await nextTick()
  measurePosition()
  observeCurrentElements()
  animatePopover()
  activating.value = false
  await nextTick()
  await nextFrame()
  const initialFocus =
    popover.value?.querySelector<HTMLElement>('.tour-button--primary:not(:disabled)') ??
    popover.value?.querySelector<HTMLElement>('button:not(:disabled)')
  initialFocus?.focus({ preventScroll: true })
}

function restoreFocus() {
  const fallback = document.querySelector<HTMLElement>('[data-tour="help-menu"]')
  const target = restoreFocusTo?.isConnected ? restoreFocusTo : fallback
  target?.focus()
  restoreFocusTo = null
}

function closeTour(persist = true, noTargets = false) {
  activationId += 1
  activating.value = false
  targetReady.value = false
  currentTarget = null
  targetObserver?.disconnect()
  popoverObserver?.disconnect()
  motionContext?.revert()
  if (persist) safePersist()
  emit('update:modelValue', false)
  nextTick(restoreFocus)
  if (noTargets) ElMessage.info('当前页面暂无可展示的引导内容')
}

function next() {
  if (activating.value) return
  if (isLast.value) closeTour()
  else activateStep(activeIndex.value + 1, 1)
}

function previous() {
  if (!activating.value && activeIndex.value > 0) activateStep(activeIndex.value - 1, -1)
}

function focusableElements() {
  if (!popover.value) return []
  return Array.from(
    popover.value.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'),
  ).filter((element) => element.getClientRects().length > 0)
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.modelValue) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeTour()
    return
  }
  if (event.key === 'Tab') {
    const focusable = focusableElements()
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
    return
  }
  const interactive = event.target instanceof HTMLElement && event.target.matches('input, textarea, select, [contenteditable="true"]')
  if (interactive) return
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    next()
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    previous()
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      activationId += 1
      activating.value = false
      targetReady.value = false
      currentTarget = null
      targetObserver?.disconnect()
      popoverObserver?.disconnect()
      motionContext?.revert()
      return
    }
    const activeElement = document.activeElement
    restoreFocusTo = activeElement instanceof HTMLElement && activeElement !== document.body
      ? activeElement
      : null
    await activateStep(0, 1)
  },
)

onMounted(() => {
  window.addEventListener('resize', scheduleMeasure)
  window.addEventListener('scroll', scheduleMeasure, true)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  activationId += 1
  cancelAnimationFrame(updateFrame)
  motionContext?.revert()
  targetObserver?.disconnect()
  popoverObserver?.disconnect()
  window.removeEventListener('resize', scheduleMeasure)
  window.removeEventListener('scroll', scheduleMeasure, true)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="tour-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      <div class="tour-dim" />
      <div v-if="targetReady" class="tour-focus" :style="focusStyle" />
      <section v-if="targetReady" ref="popover" class="tour-popover" :style="popoverStyle" tabindex="-1">
        <header>
          <span aria-live="polite">{{ activeIndex + 1 }} / {{ steps.length }}</span>
          <button type="button" @click="closeTour()">跳过</button>
        </header>
        <h2 id="onboarding-title">{{ currentStep.title }}</h2>
        <p id="onboarding-description">{{ currentStep.body }}</p>
        <footer>
          <button
            type="button"
            class="tour-button tour-button--ghost"
            :disabled="activeIndex === 0 || activating"
            @click="previous"
          >
            上一步
          </button>
          <button
            type="button"
            class="tour-button tour-button--primary"
            :disabled="activating"
            @click="next"
          >
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
  z-index: var(--lt-z-onboarding);
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
  border: 2px solid var(--lt-accent);
  border-radius: var(--lt-radius-lg);
  background: transparent;
  box-shadow: 0 0 0 9999px var(--lt-bg-mask), 0 0 0 6px var(--lt-accent-soft);
  pointer-events: none;
}

.tour-popover {
  position: fixed;
  z-index: 2;
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  padding: 22px;
  border: 1px solid var(--lt-border-light);
  border-radius: var(--lt-radius-xl);
  background: var(--lt-bg-card);
  color: var(--lt-text-primary);
  box-shadow: var(--lt-shadow-lg);
  pointer-events: auto;
  outline: none;
}

.tour-popover header,
.tour-popover footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tour-popover header span {
  color: var(--lt-accent);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.12em;
}

.tour-popover header button {
  border: 0;
  background: transparent;
  color: var(--lt-text-secondary);
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
  color: var(--lt-text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

.tour-popover footer {
  justify-content: flex-end;
  margin-top: 24px;
}

.tour-button {
  min-height: 44px;
  padding: 0 16px;
  border-radius: var(--lt-radius-md);
  cursor: pointer;
  font-size: 12px;
  font-weight: 650;
}

.tour-button--ghost {
  border: 1px solid var(--lt-border-color);
  background: transparent;
  color: var(--lt-text-primary);
}

.tour-button:disabled {
  cursor: default;
  opacity: 0.35;
}

.tour-button--primary {
  border: 1px solid var(--lt-primary-dark);
  background: var(--lt-primary-dark);
  color: var(--lt-text-inverse);
}

@media (prefers-reduced-motion: reduce) {
  .tour-focus { transition: none; }
}
</style>
