const steps = [
  {
    number: '01',
    title: 'Evaluación',
    description:
      'Completás un formulario de diagnóstico. Analizamos tu punto de partida, tus objetivos y tu contexto real.',
  },
  {
    number: '02',
    title: 'Tu plan',
    description:
      'Recibís tu rutina y/o plan de alimentación armado para vos. Todo explicado, sin jerga innecesaria.',
  },
  {
    number: '03',
    title: 'Seguimiento',
    description:
      'Check-ins regulares, ajustes cuando hace falta, y soporte directo durante los 2 meses completos.',
  },
]

export default function StepsSection() {
  return (
    <section className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[#F4F2F7] px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-3 sm:mb-4 m-0">
          El proceso
        </p>
        <h2 className="text-[#1A1820] text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-none mb-10 sm:mb-14 m-0">
          Cómo empezamos.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-[#FEFEFE] border border-[#E8E4EE] rounded-[8px] sm:rounded-[12px] md:rounded-[16px] p-5 sm:p-6 md:p-8"
            >
              <span className="block text-[#9580A6] text-[48px] sm:text-[56px] font-bold leading-none mb-4">
                {step.number}
              </span>
              <h3 className="text-[#1A1820] text-[18px] sm:text-[20px] font-bold leading-tight mb-2 m-0">
                {step.title}
              </h3>
              <p className="text-[#69686B] text-[13px] sm:text-[14px] leading-relaxed m-0">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
