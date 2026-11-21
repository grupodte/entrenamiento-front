import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useGTM } from '../lib/useGTM'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'

import preCallPoster from '../assets/pre-call-gracias-poster.jpg'

// Video de Dani para ver antes de la llamada (vertical, H.264 + AAC, ~4 MB).
// Tiene que ser .mp4 en H.264: el .mov original está en HEVC y no se reproduce
// en Chrome de escritorio, Firefox ni en muchos Android.
const PRECALL_VIDEO_URL =
  'https://iyipzkkiqscbzugrakeh.supabase.co/storage/v1/object/public/video/pre-call-gracias.mp4'

const AGENDA_TIME_ZONE = 'America/Montevideo'
const CALL_DURATION_MIN = 20
const INSTAGRAM_URL = 'https://www.instagram.com/demicherifitness/'

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const formatCallDate = (date: Date) =>
  capitalize(
    new Intl.DateTimeFormat('es', { timeZone: AGENDA_TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long' }).format(date)
  )

const formatCallTime = (date: Date) =>
  new Intl.DateTimeFormat('es', { timeZone: AGENDA_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false }).format(date)

// Formato de fechas de Google Calendar: 20261117T181500Z
const toGoogleDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

const googleCalendarUrl = (start: Date) => {
  const end = new Date(start.getTime() + CALL_DURATION_MIN * 60_000)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Llamada con Dani · Demicheri Fitness',
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
    details: 'Llamada de evaluación 1 a 1. El link de Google Meet está en el email de confirmación.',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.5-4.9A8.4 8.4 0 1 1 20.5 11.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M8.2 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4 0 .6l-.5.6c-.2.2-.2.4 0 .6.5.8 1.2 1.5 2 2 .2.1.4.1.6-.1l.7-.7c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5 0 .4-.2 1-.6 1.3-.5.5-1.2.7-1.9.6-1.1-.2-2.5-.9-3.9-2.1-1.3-1.2-2.2-2.6-2.5-3.7-.2-.8 0-1.5.4-2Z" fill="currentColor" />
  </svg>
)

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
)

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
  </svg>
)

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
)

export default function AgendaGracias({ fromAlumnoAgenda, startIso }: { fromAlumnoAgenda: boolean; startIso?: string }) {
  const navigate = useNavigate()
  const { trackEvent } = useGTM()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const videoUrl = fromAlumnoAgenda ? undefined : PRECALL_VIDEO_URL
  const start = startIso ? new Date(startIso) : null
  const hasStart = start !== null && !Number.isNaN(start.getTime())

  useEffect(() => {
    trackEvent('booking_completed', { conversion_type: 'agenda_confirmada' })
  }, [trackEvent])

  // Sin video (agenda de alumnos) se vuelve solo al inicio.
  useEffect(() => {
    if (videoUrl) return
    if (countdown === 0) {
      navigate({ to: '/' })
      return
    }
    const timer = window.setTimeout(() => setCountdown((remaining) => remaining - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, navigate, videoUrl])

  // Autoplay: primero con sonido; si el navegador lo bloquea, arranca en silencio
  // y mostramos el botón para activar el sonido.
  useEffect(() => {
    const video = videoRef.current
    if (!videoUrl || !video) return
    video.muted = false
    video.play().catch(() => {
      video.muted = true
      setMuted(true)
      void video.play().catch(() => undefined)
    })
  }, [videoUrl])

  const unmute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.currentTime = 0
    setMuted(false)
    void video.play().catch(() => undefined)
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (muted) return unmute()
    if (video.paused) void video.play().catch(() => undefined)
    else video.pause()
  }

  return (
    <main className="min-h-[100svh] bg-[#111016] text-white">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1100px] flex-col px-5 py-5 sm:px-8 sm:py-8">
        <header>
          <img src={logoSvg} alt="DemicheriFitness" className="h-6 w-auto brightness-0 invert sm:h-7" />
        </header>

        {/* Celular: título → video → próximo paso. Escritorio: texto a la izquierda, video a la derecha. */}
        <div className={`grid flex-1 content-center gap-8 py-8 sm:py-12 ${videoUrl ? 'lg:grid-cols-[1fr_auto] lg:grid-rows-[auto_auto] lg:gap-x-20 lg:gap-y-8' : ''}`}>
          <section className="order-1 mx-auto w-full max-w-[520px] text-center lg:order-none lg:col-start-1 lg:row-start-1 lg:mx-0 lg:self-end lg:text-left">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[.2em] text-[#c9b3d8]">Reserva confirmada</p>
            <h1 className="m-0 mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-.04em] sm:text-[48px]">
              ¡Tu llamada está agendada!
            </h1>

            {hasStart && start && (
              <p className="m-0 mt-4 text-[16px] text-white/80 sm:text-[18px]">
                {formatCallDate(start)} · {formatCallTime(start)} hs
                <span className="block text-[13px] text-white/45 sm:text-[14px]">Hora de Uruguay</span>
              </p>
            )}
          </section>

          <section className="order-3 mx-auto w-full max-w-[520px] lg:order-none lg:col-start-1 lg:row-start-2 lg:mx-0 lg:self-start">
            <div className="flex items-start gap-3 text-left">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#c7ebd3] text-[#176b3b]">
                <WhatsAppIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="m-0 text-[15px] font-semibold">Respondé el WhatsApp que te vamos a mandar</p>
                <p className="m-0 mt-1 text-[14px] leading-relaxed text-white/60">
                  Es para confirmar tu asistencia. Si no respondés, liberamos el horario para otra persona. El link de Google Meet te llega por email.
                </p>
              </div>
            </div>

            {hasStart && start && (
              <a
                href={googleCalendarUrl(start)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('booking_add_to_calendar', { provider: 'google' })}
                style={{ color: '#211a28' }}
                className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#c7afd8] px-6 text-[14px] font-semibold no-underline transition hover:bg-[#d8c4e5] sm:inline-flex sm:w-auto"
              >
                <CalendarIcon className="h-4 w-4" />
                Agregar a mi calendario
              </a>
            )}

            {!videoUrl && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => navigate({ to: '/' })}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-[14px] font-semibold text-white transition hover:bg-white/10"
                >
                  Volver al inicio
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
                <p className="m-0 mt-3 text-[12px] text-white/45" aria-live="polite">Irás al inicio en {countdown} segundos</p>
              </div>
            )}
          </section>

          {videoUrl && (
            <section className="order-2 mx-auto flex flex-col items-center lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center" aria-labelledby="pre-call-video-title">
              <h2 id="pre-call-video-title" className="m-0 mb-4 text-[15px] font-semibold text-white/85">
                Mirá este video antes de tu llamada 👇
              </h2>
              {/* Marco de celular */}
              <div className="relative w-[260px] rounded-[44px] bg-[#0b0a0e] p-[10px] shadow-[0_30px_80px_rgba(0,0,0,.55),0_0_0_1px_rgba(255,255,255,.12),inset_0_0_0_2px_rgba(255,255,255,.06)] sm:w-[290px]">
                <div className="relative aspect-[9/19.5] overflow-hidden rounded-[34px] bg-black">
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full cursor-pointer object-cover"
                    src={videoUrl}
                    poster={preCallPoster}
                    playsInline
                    muted={muted}
                    preload="auto"
                    onClick={togglePlay}
                    onPlay={() => { setPlaying(true); trackEvent('precall_video_play', {}) }}
                    onPause={() => setPlaying(false)}
                    onEnded={() => { setPlaying(false); trackEvent('precall_video_complete', {}) }}
                  />
                  {/* Dynamic island */}
                  <div className="pointer-events-none absolute left-1/2 top-2.5 h-[22px] w-[80px] -translate-x-1/2 rounded-full bg-black" />
                  {playing && muted && (
                    <button
                      type="button"
                      onClick={unmute}
                      className="absolute inset-x-0 bottom-6 mx-auto flex w-max items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[13px] font-semibold text-[#211a28] shadow-lg"
                    >
                      🔊 Tocá para activar el sonido
                    </button>
                  )}
                  {!playing && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label="Reproducir video"
                      className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/15"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#211a28] shadow-lg">
                        <PlayIcon className="ml-1 h-7 w-7" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 text-[13px] text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
              >
                Seguime en Instagram: @demicherifitness
              </a>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
