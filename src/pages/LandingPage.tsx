import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import MuxPlayer from '@mux/mux-player-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSEO } from '../lib/useSEO'
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
      <div className="flex items-center justify-center">
        <span className="text-[11px] text-[#9D9B9F]">
          {unlocked ? (
            <span className="text-green-600 font-medium">✓ Contenido desbloqueado</span>
          ) : (
            <>Mirá hasta el 75% para desbloquear el método completo</>
          )}
        </span>
      </div>
    </div>
  )
}


// ── Scroll hint ───────────────────────────────────────────
function ScrollHint({ active }: { active: boolean }) {
  const arrowRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!active) { setHidden(false); return }
    const onScroll = () => { if (window.scrollY > 80) setHidden(true) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [active])

  useGSAP(() => {
    if (!arrowRef.current) return
    gsap.to(arrowRef.current, {
      y: 6,
      duration: 0.8,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
  }, { scope: arrowRef })

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 transition-[opacity,transform] duration-500 ${
        active && !hidden ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
      aria-hidden="true"
    >
      <span className="text-[10px] text-[#9D9B9F] uppercase tracking-widest bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-[#E8E4EE]">
        Scrolleá para ver más
      </span>
      <div ref={arrowRef}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6L9 12L15 6" stroke="#C4BBCE" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

// ── Gated content ─────────────────────────────────────────
function GatedContent() {
  const containerRef = useRef<HTMLDivElement>(null)

  const faqs = [
    {
      q: '¿Cuándo veo resultados?',
      a: 'Semanas 1-3: cambios en energía y hábitos. Semanas 4-8: transformación física visible. Depende de dónde arrancas, pero los resultados llegan.',
    },
    {
      q: '¿Necesito gimnasio?',
      a: 'No. El programa funciona en casa o en el gym. Lo armamos según lo que tenés disponible. Sin excusas.',
    },
    {
      q: '¿Y si tengo poco tiempo?',
      a: '3 días a la semana. 30-45 minutos. El método funciona en la vida real, no en la imaginación.',
    },
    {
      q: '¿Cuánto cuesta?',
      a: 'Depende de tu caso. La llamada inicial es gratis. Sin compromiso. Si después de hablar no es para vos, no pasó nada.',
    },
    {
      q: '¿Qué pasa si una semana se desmorona?',
      a: 'Para eso está Dani. Una semana complicada, trabajo, familia, lo que sea — ajustamos. El programa se adapta a tu vida. No existe "me quedé afuera".',
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
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: 'top 95%',
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
      immediateRender: false,
      scrollTrigger: {
        trigger: '.method-bullets',
        start: 'top 95%',
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
            Cómo funciona
          </p>
          <h2 className="text-[#1A1820] text-[24px] sm:text-[32px] md:text-[40px] font-bold leading-none mb-3 m-0">
            El sistema que realmente transforma
          </h2>
          <p className="text-[#69686B] text-[14px] sm:text-[15px] leading-relaxed mb-8 max-w-[460px] mx-auto m-0">
            No es un plan genérico. No es lo mismo para todos. Es tu sistema, diseñado para tu cuerpo, tu vida real y tu punto de partida exacto.
          </p>
          <ul className="method-bullets flex flex-col gap-4 text-left max-w-lg mx-auto m-0 p-0 list-none">
            {[
              { check: '✓', text: 'Tu plan, único. Personalizado desde el día uno. No funciona igual para dos personas — por eso no es igual para todos.' },
              { check: '✓', text: 'Dani está presente 60 días. Acceso directo. Un mensaje, una duda, un día complicado — respondes antes de que abandones.' },
              { check: '✓', text: 'Nutrición real. Sin prohibiciones absurdas. Aprendés a comer bien, no a sufrir 60 días.' },
              { check: '✓', text: 'Seguimiento real, no solo números. Si algo no funciona, lo cambiamos en tiempo real. No esperas 4 semanas para descubrir que fallaste.' },
              { check: '✓', text: 'Entreno desde donde estás. Sin importar si hace años no te movés. El programa empieza en tu realidad, no en la imaginación.' },
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
          Por qué Dani hace esto diferente
        </h2>
        <div className="max-w-[600px] flex flex-col gap-6">
          <p className="text-[#1A1820] text-[15px] sm:text-[16px] leading-relaxed m-0 border-l-[3px] border-[#9580A6] pl-5 italic">
            "Un cliente con toda la motivación del mundo me escribió a las tres semanas: 'Lo dejo.' No porque el plan fuera malo. Una semana complicada en el trabajo, se desmoronó, y no había nadie que le dijera qué hacer. Se cayó. No pudo levantarse solo.
          </p>
          <p className="text-[#1A1820] text-[15px] sm:text-[16px] leading-relaxed m-0 border-l-[3px] border-[#9580A6] pl-5 italic">
            Ese día entendí: el problema no es el conocimiento. La gente sabe que necesita moverse y comer bien. Lo que falta es alguien presente cuando todo se tuerce. Y se tuerce siempre.
          </p>
          <p className="text-[#1A1820] text-[15px] sm:text-[16px] leading-relaxed m-0 border-l-[3px] border-[#9580A6] pl-5 italic">
            Yo viví lo mismo años. Seguía planes de internet, arrancaba fuerte, una complicación llegaba y no había nadie. Me perdía. De nuevo. Y de nuevo. Eso no es debilidad. Es lo que pasa cuando no tenés un coach.
          </p>
          <p className="text-[#1A1820] text-[15px] sm:text-[16px] leading-relaxed m-0 border-l-[3px] border-[#9580A6] pl-5 italic">
            Cambié. Dejé de mandar PDFs y desaparecer. Ahora estoy presente 60 días: ajustando, respondiendo, acompañando en tiempo real. Los resultados de mis clientes dejaron de ser la excepción. Son la norma."
          </p>
          <p className="text-[#9580A6] font-bold text-[13px] m-0">— Dani Demicheri, coach personal</p>
        </div>
      </section>

      {/* Resultados reales */}
      <div
        className="reveal-section w-full rounded-[10px] sm:rounded-[20px] px-4 sm:px-8 md:px-10 pt-8 sm:pt-10 pb-0"
        style={{ backgroundColor: '#F4F2F7' }}
      >
        <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.15em] mb-2 m-0">
          Prueba real
        </p>
        <h2 className="text-[#1A1820] text-[24px] sm:text-[32px] md:text-[38px] font-bold leading-none m-0">
          +500 transformaciones.<br />
          <span className="text-[#C4BBCE]">Esto es lo que funciona.</span>
        </h2>
        <CasesSection />
      </div>

      {/* CTA principal */}
      <section className="reveal-section w-full rounded-[10px] sm:rounded-[20px] bg-[#9580A6] px-4 sm:px-8 md:px-10 py-12 sm:py-14 md:py-16 flex flex-col items-center text-center">
        <p className="text-white/65 text-[11px] font-bold uppercase tracking-[0.15em] mb-3 m-0">
          Cupos limitados — solo atención personal
        </p>
        <h2 className="text-white text-[24px] sm:text-[32px] md:text-[42px] font-bold leading-none mb-4 m-0">
          Dani solo trabaja con quien realmente lo necesita.
        </h2>
        <p className="text-white/70 text-[14px] sm:text-[15px] leading-snug mb-2 max-w-[420px] m-0">
          No escalamos con más clientes. Cuando no hay lugar, no hay lugar. La atención 1:1 real no se improvisa.
        </p>
        <p className="text-white/50 text-[13px] leading-snug mb-8 max-w-[380px] m-0">
          Llamada de 20 minutos. Gratis. Sin presión. Contás tu caso, Dani te dice si es para vos.
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
          Próximos pasos
        </p>
        <h2 className="text-[#1A1820] text-[24px] sm:text-[32px] md:text-[38px] font-bold leading-none mb-8 m-0">
          De aquí a la transformación
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              n: '01',
              title: 'Contás tu caso',
              desc: '5 preguntas rápidas. Dani entiende tu punto de partida, qué intentaste, dónde te quedaste atrapado.',
            },
            {
              n: '02',
              title: 'Hablás con Dani',
              desc: 'Sin scripts. Sin presión. Dani escucha y te dice directo si es para vos o no. Honestidad. Punto.',
            },
            {
              n: '03',
              title: 'Empezás en 48h',
              desc: 'Tu plan personalizado listo. Dani está disponible. Comienza el acompañamiento real.',
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
          Preguntas frecuentes
        </p>
        <h2 className="text-white text-[22px] sm:text-[28px] md:text-[36px] font-bold leading-none mb-8 m-0">
          Todo lo que necesitas saber.
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
          Día 60 transformado.<br />
          <span className="text-[#9580A6]">¿Hoy es el día?</span>
        </h2>
        <p className="text-[#69686B] text-[14px] sm:text-[15px] leading-snug mb-4 max-w-[400px] m-0">
          Cada mes sin acción es un mes más igual. No necesitas estar 100% listo. Necesitas empezar hoy.
        </p>
        <p className="text-[#9580A6] text-[13px] font-bold mb-8 max-w-[380px] m-0">
          Cuerpo transformado. Energía real. Otra forma de verte. Una llamada de 20 minutos empieza todo.
        </p>
        <Link
          to="/pre-call"
          className="bg-[#9580A6] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-10 rounded-[8px] hover:bg-[#7A6A8F] transition-colors"
        >
          Quiero hablar con Dani →
        </Link>
      </section>

    </div>
  )
}

// ── Main page ─────────────────────────────────────────────
export default function LandingPage() {
  // SEO Configuration
  useSEO({
    title: 'Transforma tu cuerpo en 60 días - Demicheri Fitness',
    description: '+500 transformaciones reales. Método comprobado con seguimiento 1:1. Sin dietas imposibles. Resultados garantizados.',
    canonical: 'https://demicherifitness.com/landing-page',
    ogTitle: 'Transforma tu cuerpo en 60 días',
    ogDescription: '+500 transformaciones reales con un coach presente cada día.',
  })

  const [videoProgress, setVideoProgress] = useState(0)
  const [unlocked, setUnlocked] = useState(() => {
    try { return localStorage.getItem(LOCK_KEY) === '1' } catch { return false }
  })
  const [isPaused, setIsPaused] = useState(true)
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
      // Wait for the 700ms grid transition to finish, then recalculate all ScrollTrigger positions
      const t = setTimeout(() => ScrollTrigger.refresh(), 750)
      return () => clearTimeout(t)
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
    <div className="min-h-[100dvh] bg-[#FEFEFE]">
      <FunnelHeader />

      <main className="flex flex-col w-full max-w-[820px] mx-auto px-3 sm:px-5 pt-6 sm:pt-8 pb-8 md:pb-12">
        <div className="flex flex-col gap-3 sm:gap-4">

          {/* Hero */}
          <div className="text-center py-2 sm:py-4">
            <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.2em] mb-3 m-0">
              DemicheriFitness
            </p>
            <h1 className="text-[#1A1820] text-[32px] sm:text-[44px] md:text-[52px] font-bold leading-none mb-3 m-0">
              Transforma tu cuerpo en 60 días. Sin dietas. Con un coach que te mira.
            </h1>
            <p className="text-[#9580A6] text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.15em] mb-3 m-0">
              +500 transformaciones reales · Seguimiento 1:1 · Resultados comprobados
            </p>
            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
              unlocked ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}>
              <div className="min-h-0 overflow-hidden">
                <p className="text-[#69686B] text-[15px] sm:text-[17px] leading-relaxed mx-auto m-0 max-w-[520px] pt-1 pb-2">
                  En 60 días: un cuerpo transformado, energía real y una forma diferente de verte en el espejo. Sin dietas imposibles. Sin sufrimiento. Con un plan tuyo y alguien presente cada paso del camino.
                </p>
              </div>
            </div>
          </div>

          {/* Pre-video curiosity gap — se oculta al desbloquear */}
          {!unlocked && (
            <p className="text-center text-[#69686B] text-[14px] sm:text-[15px] leading-relaxed max-w-[480px] mx-auto m-0">
              Mira hasta el final y descubre por qué el 90% fracasa — y cómo tú no lo harás.
            </p>
          )}

          <div className="w-full mx-auto">
            {/* Video */}
            <div
              ref={videoWrapperRef}
              className="relative rounded-[10px] overflow-hidden bg-[#1A1820] mx-auto w-full"
            >
              {MUX_PLAYBACK_ID ? (
                <>
                  <MuxPlayer
                    ref={muxRef}
                    playbackId={MUX_PLAYBACK_ID}
                    poster={`https://image.mux.com/${MUX_PLAYBACK_ID}/thumbnail.jpg?time=0`}
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
            <div className="mt-2">
              <VideoProgressBar progress={videoProgress} unlocked={unlocked} />
            </div>

          </div>

          {/* Scroll hint — aparece al desbloquear el contenido */}
          <ScrollHint active={unlocked} />

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
