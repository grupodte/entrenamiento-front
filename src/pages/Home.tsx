import { useContext } from 'react'
import { Link } from '@tanstack/react-router'
import heroImage from '../assets/Imagenes/image 280.webp'
import MessagesSection from '../components/MessagesSection.jsx'
import MethodSection from '../components/MethodSection.jsx'
import CasesSection from '../components/CasesSection.jsx'
import WhySection from '../components/WhySection'
import StepsSection from '../components/StepsSection'
import PlansSection from '../components/PlansSection'
import FAQSection from '../components/FAQSection'
import { HomePhaseContext } from '../layouts/MainLayout'

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
  const resolvedPhase = homePhase ?? 'content'
  const heroVisible = ['hero', 'content', 'ready'].includes(resolvedPhase)
  const contentVisible = ['content', 'ready'].includes(resolvedPhase)

  const scrollToPlans = () => {
    document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-1 sm:gap-2">

      {/* ── 1. HERO ── */}
      <section
        className={`relative w-full min-h-[500px] sm:min-h-[580px] md:min-h-[680px] flex flex-col items-center justify-center p-6 sm:p-10 md:p-16 bg-cover bg-center rounded-[10px] sm:rounded-[18px] md:rounded-[24px] overflow-hidden transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          heroVisible
            ? 'opacity-100 translate-y-0 blur-0'
            : 'opacity-0 translate-y-4 blur-[4px] pointer-events-none'
        }`}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-[#1A1820]/65" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-[600px] gap-5 sm:gap-6">
          <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.22em] m-0">
            DemicheriFitness
          </p>
          <h1 className="text-white text-[34px] sm:text-[46px] md:text-[62px] font-bold leading-none m-0">
            De donde estás,<br />a donde querés estar.
          </h1>
          <p className="text-white/60 text-[14px] sm:text-[16px] md:text-[17px] leading-snug max-w-[460px] m-0">
            Asesoramiento online de entrenamiento y nutrición. Personalizado, con seguimiento real y resultados concretos en 2 meses.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-1">
            <Link
              to="/postulacion"
              className="sm:w-auto bg-[#9580A6] text-white font-bold text-[13px] uppercase tracking-widest py-3.5 px-8 rounded-[6px] sm:rounded-[8px] hover:bg-[#7A6A8F] transition-colors text-center"
            >
              Quiero empezar
            </Link>
            <button
              onClick={scrollToPlans}
              className="sm:w-auto border border-white/25 text-white font-bold text-[13px] uppercase tracking-widest py-3.5 px-8 rounded-[6px] sm:rounded-[8px] hover:border-white/50 hover:bg-white/5 transition-colors"
            >
              Ver los planes
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
          <p className="text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-2 m-0">
            Casos reales
          </p>
          <h2 className="text-[#1A1820] text-[26px] sm:text-[34px] md:text-[44px] font-bold leading-none m-0">
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
          className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-20"
          style={{ backgroundColor: '#1A1820' }}
        >
          <div className="max-w-2xl">
            <p className="text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-3 sm:mb-4 m-0">
              Este programa es para vos
            </p>
            <h2 className="text-white text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-none mb-10 sm:mb-12 m-0">
              Si te identificás<br />con esto, seguí leyendo.
            </h2>
            <ul className="flex flex-col gap-4 m-0 p-0 list-none">
              {forWhoItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] sm:text-[16px] text-white/65 leading-snug">
                  <span className="shrink-0 text-[#9580A6] font-bold text-[16px] mt-0.5" aria-hidden="true">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 8. AUTORIDAD – Dani / DemicheriFitness ── */}
        <section className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[#FEFEFE] border border-[#E8E4EE] px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-20">
          <div className="max-w-2xl">
            <p className="text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-3 sm:mb-4 m-0">
              El coach
            </p>
            <h2 className="text-[#1A1820] text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-none mb-6 sm:mb-8 m-0">
              Dani Demicheri.
            </h2>
            <p className="text-[#69686B] text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed mb-5 m-0">
              Creé DemicheriFitness porque me cansé de ver personas que fracasaban con planes genéricos y promesas imposibles. Después de años trabajando con cuerpos y objetivos muy distintos, desarrollé un método basado en personalización real, seguimiento cercano y adaptación constante.
            </p>
            <p className="text-[#69686B] text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed m-0">
              No creo en las soluciones mágicas. Creo en el trabajo bien hecho, la constancia y en adaptar el método a cada persona. Eso es exactamente lo que hacemos acá.
            </p>
          </div>
        </section>

        {/* ── 9. PLANES ── */}
        <PlansSection />

        {/* ── 10. CIERRE CON CTA ── */}
        <section className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[#9580A6] px-4 sm:px-8 md:px-12 py-12 sm:py-16 md:py-24 flex flex-col items-center text-center">
          <h2 className="text-white text-[28px] sm:text-[40px] md:text-[52px] font-bold leading-none mb-4 m-0">
            Los cupos son limitados.<br />La atención es personal.
          </h2>
          <p className="text-white/60 text-[14px] sm:text-[16px] leading-snug mb-8 max-w-[400px] m-0">
            Cada plan incluye seguimiento real. Por eso no tomamos a todos al mismo tiempo.
          </p>
          <Link
            to="/postulacion"
            className="bg-[#1A1820] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-10 rounded-[6px] sm:rounded-[8px] hover:bg-black transition-colors"
          >
            Quiero empezar ahora
          </Link>
        </section>

        {/* ── 11. FAQ ── */}
        <FAQSection />

      </div>
    </div>
  )
}
