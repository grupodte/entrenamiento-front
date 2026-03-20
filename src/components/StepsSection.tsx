import { useTextReveal } from '../lib/useTextReveal'

const steps = [
  {
    number: '01',
    title: 'Evaluación',
    description:
      'Completás un formulario de diagnóstico. Analizamos tu punto de partida, tus objetivos y tu contexto real.',
    eyebrow: 'Base real',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M6.5 10.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 5.5 5.5c0 4.6-5.5 8.5-5.5 8.5s-5.5-3.9-5.5-8.5Z" />
        <circle cx="12" cy="10.5" r="1.7" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Tu plan',
    description:
      'Recibís tu rutina y/o plan de alimentación armado para vos. Todo explicado, sin jerga innecesaria.',
    eyebrow: 'Claridad total',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M7 6.5h10" />
        <path d="M7 11.5h10" />
        <path d="M7 16.5h6" />
        <path d="M5.5 4.5h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Seguimiento',
    description:
      'Check-ins regulares, ajustes cuando hace falta, y soporte directo durante los 2 meses completos.',
    eyebrow: 'Acompañamiento',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5.5 16.5 10 12l2.8 2.8L18.5 9" />
        <path d="M15 9h3.5v3.5" />
        <path d="M5 19h14" />
      </svg>
    ),
  },
]

export default function StepsSection() {
  const sectionRef = useTextReveal()

  return (
    <section ref={sectionRef} className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[linear-gradient(180deg,#f7f4fb_0%,#f1edf7_100%)] px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-[620px]">
          <p data-reveal className="text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] mb-3 sm:mb-4 m-0">
            El proceso
          </p>
          <h2 data-reveal className="text-[#1A1820] text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-[0.96] tracking-[-0.045em] mb-10 sm:mb-14 m-0">
            Cómo empezamos.
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-[34px] hidden md:block h-px bg-gradient-to-r from-transparent via-[#c9bad8] to-transparent" />

          {steps.map((step) => (
            <article
              key={step.number}
              data-reveal
              className="group relative overflow-hidden rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.78)_100%)] p-5 sm:p-6 md:p-7 shadow-[0_12px_34px_rgba(122,106,143,0.08)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:scale-[1.015] hover:shadow-[0_28px_60px_rgba(122,106,143,0.16)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(149,128,166,0.12),transparent_38%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/90" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#9580A6]/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />

              <div className="relative z-10 mb-8 flex items-center justify-between gap-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#ad97c2_0%,#8b73a6_100%)] text-white shadow-[0_12px_24px_rgba(149,128,166,0.24)] transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  {step.icon}
                </div>
                <span className="text-[#8f7aa8] text-[11px] font-bold uppercase tracking-[0.22em]">
                  {step.eyebrow}
                </span>
              </div>

              <div className="relative z-10">
                <span className="block text-[#9580A6] text-[54px] sm:text-[62px] md:text-[68px] font-bold leading-[0.88] tracking-[-0.06em] mb-4">
                  {step.number}
                </span>
                <h3 className="text-[#1A1820] text-[22px] sm:text-[24px] font-bold leading-[0.98] tracking-[-0.045em] mb-3 m-0">
                  {step.title}
                </h3>
                <p className="text-[#5f586d] text-[14px] sm:text-[15px] leading-[1.42] tracking-[-0.018em] m-0 max-w-[26ch]">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
