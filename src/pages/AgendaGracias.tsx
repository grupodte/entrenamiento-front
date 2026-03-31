import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

// Icons as SVG components
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export default function AgendaGracias() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          navigate({ to: '/' })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFEFE] via-[#F4F2F7] to-[#EDE9F3] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#9580A6]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#9580A6]/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[560px]">
        {/* Success Card */}
        <div className="bg-[#FEFEFE] rounded-[28px] shadow-[0_30px_80px_rgba(149,128,166,0.18)] border border-[#E8E4EE] overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#9580A6] via-[#B8A8C8] to-[#9580A6]" />
          
          <div className="p-8 md:p-10">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9580A6] to-[#7A6A8F] flex items-center justify-center shadow-[0_12px_40px_rgba(149,128,166,0.35)]">
                  <CheckIcon className="w-10 h-10 text-white" />
                </div>
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full bg-[#9580A6]/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute -inset-3 rounded-full bg-[#9580A6]/10 animate-pulse" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-[28px] md:text-[32px] font-bold text-[#1A1820] text-center mb-3 tracking-tight">
              ¡Cita confirmada!
            </h1>
            
            {/* Subtitle */}
            <p className="text-[15px] text-[#69686B] text-center leading-relaxed mb-8 max-w-[420px] mx-auto">
              Tu sesión de evaluación está agendada. Te enviamos un correo con todos los detalles y el link para conectarte.
            </p>

            {/* Info cards */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#F4F2F7] border border-[#E8E4EE]">
                <div className="w-10 h-10 rounded-full bg-[#9580A6]/15 flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-5 h-5 text-[#9580A6]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#9580A6] font-bold uppercase tracking-[0.12em] mb-0.5">
                    Sesión agendada
                  </p>
                  <p className="text-[14px] text-[#1A1820] font-medium">
                    Revisá tu correo para ver la fecha y hora exacta
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#F4F2F7] border border-[#E8E4EE]">
                <div className="w-10 h-10 rounded-full bg-[#9580A6]/15 flex items-center justify-center flex-shrink-0">
                  <MailIcon className="w-5 h-5 text-[#9580A6]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#9580A6] font-bold uppercase tracking-[0.12em] mb-0.5">
                    Correo enviado
                  </p>
                  <p className="text-[14px] text-[#1A1820] font-medium">
                    Incluye el link de Google Meet para la llamada
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown message */}
            <div className="flex items-center justify-center gap-2 mb-6 text-[13px] text-[#9D9B9F]">
              <span>Volviendo al inicio en</span>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#9580A6]/10 text-[#9580A6] font-bold text-[12px]">
                {countdown}
              </span>
              <span>segundos</span>
            </div>

            {/* Button */}
            <button
              onClick={() => navigate({ to: '/' })}
              className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] bg-[#9580A6] text-white font-semibold text-[14px] tracking-[-0.01em] hover:bg-[#7A6A8F] transition-all duration-200 shadow-[0_8px_24px_rgba(149,128,166,0.28)] hover:shadow-[0_12px_32px_rgba(149,128,166,0.38)] hover:-translate-y-0.5"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Ir al inicio</span>
              <ArrowRightIcon className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-[12px] text-[#9D9B9F] mt-6">
          ¿Necesitas cambiar tu cita? Respondé el correo que te enviamos
        </p>
      </div>
    </div>
  )
}
