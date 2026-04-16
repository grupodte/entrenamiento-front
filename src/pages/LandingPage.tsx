import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'

type HeroVariant = 'base' | 'a' | 'b'

type HeroCopy = {
  headline: string
  headlineSecondLine: string
  subheadline: string
  body: string
}

const HERO_VARIANTS: Record<HeroVariant, HeroCopy> = {
  base: {
    headline: 'Las apps de fitness no funcionan porque no te conocen.',
    headlineSecondLine: 'Demicheri, sí.',
    subheadline:
      'Un programa de entrenamiento y nutrición diseñado para vos, con seguimiento directo de un profesional de la salud seguido por más de 260.000 personas.',
    body:
      'No es una app genérica. Es el método que Demicheri aplica con sus clientes, ahora accesible desde tu celular: rutinas personalizadas, plan de alimentación y acceso directo por WhatsApp cuando lo necesitás.',
  },
  a: {
    headline: 'Ya probaste las apps. Ya probaste las dietas. El problema no eras vos.',
    headlineSecondLine: 'El problema es que ninguna estaba hecha para vos. El Método Demicheri sí.',
    subheadline:
      'Demicheri es profesional de la salud con 260K seguidores, y ahora podés tener su método en tu celular: rutinas a medida, nutrición real y WhatsApp directo cuando lo necesitás.',
    body:
      'Programa personalizado para 2 meses, sin excusas genéricas: entrenamiento, nutrición y seguimiento directo para que avances de verdad.',
  },
  b: {
    headline: 'El método que Demicheri aplica con sus clientes. Ahora para vos.',
    headlineSecondLine: 'Acceso directo, sin intermediarios.',
    subheadline:
      'Entrenamiento + nutrición personalizada + seguimiento directo, todo desde la app. Por $300 los 2 meses.',
    body:
      '260K personas lo siguen porque funciona. Ahora podés acceder al mismo sistema: programa para tu cuerpo, plan sostenible y acceso por WhatsApp cuando lo necesitás.',
  },
}

const VALUE_FEATURES = [
  {
    title: 'Entrenamiento diseñado para tu cuerpo',
    description:
      'No rutinas genéricas. Tu programa se arma en base a tus datos físicos, tu objetivo y tu frecuencia disponible.',
  },
  {
    title: 'Nutrición que podés sostener',
    description:
      'Un plan de alimentación real, no una dieta de 3 días. Hecho para integrarse a tu vida, no para reemplazarla.',
  },
  {
    title: 'Demicheri en tu WhatsApp',
    description:
      'Dudas, ajustes, bloqueos: le escribís directamente. Acceso al profesional sin turno y sin espera.',
  },
] as const

const TESTIMONIAL_PLACEHOLDERS = [
  'PLACEHOLDER: "Nombre, resultado concreto en X semanas"',
  'PLACEHOLDER: "Nombre, cambio de hábito y mejora física"',
  'PLACEHOLDER: "Nombre, objetivo cumplido y tiempo logrado"',
] as const

function FunnelHeader() {
  return (
    <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#E8E4EE] bg-[#FEFEFE]">
      <img src={logoSvg} alt="DemicheriFitness" className="h-[20px] w-auto" />
      <span className="text-[#69686B] text-[11px] font-bold uppercase tracking-[0.18em]">Método Demicheri</span>
    </header>
  )
}

function resolveHeroVariant(): HeroVariant {
  if (typeof window === 'undefined') return 'base'

  const raw = new URLSearchParams(window.location.search).get('v')?.toLowerCase()
  if (raw === 'a' || raw === 'b') return raw

  return 'base'
}

export default function LandingPage() {
  const [variant] = useState<HeroVariant>(resolveHeroVariant)
  const hero = HERO_VARIANTS[variant]

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FEFEFE]">
      <FunnelHeader />

      <main className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-14 flex flex-col gap-4 sm:gap-6 md:gap-8">
        <section className="rounded-[16px] sm:rounded-[20px] bg-[#F4F2F7] border border-[#E8E4EE] p-6 sm:p-10 md:p-12">
          <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4 m-0">
            Método Demicheri
          </p>
          <h1 className="text-[#1A1820] text-[30px] sm:text-[46px] md:text-[56px] font-bold leading-[0.92] tracking-[-0.03em] m-0 max-w-[860px]">
            {hero.headline}
            <br />
            <span className="text-[#9580A6]">{hero.headlineSecondLine}</span>
          </h1>
          <p className="text-[#2A2731] text-[16px] sm:text-[20px] leading-snug max-w-[820px] mt-6 mb-0">
            {hero.subheadline}
          </p>
          <p className="text-[#69686B] text-[15px] sm:text-[17px] leading-relaxed max-w-[860px] mt-4 mb-0">{hero.body}</p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
            <Link
              to="/pre-call"
              className="inline-flex items-center justify-center bg-[#9580A6] text-white font-bold text-[12px] sm:text-[13px] uppercase tracking-[0.14em] py-4 px-6 rounded-[10px] hover:bg-[#7A6A8F] transition-colors"
            >
              Empezar mi ciclo - $300 por 2 meses
            </Link>
            <a
              href="#metodo"
              className="inline-flex items-center justify-center border border-[#1A1820]/15 text-[#1A1820] font-bold text-[12px] sm:text-[13px] uppercase tracking-[0.1em] py-4 px-6 rounded-[10px] hover:bg-white transition-colors"
            >
              Ver cómo funciona antes de decidir
            </a>
          </div>
        </section>

        <section id="metodo" className="rounded-[16px] sm:rounded-[20px] border border-[#E8E4EE] bg-white p-6 sm:p-10 md:p-12">
          <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.2em] mb-3 m-0">Propuesta de valor</p>
          <h2 className="text-[#1A1820] text-[26px] sm:text-[36px] md:text-[42px] font-bold leading-none m-0 mb-8 sm:mb-10">
            Un sistema pensado para sostener resultados, no para motivarte 3 días.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {VALUE_FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[12px] border border-[#E8E4EE] bg-[#FEFEFE] p-5 sm:p-6 flex flex-col gap-3"
              >
                <span className="inline-flex w-8 h-8 rounded-full items-center justify-center bg-[#F4F2F7] text-[#9580A6] font-bold text-[13px]">
                  ✓
                </span>
                <h3 className="text-[#1A1820] text-[18px] sm:text-[20px] font-bold leading-tight m-0">{feature.title}</h3>
                <p className="text-[#69686B] text-[14px] sm:text-[15px] leading-relaxed m-0">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[16px] sm:rounded-[20px] bg-[#1A1820] text-white p-6 sm:p-10 md:p-12">
          <p className="text-white/55 text-[11px] font-bold uppercase tracking-[0.2em] mb-3 m-0">Pricing</p>
          <h2 className="text-[26px] sm:text-[36px] md:text-[42px] font-bold leading-tight m-0 max-w-[820px]">
            ¿Cuánto cuesta tener un profesional de tu lado por 2 meses?
          </h2>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="px-4 py-3 border border-white/20 text-[12px] uppercase tracking-[0.12em] text-white/70">Plan</th>
                  <th className="px-4 py-3 border border-white/20 text-[12px] uppercase tracking-[0.12em] text-white/70">Incluye</th>
                  <th className="px-4 py-3 border border-white/20 text-[12px] uppercase tracking-[0.12em] text-white/70">Precio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 border border-white/20 text-[15px] font-semibold">Solo entrenamiento</td>
                  <td className="px-4 py-3 border border-white/20 text-[14px] text-white/80">Rutinas + seguimiento de progreso + WhatsApp</td>
                  <td className="px-4 py-3 border border-white/20 text-[15px] font-bold">$200</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border border-white/20 text-[15px] font-semibold">Solo nutrición</td>
                  <td className="px-4 py-3 border border-white/20 text-[14px] text-white/80">Plan de alimentación + ajustes + WhatsApp</td>
                  <td className="px-4 py-3 border border-white/20 text-[15px] font-bold">$200</td>
                </tr>
                <tr className="bg-[#2A2731]">
                  <td className="px-4 py-3 border border-white/20 text-[15px] font-semibold">Método completo ⭐ Más elegido</td>
                  <td className="px-4 py-3 border border-white/20 text-[14px] text-white/80">Entrenamiento + Nutrición + WhatsApp</td>
                  <td className="px-4 py-3 border border-white/20 text-[15px] font-bold">
                    <span className="line-through text-white/45 mr-2">$400</span>
                    <span className="text-[#9EF2B5]">$300</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-white/75 text-[14px] sm:text-[15px] leading-relaxed mt-6 mb-0">
            Ciclos de 2 meses, el tiempo mínimo para que un hábito se instale de verdad.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/pre-call"
              className="inline-flex w-full sm:w-fit items-center justify-center bg-white text-[#1A1820] font-bold text-[12px] sm:text-[13px] uppercase tracking-[0.1em] py-4 px-6 rounded-[10px] hover:bg-white/90 transition-colors"
            >
              Empezar con el Método completo - $300
            </Link>
            <p className="text-white/60 text-[13px] m-0">o elegir un solo módulo si preferís arrancar de a uno</p>
          </div>
        </section>

        <section className="rounded-[16px] sm:rounded-[20px] border border-[#E8E4EE] bg-white p-6 sm:p-10 md:p-12">
          <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.2em] mb-3 m-0">Prueba social</p>
          <h2 className="text-[#1A1820] text-[26px] sm:text-[34px] md:text-[40px] font-bold leading-tight m-0 max-w-[860px]">
            Más de 260.000 personas siguen el método de Demicheri en Instagram.
          </h2>
          <p className="text-[#69686B] text-[15px] leading-relaxed mt-4 mb-0">
            Estos testimonios deben reemplazarse por casos reales con nombre, resultado y tiempo para maximizar conversión.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-7">
            {TESTIMONIAL_PLACEHOLDERS.map((placeholder) => (
              <article
                key={placeholder}
                className="rounded-[12px] border border-dashed border-[#D8D2DF] bg-[#FCFBFE] p-5 sm:p-6 flex flex-col gap-3"
              >
                <div className="w-11 h-11 rounded-full bg-[#E8E4EE]" aria-hidden="true" />
                <p className="text-[#1A1820] text-[14px] leading-relaxed m-0">{placeholder}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
