import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import methodBg from '../assets/Imagenes/Rectangle 287.webp'
import { useTextReveal } from '../lib/useTextReveal'

export default function MethodSection() {
  const sectionRef = useRef(null)
  const textRef = useTextReveal()

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const bg = section.querySelector('[data-method-bg]')
      if (!bg) return

      gsap.fromTo(
        bg,
        { yPercent: -6, scale: 1.08 },
        {
          yPercent: 8,
          scale: 1.14,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden rounded-[10px] min-h-[280px] sm:min-h-[320px] sm:rounded-[20px] md:min-h-[600px] md:rounded-[28px]"
    >
      <div
        data-method-bg
        className="absolute inset-0 bg-cover bg-center scale-[1.08] will-change-transform"
        style={{ backgroundImage: `url(${methodBg})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[350px] items-center justify-center px-4 sm:min-h-[320px] sm:px-8 md:min-h-[380px] md:px-12 md:pt-16">
        <div
          ref={textRef}
          className="relative overflow-hidden rounded-[18px] border border-white/20 bg-white/12 px-5 py-5 text-center shadow-[0_-40px_130px_rgba(255,255,255,0.28),0_56px_140px_rgba(0,0,0,0.34)] backdrop-blur-[16px] sm:rounded-[22px] sm:px-8 sm:py-6 md:rounded-[28px] md:px-10 md:py-7"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.26),rgba(255,255,255,0.08)_42%,rgba(149,128,166,0.2))]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/45"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <p data-reveal className="m-0 text-[26px] font-light leading-none tracking-[-0.03em] text-[#9580A6] sm:text-[34px] md:text-[52px]">
              No fallaste vos.
            </p>
            <p data-reveal className="m-0 text-[26px] font-bold leading-none tracking-[-0.03em] text-[#9580A6] sm:text-[34px] md:text-[52px]">
              Fallo el metodo.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
