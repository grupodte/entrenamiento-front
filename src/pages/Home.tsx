import { useContext, useEffect, useRef } from 'react'
import MessagesSection from '../components/MessagesSection.jsx'
import MethodSection from '../components/MethodSection.jsx'
import CasesSection from '../components/CasesSection.jsx'
import WhySection from '../components/WhySection'
import StepsSection from '../components/StepsSection'
import PlansSection from '../components/PlansSection'
import FAQSection from '../components/FAQSection'
import { HomePhaseContext } from '../layouts/MainLayout'
import { useTextReveal } from '../lib/useTextReveal'
import forWhoBg from '../assets/Imagenes/SECCION - 1.webp'

const forWhoItems = [
  'Querés bajar grasa corporal de forma sostenible, no con dietas de 30 días que no duran.',
  'Querés ganar masa muscular con un plan real, no una rutina de YouTube.',
  'Tenés poco tiempo y necesitás que cada entrenamiento valga.',
  'Ya probaste cosas por tu cuenta y no funcionaron como esperabas.',
  'Querés aprender a comer bien sin restricciones absurdas.',
  'Buscás resultados duraderos, con seguimiento y acompañamiento real.',
]

export default function Home() {
  const { homePhase } = useContext(HomePhaseContext)
  const forWhoRef = useTextReveal()
  const forWhoSectionRef = useRef(null)
  const coachRef = useTextReveal()
  const closingCtaRef = useTextReveal({ selector: '[data-closing-cta-item]' })
  const resolvedPhase = homePhase ?? 'content'
  const heroVisible = ['hero', 'content', 'ready'].includes(resolvedPhase)
  const contentVisible = ['content', 'ready'].includes(resolvedPhase)

  const scrollToPlans = () => {
    document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const section = forWhoSectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let ctx: { revert: () => void } | null = null

    Promise.all([
      import('gsap').then((m) => m.default),
      import('gsap/ScrollTrigger').then((m) => m.ScrollTrigger),
    ]).then(([gsap, ScrollTrigger]) => {
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        const bg = section.querySelector('[data-for-who-bg]')
        if (!bg) return

        gsap.fromTo(
          bg,
          { yPercent: -8, scale: 1.08 },
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
    })

    return () => { ctx?.revert() }
  }, [])


  return (
    <div className="flex flex-col gap-1 sm:gap-2">

      {/* ── 1. HERO ── */}
      <section
        className={`relative w-full min-h-[500px] sm:min-h-[580px] md:min-h-[680px] flex flex-col items-center justify-center p-6 sm:p-10 md:p-16 rounded-[10px] sm:rounded-[18px] md:rounded-[24px] overflow-hidden transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          heroVisible
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 translate-y-4 blur-[4px] pointer-events-none'
        }`}
        style={{
          background:
            'linear-gradient(135deg, #c8b8d4 0%, #9580A6 38%, #7A6A8F 68%, #4f445c 100%)',
        }}
      >
        <div className="absolute inset-0 bg-[#1A1820]/28" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-[600px] md:max-w-[760px] gap-5 sm:gap-6">
          <p className={`hero-reveal hero-reveal--1 text-[#d4c6e1] text-[11px] font-bold uppercase tracking-[0.22em] m-0 ${heroVisible ? 'is-visible' : ''}`}>
            DemicheriFitness
          </p>
          <h1 className={`hero-reveal hero-reveal--2 text-white text-[34px] sm:text-[46px] md:text-[62px] font-bold leading-[0.92] tracking-[-0.03em] m-0 md:max-w-[720px] ${heroVisible ? 'is-visible' : ''}`}>
            <span className="block">De donde estás,</span>
            <span className="block">a donde querés estar.</span>
          </h1>
          <p className={`hero-reveal hero-reveal--3 text-white/60 text-[14px] sm:text-[16px] md:text-[17px] leading-snug max-w-[560px] md:max-w-[580px] m-0 ${heroVisible ? 'is-visible' : ''}`}>
            Asesoramiento online de entrenamiento y nutrición. Personalizado, con seguimiento real y resultados concretos en 2 meses.
          </p>
          <div className={`hero-reveal hero-reveal--4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-1 ${heroVisible ? 'is-visible' : ''}`}>
            <a
              href="https://ddfit.vercel.app/landing-page"
              className="liquid-btn liquid-btn--solid sm:w-auto px-8 py-3.5 text-center text-[13px] font-bold uppercase tracking-widest text-white transition-all duration-500 hover:-translate-y-0.5 rounded-[10px] sm:rounded-[12px]"
            >
              <span>Quiero empezar</span>
            </a>
            <button
              onClick={scrollToPlans}
              className="liquid-btn liquid-btn--ghost sm:w-auto text-white font-bold text-[13px] uppercase tracking-widest py-3.5 px-8 rounded-[10px] sm:rounded-[12px] transition-all duration-500 hover:-translate-y-0.5"
            >
              <span>Ver los planes</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div
        className={`flex flex-col gap-1 sm:gap-2 transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          contentVisible
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 translate-y-4 blur-[4px] pointer-events-none'
        }`}
      >

        {/* ── 2. PRUEBA SOCIAL – Mensajes reales ── */}
        <MessagesSection />

        {/* ── 3. CASOS REALES – Antes / Después ── */}
        <div
          className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] px-4 sm:px-8 md:px-12 pt-8 sm:pt-10 md:pt-14 pb-0"
          style={{ backgroundColor: '#F4F2F7' }}
        >
          <p className="text-center text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-2 m-0">
            Casos reales
          </p>
          <h2 className="text-center text-[#1A1820] text-[26px] sm:text-[34px] md:text-[44px] font-bold leading-none m-0">
            Resultados concretos.<br />
            <span className="text-[#C4BBCE]">No promesas.</span>
          </h2>
          <CasesSection />
        </div>

        {/* ── 4. METHOD – "No fallaste vos. Falló el método." ── */}
        <MethodSection />

        {/* ── 5. POR QUÉ DEMICHERIFITNESS ── */}
        <WhySection />

        {/* ── 6. CÓMO EMPEZAMOS ── */}
        <StepsSection />

        {/* ── 7. PARA QUIÉN ES ── */}
        <section
          ref={forWhoSectionRef}
          className="relative w-full overflow-hidden rounded-[10px] sm:rounded-[20px] md:rounded-[28px] px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-20"
        >
          <div
            data-for-who-bg
            className="absolute inset-0 bg-cover bg-center scale-[1.08] will-change-transform"
            style={{ backgroundImage: `url(${forWhoBg})` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[#1A1820]/34" aria-hidden="true" />
          <div ref={forWhoRef} className="relative z-10 max-w-2xl mx-auto text-center">
            <p data-reveal className="text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-3 sm:mb-4 m-0">
              Este programa es para vos
            </p>
            <h2 data-reveal className="text-white text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-none mb-10 sm:mb-12 m-0">
              Si te identificás<br />con esto, seguí leyendo.
            </h2>
            <ul className="flex flex-col items-center gap-4 m-0 p-0 list-none">
              {forWhoItems.map((item, i) => (
                <li key={i} data-reveal className="flex items-start justify-center gap-3 text-center text-[14px] sm:text-[16px] text-white/65 leading-snug max-w-[780px]">
                  <span className="shrink-0 text-[#9580A6] font-bold text-[16px] mt-0.5" aria-hidden="true">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 8. AUTORIDAD – Dani / DemicheriFitness ── */}
        <section ref={coachRef} className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[#FEFEFE] border border-[#E8E4EE] px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <p data-reveal className="text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-3 sm:mb-4 m-0">
              El coach
            </p>
            <h2 data-reveal className="text-[#1A1820] text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-none mb-6 sm:mb-8 m-0">
              Dani Demicheri.
            </h2>
            <p data-reveal className="text-[#69686B] text-[15px] sm:text-[16px] md:text-[17px] leading-[1.5] mb-5 m-0">
              Creé DemicheriFitness porque me cansé de ver personas que fracasaban con planes genéricos y promesas imposibles. Después de años trabajando con cuerpos y objetivos muy distintos, desarrollé un método basado en personalización real, seguimiento cercano y adaptación constante.
            </p>
            <p data-reveal className="text-[#69686B] text-[15px] sm:text-[16px] md:text-[17px] leading-[1.5] m-0">
              No creo en las soluciones mágicas. Creo en el trabajo bien hecho, la constancia y en adaptar el método a cada persona. Eso es exactamente lo que hacemos acá.
            </p>
          </div>
        </section>

        {/* ── 9. PLANES ── */}
        <PlansSection />

        {/* ── 10. CIERRE CON CTA ── */}
        <section ref={closingCtaRef} className="relative z-20 -mt-6 sm:-mt-10 md:-mt-14 w-[calc(100%-20px)] sm:w-[calc(100%-40px)] md:w-[calc(100%-64px)] mx-auto rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[#9580A6] px-4 sm:px-8 md:px-12 py-12 sm:py-16 md:py-24 flex flex-col items-center text-center">
          <h2 data-closing-cta-item className="text-white text-[28px] sm:text-[40px] md:text-[52px] font-bold leading-none mb-4 m-0">
            Los cupos son limitados.<br />La atención es personal.
          </h2>
          <p data-closing-cta-item className="text-white/60 text-[14px] sm:text-[16px] leading-snug mb-8 max-w-[400px] m-0">
            Cada plan incluye seguimiento real. Por eso no tomamos a todos al mismo tiempo.
          </p>
          <a
            href="https://ddfit.vercel.app/landing-page"
            data-closing-cta-item
            className="liquid-btn liquid-btn--solid text-white font-bold text-[13px] uppercase tracking-widest py-4 px-10 rounded-[10px] sm:rounded-[12px] transition-all duration-500 hover:-translate-y-0.5"
          >
            <span>Quiero empezar ahora</span>
          </a>
        </section>

        {/* ── 11. FAQ ── */}
        <FAQSection />

      </div>
    </div>
  )
}
