const reasons = [
  {
    number: '01',
    title: 'Plan 100% personalizado',
    description: 'No hay plantillas. Tu plan se diseña según tu historial, tu cuerpo y tu estilo de vida real.',
  },
  {
    number: '02',
    title: 'Nutrición sin restricciones absurdas',
    description: 'Aprendés a comer bien sin pasar hambre. Flexible para que funcione a largo plazo.',
  },
  {
    number: '03',
    title: 'Seguimiento real, no automatizado',
    description: 'Check-ins, ajustes y soporte directo durante todo el proceso. Tenés un coach, no un bot.',
  },
  {
    number: '04',
    title: 'Resultados sostenibles',
    description: 'No prometemos transformaciones en 7 días. En 2 meses cambiás hábitos y ves cambios concretos.',
  },
]

export default function WhySection() {
  return (
    <section className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[#FEFEFE] px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-3 sm:mb-4 m-0">
          Por qué DemicheriFitness
        </p>
        <h2 className="text-[#1A1820] text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-none mb-10 sm:mb-14 m-0">
          Lo que nos diferencia<br />no son las promesas.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {reasons.map((r) => (
            <div
              key={r.number}
              className="bg-[#F4F2F7] border border-[#E8E4EE] rounded-[8px] sm:rounded-[12px] md:rounded-[16px] p-5 sm:p-6 md:p-8"
            >
              <span className="block text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.15em] mb-3">
                {r.number}
              </span>
              <h3 className="text-[#1A1820] text-[18px] sm:text-[20px] font-bold leading-tight mb-2 m-0">
                {r.title}
              </h3>
              <p className="text-[#69686B] text-[13px] sm:text-[14px] leading-relaxed m-0">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
