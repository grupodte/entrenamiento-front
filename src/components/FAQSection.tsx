import { useState } from 'react'
import { useTextReveal } from '../lib/useTextReveal'

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
  const sectionRef = useTextReveal()

  return (
    <section ref={sectionRef} className="w-full rounded-[10px] sm:rounded-[20px] md:rounded-[28px] bg-[#F4F2F7] px-4 sm:px-8 md:px-12 py-10 sm:py-14 md:py-20">
      <div className="max-w-2xl mx-auto">
        <p data-reveal className="text-center text-[#9580A6] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] mb-3 sm:mb-4 m-0">
          Dudas frecuentes
        </p>
        <h2 data-reveal className="text-center text-[#1A1820] text-[28px] sm:text-[36px] md:text-[48px] font-bold leading-none mb-10 sm:mb-12 m-0">
          Preguntas<br />frecuentes.
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[14px] border border-white/65 bg-white/55 shadow-[0_14px_34px_rgba(28,24,36,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-[18px] sm:rounded-[18px]"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.18))]"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/90"
                aria-hidden="true"
              />
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="relative z-10 w-full flex items-center justify-between text-center px-5 sm:px-6 py-4 sm:py-5 text-[#1A1820] font-bold text-[14px] sm:text-[15px] hover:bg-white/20 transition-colors"
                aria-expanded={open === i}
              >
                <span className="flex-1 text-center">{faq.q}</span>
                <span
                  className="shrink-0 ml-4 text-[#9580A6] text-[20px] leading-none transition-transform duration-200"
                  style={{ transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="relative z-10 px-5 sm:px-6 pb-5 text-center text-[#69686B] text-[13px] sm:text-[14px] leading-relaxed">
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
