import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useGTM } from '../lib/useGTM'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.5-4.9A8.4 8.4 0 1 1 20.5 11.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M8.2 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4 0 .6l-.5.6c-.2.2-.2.4 0 .6.5.8 1.2 1.5 2 2 .2.1.4.1.6-.1l.7-.7c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5 0 .4-.2 1-.6 1.3-.5.5-1.2.7-1.9.6-1.1-.2-2.5-.9-3.9-2.1-1.3-1.2-2.2-2.6-2.5-3.7-.2-.8 0-1.5.4-2Z" fill="currentColor" />
  </svg>
)

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
)

export default function AgendaGracias() {
  const navigate = useNavigate()
  const { trackEvent } = useGTM()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    trackEvent('booking_completed', { conversion_type: 'agenda_confirmada' })
  }, [trackEvent])

  useEffect(() => {
    if (countdown === 0) {
      navigate({ to: '/' })
      return
    }
    const timer = window.setTimeout(() => setCountdown((remaining) => remaining - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, navigate])

  useEffect(() => {
    const video = videoRef.current
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!video) return

    const syncMotionPreference = () => {
      if (motionPreference.matches) {
        video.pause()
      } else {
        void video.play().catch(() => undefined)
      }
    }

    syncMotionPreference()
    motionPreference.addEventListener('change', syncMotionPreference)
    return () => motionPreference.removeEventListener('change', syncMotionPreference)
  }, [])

  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden bg-[#111016] text-white">
      <style>{`
        @keyframes confirmation-enter {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes confirmation-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(190, 157, 211, .36); }
          50% { box-shadow: 0 0 0 8px rgba(190, 157, 211, 0); }
        }
        .confirmation-enter { animation: confirmation-enter .7s cubic-bezier(.2,.75,.25,1) both; }
        .confirmation-enter-delay { animation: confirmation-enter .7s .14s cubic-bezier(.2,.75,.25,1) both; }
        .confirmation-dot { animation: confirmation-pulse 2.2s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .confirmation-enter, .confirmation-enter-delay, .confirmation-dot { animation: none !important; }
        }
      `}</style>

      <video
        ref={videoRef}
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-55"
        src="/videos/welcome-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(112deg,rgba(17,16,22,.86)_0%,rgba(35,27,43,.72)_48%,rgba(17,16,22,.84)_100%)]" />
      <div className="pointer-events-none absolute -left-40 top-[-15rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-[#9580A6]/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-64 right-[-8rem] -z-10 h-[38rem] w-[38rem] rounded-full bg-[#6d587c]/30 blur-[140px]" />

      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1440px] flex-col px-4 py-4 sm:px-8 sm:py-8 lg:px-14">
        <header className="flex items-center justify-between">
          <img src={logoSvg} alt="DemicheriFitness" className="h-6 w-auto brightness-0 invert sm:h-8" />
          <span className="hidden rounded-full border border-white/20 bg-black/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white/65 backdrop-blur-md sm:inline-flex">
            Demicheri Fitness · Agenda
          </span>
        </header>

        <div className="grid flex-1 content-center items-start gap-5 py-5 sm:gap-9 sm:py-12 sm:content-normal sm:items-center lg:grid-cols-[minmax(0,1fr)_minmax(400px,.8fr)] lg:content-center lg:gap-16 lg:py-16">
          <section className="confirmation-enter max-w-[680px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9B3D8]/25 bg-white/[.08] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.17em] text-[#e4d6ed] backdrop-blur-md sm:mb-7 sm:gap-2.5 sm:px-3.5 sm:py-2 sm:text-[11px]">
              <span className="confirmation-dot h-1.5 w-1.5 rounded-full bg-[#d1b4e2] sm:h-2 sm:w-2" />
              Reserva registrada
            </div>

            <h1 className="m-0 max-w-[650px] text-[clamp(2.25rem,6vw,5.4rem)] font-semibold leading-[.98] tracking-[-.06em] text-white sm:leading-[.96] sm:tracking-[-.065em]">
              ¡Tu llamada está agendada!
            </h1>
            <p className="mb-0 mt-3 max-w-[550px] text-[14px] leading-[1.55] text-white/72 sm:mt-6 sm:text-[18px] sm:leading-[1.75]">
              Tu horario ya está reservado. Solo falta confirmar tu asistencia.
            </p>
          </section>

          <section className="confirmation-enter-delay w-full justify-self-end rounded-[21px] border border-white/20 bg-[#17141d]/75 p-4 shadow-[0_28px_100px_rgba(0,0,0,.38)] backdrop-blur-2xl sm:rounded-[26px] sm:p-7 lg:max-w-[540px] lg:p-8" aria-labelledby="next-step-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-[10px] font-bold uppercase tracking-[.2em] text-[#c9b3d8]">Próximo paso</p>
                <h2 id="next-step-title" className="mb-0 mt-1.5 text-[21px] font-semibold leading-tight tracking-[-.04em] text-white sm:mt-2 sm:text-[29px]">
                  Respondé el WhatsApp
                </h2>
              </div>
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[14px] bg-[#c7ebd3] text-[#176b3b] shadow-[0_8px_26px_rgba(28,122,68,.18)] sm:h-12 sm:w-12 sm:rounded-[16px]">
                <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
            </div>

            <p className="mb-0 mt-3 text-[13px] leading-[1.55] text-white/68 sm:mt-4 sm:text-[15px] sm:leading-[1.7]">
              En breve te llegará un mensaje para confirmar tu asistencia. Respondelo para conservar el horario.
            </p>

            <div className="mt-4 rounded-[15px] border border-[#d1b5e1]/25 bg-[#9580A6]/15 p-3.5 sm:mt-6 sm:rounded-[17px] sm:p-5">
              <p className="m-0 text-[12px] font-semibold text-[#eadcf2] sm:text-[13px]">Si no respondés</p>
              <p className="mb-0 mt-1 text-[11px] leading-[1.5] text-white/70 sm:mt-1.5 sm:text-[13px] sm:leading-[1.65]">
                Cancelaremos la reserva y liberaremos el horario para otra persona.
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2.5 rounded-[14px] border border-white/10 bg-black/15 px-3 py-2.5 sm:mt-5 sm:gap-3 sm:rounded-[15px] sm:px-4 sm:py-3.5">
              <MailIcon className="h-4 w-4 flex-none text-[#c9b3d8] sm:h-5 sm:w-5" />
              <p className="m-0 text-[11px] leading-relaxed text-white/58 sm:text-[12px]">El email incluye la fecha, la hora y el enlace de Google Meet.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate({ to: '/' })}
              className="group mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-[#c7afd8] px-5 py-2.5 text-[13px] font-semibold text-[#211a28] shadow-[0_10px_30px_rgba(0,0,0,.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#d8c4e5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:mt-6 sm:min-h-12 sm:py-3 sm:text-[14px]"
            >
              Volver al inicio
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="m-0 mt-2.5 flex items-center justify-center gap-2 text-[11px] text-white/50 sm:mt-4 sm:text-[12px]" aria-live="polite">
              Irás al inicio en <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white/10 px-1.5 font-semibold text-white/85">{countdown}</span> segundos
            </p>
          </section>
        </div>

        <footer className="border-t border-white/15 py-3 text-center text-[9px] font-medium uppercase tracking-[.12em] text-white/40 sm:py-4 sm:text-[10px] sm:tracking-[.16em]">
          DemicheriFitness · Entrenamiento y nutrición con seguimiento real
        </footer>
      </div>
    </main>
  )
}
