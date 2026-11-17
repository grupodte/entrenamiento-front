import { useEffect, useState } from 'react'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'

const WAITLIST_NAME_STORAGE_KEY = 'dmf_waitlist_name'

export default function ListaEspera() {
  const [visible, setVisible] = useState(false)
  const [nombre] = useState(() => {
    try {
      const full = sessionStorage.getItem(WAITLIST_NAME_STORAGE_KEY) ?? ''
      return full.trim().split(/\s+/)[0] ?? ''
    } catch {
      return ''
    }
  })

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
                Lista de espera
              </p>
              <h1 className="m-0 text-[#1A1820] text-[28px] sm:text-[38px] font-bold leading-tight">
                ¡Listo{nombre ? `, ${nombre}` : ''}! Ya estás en la lista de espera.
              </h1>
            </div>

            <p className="m-0 text-[#69686B] text-[15px] leading-relaxed">
              Cuando se libere un cupo te escribimos por WhatsApp. Mientras tanto, seguí aprendiendo en Instagram.
            </p>

            <a
              href="https://www.instagram.com/demicherifitness/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#9580A6] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-8 rounded-[8px] hover:bg-[#7A6A8F] transition-colors text-center"
            >
              Ir a @demicherifitness
            </a>
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
