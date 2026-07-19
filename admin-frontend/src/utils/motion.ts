import { gsap } from 'gsap'

export const adminMotion = {
  enter: 0.42,
  exit: 0.16,
  ease: 'power3.out',
} as const

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function animateRouteEnter(element: Element, done: () => void) {
  const target = element as HTMLElement
  gsap.killTweensOf(target)

  if (prefersReducedMotion()) {
    gsap.set(target, { clearProps: 'all' })
    done()
    return
  }

  gsap.fromTo(
    target,
    { autoAlpha: 0, y: 14 },
    {
      autoAlpha: 1,
      y: 0,
      duration: adminMotion.enter,
      ease: adminMotion.ease,
      clearProps: 'transform,opacity,visibility',
      onComplete: done,
    },
  )
}

export function animateRouteLeave(element: Element, done: () => void) {
  const target = element as HTMLElement
  gsap.killTweensOf(target)

  if (prefersReducedMotion()) {
    done()
    return
  }

  gsap.to(target, {
    autoAlpha: 0,
    y: -6,
    duration: adminMotion.exit,
    ease: 'power2.in',
    onComplete: done,
  })
}
