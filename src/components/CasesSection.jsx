import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import hAntes from '../assets/Imagenes/casosreales/h-antes.webp'
import hDespues from '../assets/Imagenes/casosreales/h-despues.webp'
import mAntes from '../assets/Imagenes/casosreales/m-antes.webp'
import mDespues from '../assets/Imagenes/casosreales/m-despues.webp'

const caseItems = [
  {
    key: 'quique',
    before: hAntes,
    after: hDespues,
  },
  {
    key: 'maria',
    before: mAntes,
    after: mDespues,
  },
]

export default function CasesSection() {
  const { t } = useTranslation()
  const beforeLabel = t('cases.beforeLabel')
  const afterLabel = t('cases.afterLabel')
  const scrollRef = useRef(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isMobile = window.matchMedia('(max-width: 767px)')

    if (prefersReducedMotion.matches || !isMobile.matches) return

    let rafId = 0
    let lastTime = 0
    let direction = 1
    let paused = false
    let resumeTimeoutId = 0

    const speed = 0.03

    const tick = (time) => {
      if (!lastTime) lastTime = time
      const delta = time - lastTime
      lastTime = time

      if (!paused) {
        const maxScroll = container.scrollWidth - container.clientWidth
        if (maxScroll > 0) {
          container.scrollLeft += direction * delta * speed

          if (container.scrollLeft <= 0) {
            container.scrollLeft = 0
            direction = 1
          } else if (container.scrollLeft >= maxScroll) {
            container.scrollLeft = maxScroll
            direction = -1
          }
        }
      }

      rafId = window.requestAnimationFrame(tick)
    }

    const pauseAutoScroll = () => {
      paused = true
      lastTime = 0
      window.clearTimeout(resumeTimeoutId)
      resumeTimeoutId = window.setTimeout(() => {
        paused = false
      }, 1800)
    }

    rafId = window.requestAnimationFrame(tick)
    container.addEventListener('pointerdown', pauseAutoScroll, { passive: true })
    container.addEventListener('touchstart', pauseAutoScroll, { passive: true })
    container.addEventListener('wheel', pauseAutoScroll, { passive: true })

    return () => {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(resumeTimeoutId)
      container.removeEventListener('pointerdown', pauseAutoScroll)
      container.removeEventListener('touchstart', pauseAutoScroll)
      container.removeEventListener('wheel', pauseAutoScroll)
    }
  }, [])

  return (
    <section
      className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] px-4 sm:px-8 md:px-12 py-6 sm:py-8 md:py-10"
    >
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible md:pb-0"
      >
        {caseItems.map((caseItem) => {
          const name = t(`cases.items.${caseItem.key}.name`)
          const result = t(`cases.items.${caseItem.key}.result`)

          return (
            <div
              key={caseItem.key}
              className="relative grid w-[85vw] max-w-[520px] shrink-0 snap-start grid-cols-2 gap-3 pt-6 md:w-auto md:max-w-none md:pt-0"
            >
              <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-[#ff1a1a] px-3 py-1 text-[11px] sm:text-[12px] font-bold uppercase tracking-wide text-black  md:-top-3">
                {result}
              </span>
              <img
                src={caseItem.before}
                alt={t('cases.imageAlt', { name, phase: beforeLabel })}
                loading="lazy"
                decoding="async"
                className="w-full aspect-[3/4] rounded-[5px] object-cover "
              />
              <img
                src={caseItem.after}
                alt={t('cases.imageAlt', { name, phase: afterLabel })}
                loading="lazy"
                decoding="async"
                className="w-full aspect-[3/4] rounded-[5px] object-cover "
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
