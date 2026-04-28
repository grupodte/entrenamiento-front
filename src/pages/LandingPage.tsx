import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import MuxPlayer from '@mux/mux-player-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'
import CasesSection from '../components/CasesSection.jsx'

gsap.registerPlugin(ScrollTrigger, useGSAP)

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
        Método Demicheri
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
    <p className="text-center text-[12px] text-[#9D9B9F] tracking-wide m-0">
      {progress === 0
        ? 'Mirá el video para desbloquear el contenido completo'
        : `Seguí mirando — el contenido se desbloquea al 75%`}
    </p>
  )
}

// ── Gated content ─────────────────────────────────────────
function GatedContent() {
  const containerRef = useRef<HTMLDivElement>(null)

  const faqs = [
    {
      q: '¿Cuánto tiempo lleva ver resultados?',
      a: 'En las primeras semanas ya notás cambios en energía y hábitos. Los cambios físicos visibles aparecen entre las semanas 4 y 8, dependiendo de tu punto de partida.',
    },
    {
      q: '¿Necesito ir al gimnasio?',
      a: 'No necesariamente. El programa se arma según lo que tenés disponible — para gimnasio o para casa. Lo definimos juntos en la llamada.',
    },
    {
      q: '¿Qué pasa si tengo poco tiempo?',
      a: 'El método está pensado para funcionar en agendas reales. Si tenés 3 días a la semana, lo hacemos funcionar.',
    },
    {
      q: '¿Cuánto cuesta el programa?',
      a: 'El valor se define en la llamada de diagnóstico, según tu situación y lo que necesitás. No hay un precio fijo porque no hay dos casos iguales. Lo que sí podés saber: la llamada es gratis y sin compromiso. Si después de hablar sentís que no es para vos, no pasa nada.',
    },
    {
      q: '¿Qué pasa si en algún momento no puedo seguir el ritmo?',
      a: 'Eso es exactamente para lo que está Dani. Si una semana se te complica el trabajo, la familia, la cabeza — ajustamos. El programa se adapta a tu vida real, no al revés. No existe el "me quedé afuera".',
    },
  ]

  useGSAP(() => {
    const sections = containerRef.current?.querySelectorAll('.reveal-section')
    if (!sections) return

    sections.forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      })
    })

    // Stagger en los bullets del método
    gsap.from('.method-bullet', {
      opacity: 0,
      x: -20,
      duration: 0.5,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.method-bullets',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="flex flex-col gap-1 sm:gap-2 mt-1 sm:mt-2">

      {/* Por qué funciona — El Método Demicheri */}
      <section className="reveal-section w-full rounded-[10px] sm:rounded-[20px] bg-[#FEFEFE] border border-[#E8E4EE] px-4 sm:px-8 md:px-10 py-10 sm:py-12 md:py-14">
        <div className="text-center">
          <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.15em] mb-3 m-0">
            Por qué funciona
          </p>
          <h2 className="text-[#1A1820] text-[24px] sm:text-[32px] md:text-[40px] font-bold leading-none mb-3 m-0">
            El Método Demicheri
          </h2>
          <p className="text-[#69686B] text-[14px] sm:text-[15px] leading-relaxed mb-8 max-w-[460px] mx-auto m-0">
            No es otro plan genérico. No es una plantilla que sirve para cualquiera.<br />Es un sistema diseñado para tu cuerpo, tu vida y tu punto de partida.
          </p>
          <ul className="method-bullets flex flex-col gap-4 text-left max-w-lg mx-auto m-0 p-0 list-none">
            {[
              { check: '✓', text: 'Tu plan, no el de otro. Personalizado desde el día uno — porque lo que funciona para otro puede estar saboteando tu progreso sin que lo sepas.' },
              { check: '✓', text: 'Dani no desaparece al tercer día. Tenés acceso directo los 60 días completos. Un mensaje, una duda, un día malo — no estás solo.' },
              { check: '✓', text: 'Nutrición que podés sostener. Sin prohibiciones absurdas ni planes de 1.200 calorías. Aprendés a comer para transformarte, no para sobrevivir la semana.' },
              { check: '✓', text: 'Seguimiento real, no una app. Revisamos tu evolución juntos. Si algo no funciona, lo cambiamos antes de que el daño esté hecho.' },
              { check: '✓', text: 'Entrenamiento desde donde estás. No importa si hace años que no te movés — el programa empieza donde estás vos, no donde debería estar alguien imaginario.' },
            ].map((item, i) => (
              <li key={i} className="method-bullet flex items-start gap-3 text-[14px] sm:text-[15px] text-[#1A1820] leading-snug">
                <span className="shrink-0 text-[#9580A6] font-bold text-[16px] mt-0.5">{item.check}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Historia — Epiphany Bridge */}
      <section className="reveal-section w-full rounded-[10px] sm:rounded-[20px] bg-[#F4F2F7] px-4 sm:px-8 md:px-10 py-10 sm:py-12 md:py-14">
        <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.15em] mb-3 m-0">
          Por qué Dani creó esto
        </p>
        <h2 className="text-[#1A1820] text-[22px] sm:text-[28px] md:text-[34px] font-bold leading-tight mb-6 m-0">
          La historia detrás del método
        </h2>
        <div className="max-w-[600px]">
          <p className="text-[#1A1820] text-[15px] sm:text-[16px] leading-relaxed m-0 border-l-[3px] border-[#9580A6] pl-5 italic">
            "Pasé años viendo la misma historia repetirse. Personas motivadas, con ganas reales de cambiar, que arrancaban con un plan y a las tres semanas lo dejaban. No porque fueran débiles. Sino porque cuando la vida se complicó, no había nadie del otro lado.
            <br /><br />
            Yo mismo lo viví — empecé siguiendo planes de internet y me perdí cien veces antes de entender que el conocimiento solo no alcanza. Necesitás a alguien que te acompañe en tiempo real.
            <br /><br />
            Eso me llevó a diseñar algo diferente: un programa donde yo estoy presente los 60 días completos. No te mando un PDF y desaparezco. Estoy ahí. Desde que empecé a trabajar así, los resultados de mis clientes dejaron de ser la excepción. Empezaron a ser la norma."
          </p>
          <p className="text-[#9580A6] font-bold text-[13px] mt-4 m-0">— Dani Demicheri, coach personal</p>
        </div>
      </section>

      {/* Resultados reales */}
      <div
        className="reveal-section w-full rounded-[10px] sm:rounded-[20px] px-4 sm:px-8 md:px-10 pt-8 sm:pt-10 pb-0"
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
      <section className="reveal-section w-full rounded-[10px] sm:rounded-[20px] bg-[#9580A6] px-4 sm:px-8 md:px-10 py-12 sm:py-14 md:py-16 flex flex-col items-center text-center">
        <p className="text-white/65 text-[11px] font-bold uppercase tracking-[0.15em] mb-3 m-0">
          Cupos limitados — atención 1:1 real
        </p>
        <h2 className="text-white text-[24px] sm:text-[32px] md:text-[42px] font-bold leading-none mb-4 m-0">
          Si llegaste hasta acá, algo en vos sabe que es el momento.
        </h2>
        <p className="text-white/70 text-[14px] sm:text-[15px] leading-snug mb-2 max-w-[420px] m-0">
          Los cupos son limitados porque Dani trabaja con atención 1:1 real — no escala con más clientes si no puede acompañarlos bien. Cuando se llena, se llena.
        </p>
        <p className="text-white/50 text-[13px] leading-snug mb-8 max-w-[380px] m-0">
          Una llamada de 20 minutos, sin costo, sin presión. Contás tu situación, Dani te dice si el programa es para vos.
        </p>
        <Link
          to="/pre-call"
          className="bg-white text-[#1A1820] font-bold text-[13px] uppercase tracking-widest py-4 px-10 rounded-[8px] hover:bg-white/90 transition-colors"
        >
          Reservar mi llamada de diagnóstico →
        </Link>
      </section>

      {/* Proceso en 3 pasos */}
      <section className="reveal-section w-full rounded-[10px] sm:rounded-[20px] bg-[#F4F2F7] px-4 sm:px-8 md:px-10 py-10 sm:py-12 md:py-14">
        <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.15em] mb-3 m-0">
          ¿Qué pasa después?
        </p>
        <h2 className="text-[#1A1820] text-[24px] sm:text-[32px] md:text-[38px] font-bold leading-none mb-8 m-0">
          Así empieza tu transformación
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              n: '01',
              title: 'Contás tu situación',
              desc: 'Completás unas preguntas rápidas para que Dani entienda tu punto de partida antes de hablar. No es una encuesta genérica — son 5 preguntas que hacen la diferencia.',
            },
            {
              n: '02',
              title: 'Hablás con Dani',
              desc: 'Elegís el horario que te queda bien. Es una conversación real, sin scripts, sin presión. Dani escucha tu caso y te dice con honestidad si el programa es la solución.',
            },
            {
              n: '03',
              title: 'Arrancás en 48 horas',
              desc: 'Si decidís avanzar, en menos de dos días tenés tu plan listo y personalizado. Desde ese momento, Dani está disponible. Empieza el acompañamiento real.',
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

      {/* FAQ */}
      <section className="reveal-section w-full rounded-[10px] sm:rounded-[20px] bg-[#1A1820] px-4 sm:px-8 md:px-10 py-10 sm:py-12 md:py-14">
        <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.15em] mb-3 m-0">
          Tus dudas
        </p>
        <h2 className="text-white text-[22px] sm:text-[28px] md:text-[36px] font-bold leading-none mb-8 m-0">
          Las respondemos antes de que preguntes.
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
      <section className="reveal-section w-full rounded-[10px] sm:rounded-[20px] bg-[#FEFEFE] border border-[#E8E4EE] px-4 sm:px-8 md:px-10 py-12 sm:py-14 md:py-16 flex flex-col items-center text-center">
        <h2 className="text-[#1A1820] text-[22px] sm:text-[30px] md:text-[40px] font-bold leading-none mb-3 m-0">
          En 60 días podés estar del otro lado.<br />
          <span className="text-[#9580A6]">La pregunta es si arrancás hoy.</span>
        </h2>
        <p className="text-[#69686B] text-[14px] sm:text-[15px] leading-snug mb-4 max-w-[400px] m-0">
          Cada mes que pasa sin un plan real es un mes más cargando con lo mismo. No hace falta que estés listo al cien por ciento — hace falta que des el primer paso.
        </p>
        <p className="text-[#9580A6] text-[13px] font-bold mb-8 max-w-[380px] m-0">
          Imaginá llegar al día 60 sintiéndote diferente en tu cuerpo, en tu energía, en cómo te ves. Eso empieza con una conversación de 20 minutos.
        </p>
        <Link
          to="/pre-call"
          className="bg-[#1A1820] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-10 rounded-[8px] hover:bg-[#2e2b36] transition-colors"
        >
          Quiero hablar con Dani →
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

  const handleTimeUpdate = (evt: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = evt.currentTarget as HTMLVideoElement
    if (!el.duration) return

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
    <div className="min-h-[100dvh] flex flex-col bg-[#FEFEFE]">
      <FunnelHeader />

      <main
        className={`flex flex-col w-full mx-auto px-3 sm:px-5 ${
          isLocked
            ? 'max-w-[1200px] flex-1 py-3 sm:py-4'
            : 'max-w-[820px] flex-1 pt-6 sm:pt-8 pb-8 md:pb-12'
        }`}
      >
        <div className={`flex flex-col ${isLocked ? 'w-full gap-2 sm:gap-3' : 'gap-3 sm:gap-4'}`}>

          {/* Hero */}
          <div className={`text-center ${isLocked ? 'max-w-[820px] mx-auto py-0' : 'py-4 sm:py-6'}`}>
            <p className={`text-[#9580A6] font-bold uppercase tracking-[0.2em] m-0 ${isLocked ? 'text-[10px] mb-2' : 'text-[11px] mb-3'}`}>
              DemicheriFitness
            </p>
            <h1 className={`text-[#1A1820] font-bold leading-none mb-3 m-0 ${
              isLocked ? 'text-[22px] sm:text-[38px] md:text-[52px]' : 'text-[32px] sm:text-[44px] md:text-[52px]'
            }`}>
              Transformá tu cuerpo en 60 días — con alguien que no desaparece cuando las cosas se ponen difíciles.
            </h1>
            {!isLocked && (
              <p className="text-[#69686B] text-[15px] sm:text-[17px] leading-relaxed mx-auto m-0 max-w-[520px]">
                Imaginá terminar estos 60 días sintiéndote liviano, con energía de sobra y mirándote al espejo sin esquivar lo que ves. Sin dieta de moda. Sin romperte. Solo con un plan tuyo y alguien que estuvo ahí cada día.
              </p>
            )}
          </div>

          <div className="w-full mx-auto">
            {/* Video */}
            <div
              ref={videoWrapperRef}
              className="relative rounded-[10px] sm:rounded-[10px] overflow-hidden bg-[#1A1820] mx-auto w-full"
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
                  <div
                    className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
                    onClick={handleVideoClick}
                    aria-label="Reproducir / Pausar"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleVideoClick() : undefined}
                  >
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
              <div className="mt-2">
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

    </div>
  )
}
