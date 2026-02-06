import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import showcaseBg from '../assets/Imagenes/30.webp'
import phoneImage from '../assets/Imagenes/CELULAR-1.webp'
import sideImage from '../assets/Imagenes/20250623.webp'

export default function ShowcaseSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section)
      const items = q('[data-reveal]')

      gsap.fromTo(
        items,
        {
          autoAlpha: 0,
          x: (index, el) => Number(el.dataset.fromX || 0),
          y: (index, el) => Number(el.dataset.fromY || 0),
          scale: 0.96,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            once: true,
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-cover bg-bottom min-h-[320px] sm:min-h-[380px] md:min-h-[760px] lg:min-h-[820px]"
      style={{ backgroundImage: `url(${showcaseBg})` }}
    >
      <div className="absolute inset-0 bg-black/15" aria-hidden="true" />
      <div className="relative z-10 h-full min-h-[320px] sm:min-h-[380px] md:min-h-[760px] lg:min-h-[820px]">
      
        <img
          src={sideImage}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          data-reveal
          data-from-x="-80"
          data-from-y="20"
          className="absolute left-[0%] bottom-[-6%] w-[500px] sm:left-[6%] sm:bottom-[-8%] sm:w-[230px] md:left-[0%] md:bottom-[-10%] md:w-[1400px]  select-none pointer-events-none drop-shadow-[0_18px_42px_rgba(0,0,0,0.25)]"
        />
        <img
          src={phoneImage}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          data-reveal
          data-from-x="80"
          data-from-y="20"
          className="absolute right-[0%] bottom-[0%] w-[400px] sm:right-[8%] sm:bottom-[-10%] sm:w-[250px] md:right-[0%] md:bottom-[-5%] md:w-[1200px] select-none pointer-events-none drop-shadow-[0_18px_42px_rgba(0,0,0,0.25)]"
        />
      </div>
    </section>
  )
}
