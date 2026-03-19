import { useState } from 'react'

const faqs = [
  {
    q: '¿Necesito ir al gimnasio?',
    a: 'No necesariamente. El plan se arma según lo que tenés disponible: gimnasio, casa o lo que sea. Lo importante es tener algo con qué trabajar.',
  },
  {
    q: '¿Cuándo voy a ver resultados?',
    a: 'En las primeras semanas ya notás cambios en energía y hábitos. Los cambios físicos visibles aparecen entre las semanas 4 y 8, dependiendo de tu punto de partida y tu constancia.',
  },
  {
    q: '¿Cómo es la comunicación?',
    a: 'Por WhatsApp. Podés escribirme cuando tengas dudas y respondo en el día. No sos un número más en una lista.',
  },
  {
    q: '¿Cómo funciona el seguimiento?',
    a: 'Hacemos check-ins regulares para revisar tu progreso, ajustar lo que haga falta y ver cómo vas. No te mandamos el plan y te dejamos solo.',
  },
  {
    q: '¿Qué pasa si no puedo seguir el plan al 100%?',
    a: 'El plan se ajusta a tu realidad. Si algo no encaja, lo cambiamos. El objetivo es que el método funcione para vos, no al revés.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[#F4F2F7] px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-20">
      <div className="max-w-2xl mx-auto">
        <p className="text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-3 sm:mb-4 m-0">
          Dudas frecuentes
        </p>
        <h2 className="text-[#1A1820] text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-none mb-10 sm:mb-12 m-0">
          Preguntas<br />frecuentes.
        </h2>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-[#FEFEFE] border border-[#E8E4EE] rounded-[8px] sm:rounded-[12px] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between text-left px-5 sm:px-6 py-4 sm:py-5 text-[#1A1820] font-bold text-[14px] sm:text-[15px] hover:bg-[#F4F2F7] transition-colors"
                aria-expanded={open === i}
              >
                <span>{faq.q}</span>
                <span
                  className="shrink-0 ml-4 text-[#9580A6] text-[20px] leading-none transition-transform duration-200"
                  style={{ transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-5 sm:px-6 pb-5 text-[#69686B] text-[13px] sm:text-[14px] leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
