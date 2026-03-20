import { useTextReveal } from '../lib/useTextReveal'

const reasons = [
  {
    number: '01',
    title: 'Plan 100% personalizado',
    description: 'No hay plantillas. Tu plan se disena segun tu historial, tu cuerpo y tu estilo de vida real.',
    tone: {
      card: 'from-[#f5effb] via-[#f1e9f9] to-[#ece3f6]',
      glow: 'from-[#b79ccc]/30 to-transparent',
      icon: 'from-[#a58cba] to-[#7f6696]',
    },
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M7 18.5V8.8a1.8 1.8 0 0 1 .68-1.41l3.2-2.56a1.8 1.8 0 0 1 2.24 0l3.2 2.56A1.8 1.8 0 0 1 17 8.8v9.7" />
        <path d="M9.5 18.5V13h5v5.5" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Nutricion sin restricciones absurdas',
    description: 'Aprendes a comer bien sin pasar hambre. Flexible para que funcione a largo plazo.',
    tone: {
      card: 'from-[#f2edfb] via-[#ece5fa] to-[#e7def7]',
      glow: 'from-[#c3a4d8]/28 to-transparent',
      icon: 'from-[#b496cf] to-[#8a72b0]',
    },
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 20s-5.5-2.7-5.5-8A3.5 3.5 0 0 1 12 9.4 3.5 3.5 0 0 1 17.5 12c0 5.3-5.5 8-5.5 8Z" />
        <path d="M12 7.8c.1-1.8 1.1-3 2.8-3.8" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Seguimiento real, no automatizado',
    description: 'Check-ins, ajustes y soporte directo durante todo el proceso. Tenes un coach, no un bot.',
    tone: {
      card: 'from-[#efeafd] via-[#e8e2fb] to-[#e2d8f7]',
      glow: 'from-[#ac8ed6]/26 to-transparent',
      icon: 'from-[#9a7fc0] to-[#70578c]',
    },
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M6.5 10.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 5.5 5.5c0 4.6-5.5 8.5-5.5 8.5s-5.5-3.9-5.5-8.5Z" />
        <circle cx="12" cy="10.5" r="1.7" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Resultados sostenibles',
    description: 'No prometemos transformaciones en 7 dias. En 2 meses cambias habitos y ves cambios concretos.',
    tone: {
      card: 'from-[#f4effc] via-[#eee7fa] to-[#e8def6]',
      glow: 'from-[#b48fd8]/28 to-transparent',
      icon: 'from-[#ab8dcb] to-[#7b6298]',
    },
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5.5 16.5 10 12l2.8 2.8L18.5 9" />
        <path d="M15 9h3.5v3.5" />
        <path d="M5 19h14" />
      </svg>
    ),
  },
]

export default function WhySection() {
  const sectionRef = useTextReveal()

  return (
    <section ref={sectionRef} className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[#FEFEFE] px-3 sm:px-8 md:px-12 py-8 sm:py-14 md:py-20">
      <div className="max-w-5xl mx-auto">
        <p data-reveal className="text-center text-[#9580A6] text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-2 sm:mb-4 m-0">
          Por que DemicheriFitness
        </p>
        <h2 data-reveal className="text-center text-[#1A1820] text-[26px] sm:text-[36px] md:text-[48px] font-bold leading-[0.96] mb-7 sm:mb-14 m-0">
          Lo que nos diferencia<br />no son las promesas.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
          {reasons.map((r) => (
            <article
              key={r.number}
              data-reveal
              className={`group relative overflow-hidden rounded-[20px] sm:rounded-[22px] border border-[#e8e0f2] bg-gradient-to-br ${r.tone.card} p-5 sm:p-7 md:p-8 shadow-[0_10px_24px_rgba(149,128,166,0.08)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-2.5 hover:scale-[1.025] hover:-rotate-[0.6deg] hover:shadow-[0_30px_80px_rgba(149,128,166,0.22)] hover:border-[#d7c8e6]`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${r.tone.glow} opacity-80 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.04]`} />
              <div className="pointer-events-none absolute inset-y-0 -left-[35%] w-[42%] rotate-[18deg] bg-gradient-to-r from-white/0 via-white/55 to-white/0 opacity-0 blur-[2px] transition-all duration-700 ease-out group-hover:left-[115%] group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-x-5 sm:inset-x-6 top-0 h-px bg-white/80" />
              <div className="pointer-events-none absolute inset-x-6 sm:inset-x-10 bottom-0 h-[72px] sm:h-[90px] rounded-full bg-[#9580A6]/10 blur-3xl opacity-40 transition-all duration-500 group-hover:opacity-70 group-hover:scale-110" />

              <div className="relative z-10 flex items-start justify-between gap-3 mb-4 sm:mb-6">
                <div className={`inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[14px] sm:rounded-[16px] bg-gradient-to-br ${r.tone.icon} text-white shadow-[0_10px_24px_rgba(122,106,143,0.28)] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-[0_18px_34px_rgba(122,106,143,0.34)]`}>
                  {r.icon}
                </div>
                <span className="pt-1 text-[#8d76a7] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em]">
                  {r.number}
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-[#1A1820] text-[18px] sm:text-[23px] font-bold leading-[0.98] tracking-[-0.04em] mb-2 sm:mb-3 m-0 max-w-[12ch] sm:max-w-none">
                  {r.title}
                </h3>
                <p className="text-[#4d4660] text-[13px] sm:text-[15px] leading-[1.32] sm:leading-[1.38] tracking-[-0.015em] m-0 max-w-[30ch] sm:max-w-[34ch]">
                  {r.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
