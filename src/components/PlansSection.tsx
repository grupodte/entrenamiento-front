import { Link } from '@tanstack/react-router'
import { useTextReveal } from '../lib/useTextReveal'

const planCompleto = {
  name: 'Dieta + Rutina',
  badge: 'Más completo',
  price: 'USD 350',
  duration: '2 meses',
  features: [
    'Rutina de entrenamiento personalizada',
    'Plan de alimentación adaptado a tus objetivos',
    'Seguimiento mensual con ajustes',
    'Soporte por WhatsApp durante todo el proceso',
    'Guía de ejercicios con explicaciones',
  ],
}

const planRutina = {
  name: 'Solo Rutina',
  price: 'USD 200',
  duration: '2 meses',
  features: [
    'Rutina de entrenamiento personalizada',
    'Seguimiento mensual con ajustes',
    'Soporte por WhatsApp durante todo el proceso',
    'Guía de ejercicios con explicaciones',
  ],
}

export default function PlansSection() {
  const sectionRef = useTextReveal()

  return (
    <section
      ref={sectionRef}
      id="planes"
      className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#1A1820] px-4 py-10 sm:px-8 sm:py-14 md:px-12 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(149,128,166,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(149,128,166,0.12),transparent_30%)]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <p data-reveal className="text-center text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-3 sm:mb-4 m-0">
          Los planes
        </p>
        <h2 data-reveal className="text-center text-white text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-[0.96] tracking-[-0.045em] mb-10 sm:mb-14 m-0">
          Elegí el que<br />mejor te queda.
        </h2>

        <div data-reveal className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 backdrop-blur-[22px] shadow-[0_24px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
            <div className="plan-spotlight relative rounded-[20px] sm:rounded-[24px] p-[1px]">
              <div className="plan-spotlight__glow" aria-hidden="true" />

              <div className="relative flex h-full flex-col overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#9580A6] p-5 sm:p-6 md:p-8 shadow-[0_18px_48px_rgba(149,128,166,0.24)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.04)_18%,rgba(255,255,255,0)_42%)]" />
                <div className="pointer-events-none absolute -right-16 top-[-72px] h-40 w-40 rounded-full bg-white/18 blur-3xl" />
                <div className="pointer-events-none absolute left-[-28px] bottom-[-62px] h-32 w-32 rounded-full bg-[#c8b5dc]/32 blur-3xl" />

                <span className="absolute top-4 right-4 bg-[#1A1820] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
                  {planCompleto.badge}
                </span>

                <h3 className="relative z-10 text-white text-[22px] sm:text-[24px] md:text-[28px] font-bold leading-[0.98] tracking-[-0.04em] mb-1 m-0">
                  {planCompleto.name}
                </h3>
                <div className="relative z-10 text-white text-[44px] sm:text-[52px] font-bold leading-[0.92] tracking-[-0.055em] mt-5 mb-1">
                  {planCompleto.price}
                </div>
                <p className="relative z-10 text-white/70 text-[13px] mb-7 m-0">{planCompleto.duration}</p>

                <ul className="relative z-10 flex flex-col gap-2.5 mb-8 m-0 p-0 list-none flex-1">
                  {planCompleto.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-white leading-[1.35] tracking-[-0.015em]">
                      <span className="shrink-0 font-bold mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/postulacion"
                  className="ios-cta relative z-10 block text-center bg-[linear-gradient(180deg,#25202d_0%,#17141d_100%)] !text-white font-bold text-[13px] uppercase tracking-[0.16em] py-3.5 px-6 rounded-[6px] sm:rounded-[8px] transition-all duration-300 hover:!text-white hover:-translate-y-0.5"
                >
                  Empezar con este plan
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.05)_100%)] p-5 sm:p-6 md:p-8 flex flex-col backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(149,128,166,0.14),transparent_34%)] opacity-80" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

              <h3 className="relative z-10 text-white text-[22px] sm:text-[24px] md:text-[28px] font-bold leading-[0.98] tracking-[-0.04em] mb-1 m-0">
                {planRutina.name}
              </h3>
              <div className="relative z-10 text-white text-[44px] sm:text-[52px] font-bold leading-[0.92] tracking-[-0.055em] mt-5 mb-1">
                {planRutina.price}
              </div>
              <p className="relative z-10 text-white/46 text-[13px] mb-7 m-0">{planRutina.duration}</p>

              <ul className="relative z-10 flex flex-col gap-2.5 mb-8 m-0 p-0 list-none flex-1">
                {planRutina.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-white/78 leading-[1.35] tracking-[-0.015em]">
                    <span className="shrink-0 text-[#9580A6] font-bold mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/postulacion"
                className="relative z-10 block text-center bg-[#9580A6] !text-white font-bold text-[13px] uppercase tracking-[0.16em] py-3.5 px-6 rounded-[6px] sm:rounded-[8px] shadow-[0_14px_28px_rgba(20,16,28,0.18)] hover:bg-[#7A6A8F] hover:!text-white transition-all duration-300 hover:-translate-y-0.5"
              >
                Empezar con este plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
