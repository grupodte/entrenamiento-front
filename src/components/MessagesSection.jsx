import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from 'react-i18next'
import messagesBg from '../assets/Imagenes/mensajes reakes/image 297.webp'
import msg287 from '../assets/Imagenes/mensajes reakes/image 287.webp'
import msg288 from '../assets/Imagenes/mensajes reakes/image 288.webp'
import msg289 from '../assets/Imagenes/mensajes reakes/image 289.webp'
import msg290 from '../assets/Imagenes/mensajes reakes/image 290.webp'
import msg291 from '../assets/Imagenes/mensajes reakes/image 291.webp'
import msg292 from '../assets/Imagenes/mensajes reakes/image 292.webp'
import msg293 from '../assets/Imagenes/mensajes reakes/image 293.webp'
import heart298 from '../assets/Imagenes/mensajes reakes/image 298.webp'
import heart299 from '../assets/Imagenes/mensajes reakes/image 299.webp'
import heart300 from '../assets/Imagenes/mensajes reakes/image 300.webp'

const messageItems = [
  {
    src: msg287,
    altIndex: 1,
    className: 'left-[4%] top-[18%] w-[210px] sm:left-[6%] sm:top-[8%] sm:w-[210px] md:w-[400px]',
    x: -28,
    y: -32,
    rotate: -2,
    zIndex: 12,
  },
  {
    src: msg288,
    altIndex: 2,
    className: 'right-[4%] top-[5%] w-[200px] sm:right-[10%] sm:top-[10%] sm:w-[200px] md:w-[380px]',
    x: 24,
    y: -26,
    rotate: 2,
    zIndex: 12,
  },
  {
    src: msg289,
    altIndex: 3,
    className: 'right-[4%] top-[30%] w-[200px] sm:left-[6%] sm:top-[36%] sm:w-[200px] md:w-[300px]',
    x: -18,
    y: 20,
    rotate: -1,
    zIndex: 11,
  },
  {
    src: msg290,
    altIndex: 4,
    className: 'right-[40%] top-[44%] w-[200px] sm:right-auto sm:left-[40%] sm:top-[40%] sm:w-[250px] md:w-[330px]',
    x: 16,
    y: -24,
    rotate: 1,
    zIndex: 10,
  },
  {
    src: msg291,
    altIndex: 5,
    className: 'left-[18%] top-[50%] w-[200px] sm:left-auto sm:right-[6%] sm:top-[36%] sm:w-[230px] md:w-[280px]',
    x: 20,
    y: 22,
    rotate: -1.5,
    zIndex: 11,
  },
  {
    src: msg292,
    altIndex: 6,
    className: 'left-[8%] bottom-[14%] w-[200px] sm:left-[22%] sm:bottom-[10%] sm:w-[220px] md:w-[300px]',
    x: -20,
    y: 28,
    rotate: 2,
    zIndex: 12,
  },
  {
    src: msg293,
    altIndex: 7,
    className: 'right-[8%] bottom-[8%] w-[155px] sm:right-[10%] sm:bottom-[0%] sm:w-[210px] md:w-[300px]',
    x: 22,
    y: 30,
    rotate: -2,
    zIndex: 12,
  },
  {
    src: heart298,
    alt: '',
    decorative: true,
    className: 'right-[10%] top-[-5%] w-[60px] sm:right-[18%] sm:top-[-4%] sm:w-[72px] md:w-[90px]',
    x: 14,
    y: -22,
    rotate: 50,
    zIndex: 20,
  },
  {
    src: heart299,
    alt: '',
    decorative: true,
    className: 'left-[6%] bottom-[4%] w-[80px] sm:left-[10%] sm:bottom-[6%] sm:w-[80px] md:w-[96px]',
    x: -12,
    y: 18,
    rotate: -6,
    zIndex: 20,
  },
  {
    src: heart300,
    alt: '',
    decorative: true,
    className: 'right-[36%] bottom-[24%] w-[60px] sm:right-[30%] sm:bottom-[22%] sm:w-[52px] md:w-[120px]',
    x: 10,
    y: 16,
    rotate: -120,
    zIndex: 20,
  },
  {
    src: heart298,
    alt: '',
    decorative: true,
    className: 'left-[8%] top-[25%] w-[100px] sm:left-[12%] sm:top-[20%] sm:w-[60px] md:w-[100px]',
    x: -10,
    y: 18,
    rotate: -4,
    zIndex: 18,
  },
  {
    src: heart299,
    alt: '',
    decorative: true,
    className: 'right-[6%] top-[56%] w-[80px] sm:right-[8%] sm:top-[54%] sm:w-[58px] md:w-[120px]',
    x: 12,
    y: -10,
    rotate: 5,
    zIndex: 18,
  },
  {
    src: heart300,
    alt: '',
    decorative: true,
    className: 'right-[0%] top-[90%] w-[99px] sm:left-[46%] sm:top-[68%] sm:w-[50px] md:w-[150px]',
    x: 8,
    y: 12,
    rotate: -6,
    zIndex: 18,
  },
]

export default function MessagesSection() {
  const { t } = useTranslation()
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section)
      const items = q('[data-parallax]')
      const title = q('[data-title]')

      gsap.fromTo(
        title,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true,
          },
        }
      )

      gsap.fromTo(
        items,
        { autoAlpha: 0, scale: 0.94 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            once: true,
          },
        }
      )

      items.forEach((item) => {
        const x = Number(item.dataset.x || 0)
        const y = Number(item.dataset.y || 0)
        const rotate = Number(item.dataset.rotate || 0)

        gsap.to(item, {
          x,
          y,
          rotate,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 15%',
            scrub: true,
          },
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden rounded-[10px] sm:rounded-[20px] md:rounded-[28px] px-4 sm:px-8 md:px-12 py-10 sm:py-12 md:py-16 min-h-[520px] sm:min-h-[580px] md:min-h-[640px] bg-cover bg-center"
      style={{
        backgroundImage: `url(${messagesBg})`,
      }}
    >
      <div className="relative z-10 flex flex-col items-center text-center">
        <h2
          data-title
          className="m-0 text-[26px] sm:text-[32px] md:text-[40px] font-bold leading-none"
        >
          <span className="block text-[#2f1a3a]">{t('messages.titleLineOne')}</span>
          <span className="block text-white">{t('messages.titleLineTwo')}</span>
        </h2>
      </div>

      <div className="relative mt-8 sm:mt-10 md:mt-12 min-h-[500px] sm:min-h-[420px] md:min-h-[480px]">
        {messageItems.map((item, index) => {
          const altText = item.decorative
            ? ''
            : t('messages.realMessageAlt', { index: item.altIndex })

          return (
            <img
              key={`${item.src}-${index}`}
              src={item.src}
              alt={altText}
              loading="lazy"
              data-parallax
              data-x={item.x}
              data-y={item.y}
              data-rotate={item.rotate}
              aria-hidden={item.decorative ? 'true' : undefined}
              style={{ zIndex: item.zIndex }}
              className={`absolute select-none pointer-events-none drop-shadow-[0_12px_32px_rgba(0,0,0,0.18)] ${item.className}`}
            />
          )
        })}
      </div>
    </section>
  )
}
