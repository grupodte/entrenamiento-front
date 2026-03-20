import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import MuxPlayer from '@mux/mux-player-react'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'
import CasesSection from '../components/CasesSection.jsx'

// ── Config ────────────────────────────────────────────────
const MUX_PLAYBACK_ID = import.meta.env.VITE_MUX_PLAYBACK_ID as string | undefined
const LOCK_KEY = 'dmf_landing_unlocked_v1'
const MAX_SEEK_AHEAD_SECONDS = 5

// ── Minimal funnel header ─────────────────────────────────
function FunnelHeader() {
  return (
    <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#E8E4EE] bg-[#FEFEFE]">
      <img src={logoSvg} alt="DemicheriFitness" className="h-[20px] w-auto" />
      <span className="text-[#69686B] text-[11px] font-bold uppercase tracking-[0.18em]">
        Método DemicheriFitness
      </span>
    </header>
  )
}

// ── Progress bar ──────────────────────────────────────────
function VideoProgressBar({ progress, unlocked }: { progress: number; unlocked: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative h-1.5 bg-[#E8E4EE] rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: unlocked ? '#22c55e' : '#9580A6' }}
        />
        {!unlocked && (
          <div
            className="absolute top-0 h-full w-[2px] bg-[#1A1820]/25"
            style={{ left: '75%' }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#69686B]">
          {unlocked ? (
            <span className="text-green-600 font-bold">✓ Contenido desbloqueado</span>
          ) : (
            <>
              <span className="font-bold text-[#1A1820]">{progress}%</span> reproducido · desbloqueo al{' '}
              <span className="font-bold text-[#9580A6]">75%</span>
            </>
          )}
        </span>
        {!unlocked && progress > 0 && progress < 75 && (
          <span className="text-[11px] text-[#9D9B9F]">Faltan {75 - progress}%</span>
        )}
      </div>
    </div>
  )
}

// ── Lock hint ─────────────────────────────────────────────
function LockedHint({ progress }: { progress: number }) {
  return (
    <div className="rounded-[10px] sm:rounded-[14px] border border-[#E8E4EE] bg-[#F4F2F7] px-4 sm:px-5 py-3 flex items-start gap-2.5">
      <span className="text-[17px] mt-0.5 shrink-0" aria-hidden="true">🔒</span>
      <div>
        <p className="text-[#1A1820] text-[12px] sm:text-[13px] font-bold m-0 mb-0.5">
          El resto del contenido está más abajo.
        </p>
        <p className="text-[#69686B] text-[11px] sm:text-[12px] m-0">
          {progress === 0
            ? 'Mirá el video para desbloquear la información completa del método.'
            : `Seguí mirando hasta el 75% para continuar. Ya vas por el ${progress}%.`}
        </p>
      </div>
    </div>
  )
}

// ── Gated content ─────────────────────────────────────────
function GatedContent() {
  const faqs = [
    {
      q: '¿Cuánto tiempo lleva ver resultados?',
      a: 'En las primeras semanas ya notás cambios en energía y hábitos. Los cambios físicos visibles aparecen entre las semanas 4 y 8, dependiendo de tu punto de partida.',
    },
    {
      q: '¿Necesito ir al gimnasio?',
      a: 'No necesariamente. El plan se arma según lo que tenés disponible. Lo importante es tener algo con qué trabajar.',
    },
    {
      q: '¿Qué pasa si tengo poco tiempo?',
      a: 'El método está pensado para funcionar en agendas reales. Si tenés 3 días a la semana, lo hacemos funcionar.',
    },
  ]

  return (
    <div className="flex flex-col gap-1 sm:gap-2 mt-1 sm:mt-2">

      {/* Propuesta resumida */}
      <section className="w-full rounded-[10px] sm:rounded-[20px] bg-[#FEFEFE] border border-[#E8E4EE] px-4 sm:px-8 md:px-10 py-10 sm:py-12 md:py-14">
        <div className="text-center">
          <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.15em] mb-3 m-0">
            Esto es lo que viste
          </p>
          <h2 className="text-[#1A1820] text-[24px] sm:text-[32px] md:text-[40px] font-bold leading-none mb-8 m-0">
            El método que funciona<br />cuando los otros fallan.
          </h2>
          <ul className="flex flex-col gap-4 text-left max-w-lg mx-auto m-0 p-0 list-none">
            {[
              'Plan personalizado desde el primer día, sin plantillas genéricas.',
              'Seguimiento real durante los 2 meses completos del proceso.',
              'Nutrición que se adapta a tu vida real, no al revés.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] sm:text-[15px] text-[#1A1820] leading-snug">
                <span className="shrink-0 text-[#9580A6] font-bold text-[16px] mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Resultados reales */}
      <div
        className="w-full rounded-[10px] sm:rounded-[20px] px-4 sm:px-8 md:px-10 pt-8 sm:pt-10 pb-0"
        style={{ backgroundColor: '#F4F2F7' }}
      >
        <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.15em] mb-2 m-0">
          Casos reales
        </p>
        <h2 className="text-[#1A1820] text-[24px] sm:text-[32px] md:text-[38px] font-bold leading-none m-0">
          Resultados concretos.<br />
          <span className="text-[#C4BBCE]">No promesas.</span>
        </h2>
        <CasesSection />
      </div>

      {/* CTA principal */}
      <section className="w-full rounded-[10px] sm:rounded-[20px] bg-[#9580A6] px-4 sm:px-8 md:px-10 py-12 sm:py-14 md:py-16 flex flex-col items-center text-center">
        <p className="text-white/65 text-[11px] font-bold uppercase tracking-[0.15em] mb-3 m-0">
          El siguiente paso
        </p>
        <h2 className="text-white text-[24px] sm:text-[32px] md:text-[42px] font-bold leading-none mb-4 m-0">
          ¿Listo para arrancar?
        </h2>
        <p className="text-white/60 text-[14px] sm:text-[15px] leading-snug mb-8 max-w-[400px] m-0">
          El siguiente paso toma 2 minutos. Te hacemos algunas preguntas para preparar bien tu llamada.
        </p>
        <Link
          to="/pre-call"
          className="bg-[#1A1820] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-10 rounded-[8px] hover:bg-black transition-colors"
        >
          Quiero empezar →
        </Link>
      </section>

      {/* Proceso en 2 pasos */}
      <section className="w-full rounded-[10px] sm:rounded-[20px] bg-[#F4F2F7] px-4 sm:px-8 md:px-10 py-10 sm:py-12 md:py-14">
        <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.15em] mb-3 m-0">
          ¿Cómo funciona el próximo paso?
        </p>
        <h2 className="text-[#1A1820] text-[24px] sm:text-[32px] md:text-[38px] font-bold leading-none mb-8 m-0">
          Dos pasos simples.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            {
              n: '01',
              title: 'Formulario breve',
              desc: 'Completás unas preguntas rápidas para que podamos preparar bien la llamada. Toma menos de 2 minutos.',
            },
            {
              n: '02',
              title: 'Agendás tu llamada',
              desc: 'Elegís el día y horario que mejor te queda. En la llamada definimos si el método es para vos.',
            },
          ].map((s) => (
            <div key={s.n} className="bg-[#FEFEFE] border border-[#E8E4EE] rounded-[8px] sm:rounded-[14px] p-5 sm:p-6">
              <span className="block text-[#9580A6] text-[40px] font-bold leading-none mb-3">{s.n}</span>
              <h3 className="text-[#1A1820] text-[16px] sm:text-[17px] font-bold leading-tight mb-2 m-0">{s.title}</h3>
              <p className="text-[#69686B] text-[13px] sm:text-[14px] leading-relaxed m-0">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Objeciones */}
      <section className="w-full rounded-[10px] sm:rounded-[20px] bg-[#1A1820] px-4 sm:px-8 md:px-10 py-10 sm:py-12 md:py-14">
        <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.15em] mb-3 m-0">
          Antes de arrancar
        </p>
        <h2 className="text-white text-[22px] sm:text-[28px] md:text-[36px] font-bold leading-none mb-8 m-0">
          Preguntas frecuentes.
        </h2>
        <div className="flex flex-col gap-5">
          {faqs.map((f, i) => (
            <div key={i} className="border-t border-white/[0.08] pt-5">
              <p className="text-white font-bold text-[14px] sm:text-[15px] mb-1.5 m-0">{f.q}</p>
              <p className="text-white/50 text-[13px] sm:text-[14px] leading-relaxed m-0">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="w-full rounded-[10px] sm:rounded-[20px] bg-[#FEFEFE] border border-[#E8E4EE] px-4 sm:px-8 md:px-10 py-12 sm:py-14 md:py-16 flex flex-col items-center text-center">
        <h2 className="text-[#1A1820] text-[22px] sm:text-[30px] md:text-[40px] font-bold leading-none mb-3 m-0">
          Ya viste el método.<br />El resto depende de vos.
        </h2>
        <p className="text-[#69686B] text-[14px] sm:text-[15px] leading-snug mb-8 max-w-[360px] m-0">
          Los cupos son limitados. La atención es personal.
        </p>
        <Link
          to="/pre-call"
          className="bg-[#9580A6] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-10 rounded-[8px] hover:bg-[#7A6A8F] transition-colors"
        >
          Quiero empezar ahora →
        </Link>
      </section>

    </div>
  )
}

// ── Main page ─────────────────────────────────────────────
export default function LandingPage() {
  const [videoProgress, setVideoProgress] = useState(0)
  const [unlocked, setUnlocked] = useState(() => {
    try { return localStorage.getItem(LOCK_KEY) === '1' } catch { return false }
  })
  const [isPaused, setIsPaused] = useState(true)
  const isLocked = !unlocked
  const maxWatched = useRef(0)
  const videoWrapperRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const muxRef = useRef<any>(null)

  const handleVideoClick = () => {
    const el = muxRef.current
    if (!el) return
    if (el.paused) { el.play(); setIsPaused(false) }
    else { el.pause(); setIsPaused(true) }
  }

  const handleFullscreen = () => {
    const el = muxRef.current ?? videoWrapperRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }

  useEffect(() => {
    if (unlocked) {
      try { localStorage.setItem(LOCK_KEY, '1') } catch {}
    }
  }, [unlocked])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!isLocked) return

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverscroll = document.body.style.overscrollBehavior
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overscrollBehavior = 'none'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overscrollBehavior = previousBodyOverscroll
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll
    }
  }, [isLocked])

  const handleTimeUpdate = (evt: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = evt.currentTarget as HTMLVideoElement
    if (!el.duration) return

    // Prevent significant seek-ahead
    if (el.currentTime > maxWatched.current + MAX_SEEK_AHEAD_SECONDS) {
      el.currentTime = maxWatched.current
      return
    }

    maxWatched.current = Math.max(maxWatched.current, el.currentTime)
    const pct = Math.min(Math.round((maxWatched.current / el.duration) * 100), 100)
    setVideoProgress(pct)

    if (pct >= 75 && !unlocked) {
      setUnlocked(true)
    }
  }

  return (
    <div className={`${isLocked ? 'h-dvh overflow-hidden' : 'min-h-screen'} flex flex-col bg-[#FEFEFE]`}>
      <FunnelHeader />

      <main
        className={`flex flex-col w-full mx-auto px-3 sm:px-5 ${
          isLocked
            ? 'max-w-[1000px] flex-1 overflow-hidden py-2 sm:py-3'
            : 'max-w-[820px] flex-1 pt-6 sm:pt-8 pb-8 md:pb-12'
        }`}
      >
        <div className={`flex flex-col ${isLocked ? 'w-full my-auto gap-2 sm:gap-2.5' : 'gap-3 sm:gap-4'}`}>

          {/* Hero context */}
          <div className={`text-center ${isLocked ? 'max-w-[820px] mx-auto py-0.5 sm:py-1' : 'py-4 sm:py-6'}`}>
            <p className={`text-[#9580A6] font-bold uppercase tracking-[0.2em] m-0 ${isLocked ? 'text-[10px] mb-2' : 'text-[11px] mb-3'}`}>
              DemicheriFitness
            </p>
            <h1 className={`text-[#1A1820] font-bold leading-none mb-3 m-0 ${
              isLocked ? 'text-[20px] sm:text-[26px] md:text-[30px]' : 'text-[26px] sm:text-[36px] md:text-[44px]'
            }`}>
              Lo que nadie te dijo<br />sobre entrenar con resultados reales.
            </h1>
            {!isLocked && (
              <p className="text-[#69686B] text-[14px] sm:text-[16px] leading-snug mx-auto m-0 max-w-[500px]">
                Mirá el video antes de continuar. Te explica exactamente cómo funciona el método y por qué la mayoría de las personas no llegan a sus objetivos.
              </p>
            )}
          </div>

          <div className={`w-full mx-auto ${isLocked ? 'max-w-[780px]' : ''}`}>
            {/* Video */}
            <div
              ref={videoWrapperRef}
              className="relative rounded-[10px] sm:rounded-[10px] overflow-hidden bg-[#1A1820] mx-auto w-full"
              style={isLocked ? { width: 'min(100%, calc(380vh * 16 / 9))' } : undefined}
            >
              {MUX_PLAYBACK_ID ? (
                <>
                  <MuxPlayer
                    ref={muxRef}
                    playbackId={MUX_PLAYBACK_ID}
                    defaultPlaybackRate={1.2}
                    nohotkeys
                    style={{
                      width: '100%',
                      display: 'block',
                      aspectRatio: '16/9',
                    } as React.CSSProperties}
                    // @ts-expect-error mux-player extends HTMLVideoElement events
                    onTimeUpdate={handleTimeUpdate}
                    metadata={{ video_title: 'DemicheriFitness – Método' }}
                    accentColor="#9580A6"
                  />
                  {/* Overlay transparente — captura clicks para play/pause */}
                  <div
                    className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
                    onClick={handleVideoClick}
                    aria-label="Reproducir / Pausar"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleVideoClick() : undefined}
                  >
                    {/* Botón play central — visible solo cuando está pausado */}
                    <div
                      className={`transition-all duration-200 ${
                        isPaused ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                      }`}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 28 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          className="translate-x-[2px]"
                        >
                          <path d="M8 5L23 14L8 23V5Z" fill="#1A1820" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Botón pantalla completa */}
                  <button
                    onClick={handleFullscreen}
                    aria-label="Pantalla completa"
                    className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded bg-black/50 text-white hover:bg-black/75 transition-colors z-20"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M1 5V1H5M9 1H13V5M13 9V13H9M5 13H1V9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 bg-[#1A1820] text-center px-6">
                  <div className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center">
                    <span className="text-xl text-white/40">▶</span>
                  </div>
                  <p className="text-white/40 text-[13px] m-0">
                    Video no configurado. Agregá{' '}
                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-[#9580A6]">VITE_MUX_PLAYBACK_ID</code>
                    {' '}en{' '}
                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/60">.env</code>
                  </p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className={isLocked ? 'mt-2' : 'mt-3'}>
              <VideoProgressBar progress={videoProgress} unlocked={unlocked} />
            </div>

            {/* Lock hint */}
            {!unlocked && (
              <div className={isLocked ? 'mt-2' : 'mt-3'}>
                <LockedHint progress={videoProgress} />
              </div>
            )}
          </div>

          {/* Gated content — smooth reveal */}
          <div
            className={`grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-700 ease-out ${
              unlocked
                ? 'grid-rows-[1fr] opacity-100 translate-y-0 pointer-events-auto'
                : 'grid-rows-[0fr] opacity-0 translate-y-8 pointer-events-none select-none'
            }`}
            aria-hidden={!unlocked}
          >
            <div className="min-h-0 overflow-hidden">
              <GatedContent />
            </div>
          </div>

        </div>
      </main>

      {unlocked && (
        <footer className="w-full shrink-0 border-t border-[#E8E4EE] px-4 py-3 text-center">
          <p className="text-[11px] text-[#9D9B9F] m-0">
            © DemicheriFitness · Todos los derechos reservados
          </p>
        </footer>
      )}
    </div>
  )
}
