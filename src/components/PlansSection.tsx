import { Link } from '@tanstack/react-router'

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
  return (
    <section
      id="planes"
      className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[#1A1820] px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-20"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-3 sm:mb-4 m-0">
          Los planes
        </p>
        <h2 className="text-white text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-none mb-10 sm:mb-14 m-0">
          Elegí el que<br />mejor te queda.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start">

          {/* Plan Completo — destacado */}
          <div className="relative bg-[#9580A6] rounded-[8px] sm:rounded-[12px] md:rounded-[16px] p-5 sm:p-6 md:p-8 flex flex-col">
            <span className="absolute top-4 right-4 bg-[#1A1820] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              {planCompleto.badge}
            </span>
            <h3 className="text-white text-[22px] sm:text-[24px] md:text-[28px] font-bold leading-none mb-1 m-0">
              {planCompleto.name}
            </h3>
            <div className="text-white text-[44px] sm:text-[52px] font-bold leading-none mt-5 mb-1">
              {planCompleto.price}
            </div>
            <p className="text-white/60 text-[13px] mb-7 m-0">{planCompleto.duration}</p>
            <ul className="flex flex-col gap-2.5 mb-8 m-0 p-0 list-none flex-1">
              {planCompleto.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-white leading-snug">
                  <span className="shrink-0 font-bold mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/postulacion"
              className="block text-center bg-[#1A1820] text-white font-bold text-[13px] uppercase tracking-widest py-3.5 px-6 rounded-[6px] sm:rounded-[8px] hover:bg-black transition-colors"
            >
              Empezar con este plan
            </Link>
          </div>

          {/* Plan Rutina */}
          <div className="bg-white/[0.05] border border-white/[0.08] rounded-[8px] sm:rounded-[12px] md:rounded-[16px] p-5 sm:p-6 md:p-8 flex flex-col">
            <h3 className="text-white text-[22px] sm:text-[24px] md:text-[28px] font-bold leading-none mb-1 m-0">
              {planRutina.name}
            </h3>
            <div className="text-white text-[44px] sm:text-[52px] font-bold leading-none mt-5 mb-1">
              {planRutina.price}
            </div>
            <p className="text-white/40 text-[13px] mb-7 m-0">{planRutina.duration}</p>
            <ul className="flex flex-col gap-2.5 mb-8 m-0 p-0 list-none flex-1">
              {planRutina.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-white/70 leading-snug">
                  <span className="shrink-0 text-[#9580A6] font-bold mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/postulacion"
              className="block text-center bg-white text-[#1A1820] font-bold text-[13px] uppercase tracking-widest py-3.5 px-6 rounded-[6px] sm:rounded-[8px] hover:bg-[#F4F2F7] transition-colors"
            >
              Empezar con este plan
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
