import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'

export default function NoEsElMomento() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-[#FEFEFE]">
      <header className="w-full shrink-0 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#E8E4EE] bg-[#FEFEFE]">
        <img src={logoSvg} alt="DemicheriFitness" className="h-[20px] w-auto" />
        <span className="text-[#69686B] text-[11px] font-bold uppercase tracking-[0.15em]">
          Evaluación
        </span>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div
          className="mx-auto flex min-h-full w-full max-w-[325px] flex-col justify-center md:max-w-[511px]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.28s ease, transform 0.28s ease',
          }}
        >
          <section className="flex flex-col text-center gap-6">
            <div>
              <p className="m-0 mb-3 text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.2em]">
              Todo bien
              </p>
              <h1 className="m-0 text-[#1A1820] text-[28px] sm:text-[38px] font-bold leading-tight">
                Quizás ahora no sea el momento
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              <p className="m-0 text-[#69686B] text-[15px] leading-relaxed">
                Para que el proceso realmente funcione, necesitás poder sostener la inversión y hacerlo con tranquilidad. Si hoy no está dentro de tus posibilidades, preferimos que vuelvas cuando tenga sentido para vos.
              </p>
              <p className="m-0 text-[#69686B] text-[15px] leading-relaxed">
                Seguí entrenando, cuidá lo básico y cuando estés listo/a podés retomar el formulario.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate({ to: '/' })}
                className="w-full bg-[#9580A6] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-8 rounded-[8px] hover:bg-[#7A6A8F] transition-colors"
              >
                Volver al inicio
              </button>
              <button
                onClick={() => navigate({ to: '/pre-call' })}
                className="w-full rounded-[8px] border border-[#E8E4EE] bg-[#F4F2F7] px-5 py-4 text-[#1A1820] text-[13px] font-bold uppercase tracking-widest hover:border-[#9580A6] transition-colors"
              >
                Revisar mi respuesta
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full shrink-0 border-t border-[#E8E4EE] bg-[#FEFEFE] px-4 py-3 text-center">
        <p className="text-[11px] text-[#9D9B9F] m-0">
          © DemicheriFitness · Todos los derechos reservados
        </p>
      </footer>
    </div>
  )
}
