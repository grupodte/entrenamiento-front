import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type UseTextRevealOptions = {
  selector?: string
  start?: string
  y?: number
  blur?: number
}

export function useTextReveal(options: UseTextRevealOptions = {}) {
  const {
    selector = '[data-reveal]',
    start = 'top 82%',
    y = 28,
    blur = 6,
  } = options

  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const section = ref.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section)
      const items = q(selector)
      if (!items.length) return

      gsap.set(items, { autoAlpha: 0, y, filter: `blur(${blur}px)` })

      ScrollTrigger.batch(items, {
        start,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.72,
            stagger: 0.1,
            ease: 'power3.out',
            overwrite: true,
          })
        },
        onEnterBack: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.62,
            stagger: 0.08,
            ease: 'power3.out',
            overwrite: true,
          })
        },
        onLeaveBack: (batch) => {
          gsap.set(batch, { autoAlpha: 0, y, filter: `blur(${blur}px)` })
        },
      })
    }, section)

    return () => ctx.revert()
  }, [blur, selector, start, y])

  return ref
}
