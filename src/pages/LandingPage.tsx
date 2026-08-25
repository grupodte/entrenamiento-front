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

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── Display headline: revelado línea por línea desde máscara ──
function Display({
  lines,
  className = '',
  as: Tag = 'h2',
  style,
}: {
  lines: string[]
  className?: string
  as?: 'h1' | 'h2'
  style?: React.CSSProperties
}) {
  return (
    <Tag data-display-title className={`ln-display m-0 ${className}`} style={style}>
      {lines.map((line, i) => (
        <span key={i} className="ln-mask">
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  )
}

// ── Hairline de progreso de scroll ────────────────────────
function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!barRef.current || prefersReducedMotion()) return
    gsap.to(barRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    })
  }, { scope: barRef })

  return <div ref={barRef} className="ln-progress" aria-hidden="true" />
}

// ── Navegación mínima sobre el hero carbón ────────────────
function FunnelHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between">
      <img src={logoSvg} alt="DemicheriFitness" className="h-[18px] sm:h-[22px] w-auto brightness-0 invert" />
      <Link to="/pre-call" className="ln-pill ln-pill--ghost hidden sm:inline-flex">
        Hablar con Dani
        <span className="ln-pill__arrow" aria-hidden="true">→</span>
      </Link>
    </header>
  )
}

// ── Barra de progreso del video ───────────────────────────
function VideoProgressBar({ progress, unlocked }: { progress: number; unlocked: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative h-[3px] rounded-full overflow-hidden bg-white/[0.12]">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-300 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: unlocked ? 'var(--ln-go)' : 'var(--ln-lila-bright)',
          }}
        />
        {!unlocked && (
          <div
            className="absolute top-0 h-full w-px bg-white/35"
            style={{ left: '45%' }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
          {unlocked ? 'Método completo' : `${progress}% visto`}
        </span>
        <span className="text-[11px] text-white/45 text-right">
          {unlocked ? (
            <span className="font-bold" style={{ color: 'var(--ln-go)' }}>
              ✓ Contenido desbloqueado
            </span>
          ) : (
            'Mirá hasta el 45% para desbloquear el método'
          )}
        </span>
      </div>
    </div>
  )
}

// ── Indicador de scroll tras el desbloqueo ────────────────
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
    if (!arrowRef.current || prefersReducedMotion()) return
    gsap.to(arrowRef.current, { y: 6, duration: 0.8, ease: 'sine.inOut', repeat: -1, yoyo: true })
  }, { scope: arrowRef })

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 transition-[opacity,transform] duration-500 ${
        active && !hidden ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
      aria-hidden="true"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 bg-[#0E0D12]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        Seguí bajando
      </span>
      <div ref={arrowRef}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6L9 12L15 6" stroke="#B8A3C9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

// ── Contenido desbloqueado ────────────────────────────────
const METHOD_ROWS = [
  {
    n: '01',
    title: 'Tu plan, único',
    desc: 'Personalizado desde el día uno. No funciona igual para dos personas, por eso no es igual para todos.',
  },
  {
    n: '02',
    title: 'Dani está presente 60 días',
    desc: 'Acceso directo. Un mensaje, una duda, un día complicado: respondés antes de que abandones.',
  },
  {
    n: '03',
    title: 'Nutrición real',
    desc: 'Sin prohibiciones absurdas. Aprendés a comer bien, no a sufrir 60 días.',
  },
  {
    n: '04',
    title: 'Seguimiento real, no solo números',
    desc: 'Si algo no funciona, lo cambiamos en tiempo real. No esperás 4 semanas para descubrir que fallaste.',
  },
  {
    n: '05',
    title: 'Entrenás desde donde estás',
    desc: 'Sin importar si hace años no te movés. El programa empieza en tu realidad, no en la imaginación.',
  },
]

const STORY = [
  '"Un cliente con toda la motivación del mundo me escribió a las tres semanas: \'Lo dejo.\' No porque el plan fuera malo. Una semana complicada en el trabajo, se desmoronó, y no había nadie que le dijera qué hacer. Se cayó. No pudo levantarse solo.',
  'Ese día entendí: el problema no es el conocimiento. La gente sabe que necesita moverse y comer bien. Lo que falta es alguien presente cuando todo se tuerce. Y se tuerce siempre.',
  'Yo viví lo mismo años. Seguía planes de internet, arrancaba fuerte, una complicación llegaba y no había nadie. Me perdía. De nuevo. Y de nuevo. Eso no es debilidad. Es lo que pasa cuando no tenés un coach.',
  'Cambié. Dejé de mandar PDFs y desaparecer. Ahora estoy presente 60 días: ajustando, respondiendo, acompañando en tiempo real. Los resultados de mis clientes dejaron de ser la excepción. Son la norma."',
]

const FAQS = [
  {
    q: '¿Cuándo veo resultados?',
    a: 'Semanas 1-3: cambios en energía y hábitos. Semanas 4-8: transformación física visible. Depende de dónde arrancás, pero los resultados llegan.',
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
    a: 'Para eso está Dani. Una semana complicada, trabajo, familia, lo que sea: ajustamos. El programa se adapta a tu vida. No existe "me quedé afuera".',
  },
]

const STEPS = [
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
]

function GatedContent() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const root = containerRef.current
    if (!root) return

    const reduced = prefersReducedMotion()

    // El contenido entra como una sola pieza: evita que la página parezca
    // cargarse por fragmentos mientras el usuario empieza a leer.
    gsap.fromTo(
      root,
      { opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 },
      { opacity: 1, y: 0, duration: reduced ? 0.2 : 0.65, ease: 'power3.out' },
    )

    // Conteo del dato de escala.
    root.querySelectorAll<HTMLElement>('[data-countup]').forEach((el) => {
      const target = Number(el.dataset.countup)
      if (!target || reduced) { el.textContent = `+${target}`; return }
      const obj = { v: 0 }
      gsap.to(obj, {
        v: target,
        duration: 1.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
        onUpdate: () => { el.textContent = `+${Math.round(obj.v)}` },
      })
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef}>

      {/* ── Prueba de escala: tira de datos con hairlines ────────── */}
      <section className="px-5 sm:px-8 pt-16 sm:pt-24 pb-4">
        <div className="max-w-[1080px] mx-auto">
          <p className="ln-eyebrow mb-8" style={{ color: 'var(--ln-lila-deep)' }}>Prueba real</p>
          <div className="ln-stats">
            <div>
              <span
                data-countup="500"
                className="ln-display block text-[clamp(48px,9vw,80px)]"
                style={{ color: 'var(--ln-on-light)' }}
              >
                +500
              </span>
              <p className="m-0 mt-2 text-[14px] leading-snug" style={{ color: 'var(--ln-on-light-2)' }}>
                transformaciones reales. Ninguna con el mismo plan.
              </p>
            </div>
            <div>
              <span className="ln-display block text-[clamp(48px,9vw,80px)]" style={{ color: 'var(--ln-on-light)' }}>
                60
              </span>
              <p className="m-0 mt-2 text-[14px] leading-snug" style={{ color: 'var(--ln-on-light-2)' }}>
                días de acompañamiento directo, no un PDF y silencio.
              </p>
            </div>
            <div>
              <span className="ln-display block text-[clamp(48px,9vw,80px)]" style={{ color: 'var(--ln-on-light)' }}>
                1:1
              </span>
              <p className="m-0 mt-2 text-[14px] leading-snug" style={{ color: 'var(--ln-on-light-2)' }}>
                seguimiento con Dani, no con un bot ni una plantilla.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── El método: filas alternadas ──────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-[1080px] mx-auto">
          <div className="md:grid md:grid-cols-[1fr_minmax(0,420px)] md:gap-12 md:items-end mb-12 sm:mb-16">
            <div>
              <p className="ln-eyebrow mb-5" style={{ color: 'var(--ln-lila-deep)' }}>Cómo funciona</p>
              <Display
                lines={['El sistema que', 'realmente transforma']}
                className="text-[clamp(34px,7vw,64px)]"
              />
            </div>
            <p
              data-rise
              className="m-0 mt-5 md:mt-0 text-[15px] sm:text-[16px] leading-relaxed"
              style={{ color: 'var(--ln-on-light-2)' }}
            >
              No es un plan genérico. No es lo mismo para todos. Es tu sistema, diseñado para tu cuerpo,
              tu vida real y tu punto de partida exacto.
            </p>
          </div>

          <div className="ln-method-rows flex flex-col gap-4 sm:gap-5">
            {METHOD_ROWS.map((row, i) => (
              <div
                key={row.n}
                className={`ln-row ${i % 2 === 1 ? 'ln-row--flip' : ''} rounded-[16px] border p-5 sm:p-7`}
                style={{ borderColor: 'var(--ln-hair-light)', background: 'var(--ln-paper)' }}
              >
                <div className="ln-numplate">
                  <span>{row.n}</span>
                </div>
                <div>
                  <h3
                    className="m-0 mb-2 text-[19px] sm:text-[23px] font-bold leading-tight"
                    style={{ color: 'var(--ln-on-light)', letterSpacing: '-0.02em' }}
                  >
                    {row.title}
                  </h3>
                  <p
                    className="m-0 text-[14px] sm:text-[15px] leading-relaxed max-w-[52ch]"
                    style={{ color: 'var(--ln-on-light-2)' }}
                  >
                    {row.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Manifiesto: la voz de Dani en primera persona ────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24" style={{ background: 'var(--ln-paper)' }}>
        <div className="max-w-[1080px] mx-auto">
          <p className="ln-eyebrow mb-8" style={{ color: 'var(--ln-lila-deep)' }}>Por qué Dani hace esto diferente</p>
          <blockquote
            data-rise
            className="m-0 mb-10 max-w-[24ch] text-[clamp(24px,4.2vw,42px)] font-medium leading-[1.12]"
            style={{ color: 'var(--ln-on-light)', letterSpacing: '-0.035em' }}
          >
            El problema no es el conocimiento. Es no tener a nadie cuando todo se tuerce.
          </blockquote>
          <div className="md:columns-2 md:gap-12">
            {STORY.map((p, i) => (
              <p
                key={i}
                data-rise
                className="m-0 mb-5 text-[15px] leading-relaxed break-inside-avoid"
                style={{ color: 'var(--ln-on-light-2)' }}
              >
                {p}
              </p>
            ))}
          </div>
          <p
            className="m-0 mt-4 text-[12px] font-bold uppercase tracking-[0.16em]"
            style={{ color: 'var(--ln-lila-deep)' }}
          >
            — Dani Demicheri, coach personal
          </p>
        </div>
      </section>

      {/* ── Resultados reales ────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-[1080px] mx-auto">
          <p className="ln-eyebrow mb-5" style={{ color: 'var(--ln-lila-deep)' }}>Resultados</p>
          <Display
            lines={['+500 transformaciones.', 'Esto es lo que funciona.']}
            className="text-[clamp(30px,6.4vw,60px)] mb-6"
          />
          <div data-rise className="-mx-4 sm:-mx-8">
            <CasesSection />
          </div>
        </div>
      </section>

      {/* ── Chapter break: panel lila a sangre ───────────────────── */}
      <section className="px-5 sm:px-8 py-20 sm:py-28" style={{ background: 'var(--ln-panel)' }}>
        <div className="max-w-[1080px] mx-auto">
          <p className="ln-eyebrow mb-6 text-white/60">Cupos limitados — solo atención personal</p>
          <Display
            lines={['Dani solo trabaja', 'con quien realmente', 'lo necesita.']}
            className="text-[clamp(32px,6.6vw,66px)] text-white mb-8"
          />
          <div className="md:grid md:grid-cols-[minmax(0,46ch)_auto] md:gap-14 md:items-end">
            <div data-rise>
              <p className="m-0 mb-2 text-[15px] leading-relaxed text-white/75">
                No escalamos con más clientes. Cuando no hay lugar, no hay lugar. La atención 1:1 real no se improvisa.
              </p>
              <p className="m-0 text-[14px] leading-relaxed text-white/55">
                Llamada de 20 minutos. Gratis. Sin presión. Contás tu caso, Dani te dice si es para vos.
              </p>
            </div>
            <Link to="/pre-call" className="ln-pill ln-pill--light mt-8 md:mt-0">
              Reservar mi llamada
              <span className="ln-pill__arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Cómo empieza ─────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-[1080px] mx-auto">
          <p className="ln-eyebrow mb-5" style={{ color: 'var(--ln-lila-deep)' }}>Próximos pasos</p>
          <Display lines={['De aquí a la', 'transformación']} className="text-[clamp(30px,6.4vw,60px)] mb-10 sm:mb-14" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                data-rise
                className="rounded-[16px] border p-6 sm:p-7"
                style={{ borderColor: 'var(--ln-hair-light)', background: 'var(--ln-paper)' }}
              >
                <span
                  className="ln-display block text-[38px] mb-4"
                  style={{ color: 'var(--ln-lila)' }}
                >
                  {s.n}
                </span>
                <h3
                  className="m-0 mb-2 text-[17px] font-bold leading-tight"
                  style={{ color: 'var(--ln-on-light)', letterSpacing: '-0.02em' }}
                >
                  {s.title}
                </h3>
                <p className="m-0 text-[14px] leading-relaxed" style={{ color: 'var(--ln-on-light-2)' }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ sobre carbón ─────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-16 sm:py-24" style={{ background: 'var(--ln-carbon)' }}>
        <div className="max-w-[1080px] mx-auto">
          <p className="ln-eyebrow mb-5" style={{ color: 'var(--ln-lila-bright)' }}>Preguntas frecuentes</p>
          <Display
            lines={['Todo lo que', 'necesitás saber.']}
            className="text-[clamp(30px,6.4vw,60px)] mb-10 sm:mb-14"
            style={{ color: 'var(--ln-on-dark)' }}
          />
          <div className="md:grid md:grid-cols-2 md:gap-x-14">
            {FAQS.map((f, i) => (
              <div
                key={i}
                data-rise
                className="py-6 border-t"
                style={{ borderColor: 'var(--ln-hair-dark)' }}
              >
                <p className="m-0 mb-2 text-[15px] font-bold" style={{ color: 'var(--ln-on-dark)' }}>
                  {f.q}
                </p>
                <p className="m-0 text-[14px] leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.74)' }}>
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cierre ───────────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-20 sm:py-32" style={{ background: 'var(--ln-paper)' }}>
        <div className="max-w-[1080px] mx-auto">
          <Display
            lines={['Día 60 transformado.']}
            className="text-[clamp(32px,7vw,72px)]"
          />
          <Display
            lines={['¿Hoy es el día?']}
            className="text-[clamp(32px,7vw,72px)] mb-8"
          />
          <div className="md:grid md:grid-cols-[minmax(0,44ch)_auto] md:gap-14 md:items-end">
            <div data-rise>
              <p className="m-0 mb-2 text-[15px] leading-relaxed" style={{ color: 'var(--ln-on-light-2)' }}>
                Cada mes sin acción es un mes más igual. No necesitás estar 100% listo. Necesitás empezar hoy.
              </p>
              <p className="m-0 text-[14px] font-medium leading-relaxed" style={{ color: 'var(--ln-lila-deep)' }}>
                Cuerpo transformado. Energía real. Otra forma de verte. Una llamada de 20 minutos empieza todo.
              </p>
            </div>
            <Link to="/pre-call" className="ln-pill ln-pill--lila mt-8 md:mt-0">
              Quiero hablar con Dani
              <span className="ln-pill__arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

// ── Página ────────────────────────────────────────────────
export default function LandingPage() {
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
  const heroRef = useRef<HTMLElement>(null)
  const videoWrapperRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const muxRef = useRef<any>(null)

  // Entrada del hero: titular por línea + apertura de la placa de video.
  useGSAP(() => {
    const root = heroRef.current
    if (!root) return
    const reduced = prefersReducedMotion()

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    tl.fromTo(
      root.querySelectorAll('.ln-mask > span'),
      { opacity: reduced ? 1 : 0 },
      { opacity: 1, duration: reduced ? 0.2 : 0.62, stagger: 0.06 },
    )
      .fromTo(
        root.querySelectorAll('[data-hero-fade]'),
        { opacity: reduced ? 1 : 0 },
        { opacity: 1, duration: reduced ? 0.2 : 0.55, stagger: 0.07 },
        '-=0.35',
      )

    if (!reduced && videoWrapperRef.current) {
      tl.from(videoWrapperRef.current, {
        clipPath: 'inset(14% 10% 14% 10% round 20px)',
        duration: 0.95,
        ease: 'power4.inOut',
      }, '-=0.85')
    }
  }, { scope: heroRef })

  const handleVideoClick = () => {
    const el = muxRef.current
    if (!el) return
    if (el.paused) { el.play(); setIsPaused(false) }
    else { el.pause(); setIsPaused(true) }
  }

  const handleFullscreen = () => {
    const el = muxRef.current ?? videoWrapperRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen()
  }

  useEffect(() => {
    if (unlocked) {
      try { localStorage.setItem(LOCK_KEY, '1') } catch { /* almacenamiento no disponible */ }
      // Esperar a que termine la transición de grid antes de recalcular posiciones.
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

    if (pct >= 45 && !unlocked) setUnlocked(true)
  }

  return (
    <div className="ln min-h-[100dvh]">
      <ScrollProgress />

      {/* ══ Hero carbón: foco cinematográfico en el video ══════════ */}
      <section
        ref={heroRef}
        className="ln-hero relative overflow-hidden"
        style={{ background: 'var(--ln-carbon)' }}
      >
        <div className="ln-grain" aria-hidden="true" />
        <FunnelHeader />

        <div className="relative z-10 max-w-[1080px] mx-auto px-5 sm:px-8 pt-28 sm:pt-32 pb-14 sm:pb-20">

          {/* Titular asimétrico, alineado a la izquierda */}
          <p data-hero-fade className="ln-eyebrow mb-6" style={{ color: 'var(--ln-lila-bright)' }}>
            DemicheriFitness
          </p>

          <h1 className="ln-display m-0 text-[clamp(40px,9.5vw,104px)]" style={{ color: 'var(--ln-on-dark)' }}>
            <span className="ln-mask"><span>Transformá</span></span>
            <span className="ln-mask"><span>tu cuerpo</span></span>
            <span className="ln-mask"><span style={{ color: 'var(--ln-lila-bright)' }}>en 60 días.</span></span>
          </h1>

          <p
            data-hero-fade
            className="m-0 mt-6 max-w-[46ch] text-[16px] sm:text-[18px] leading-snug"
            style={{ color: 'var(--ln-on-dark-2)' }}
          >
            Sin dietas imposibles. Con un coach que te mira, te ajusta el plan y no te deja solo
            la semana que se complica.
          </p>

          {/* Curiosity gap antes del desbloqueo */}
          {!unlocked && (
            <p
              data-hero-fade
              className="m-0 mt-5 max-w-[46ch] text-[14px] leading-relaxed"
              style={{ color: 'var(--ln-on-dark-3)' }}
            >
              Mirá el video hasta el final y descubrí por qué el 90% fracasa, y cómo vos no lo vas a hacer.
            </p>
          )}

          {/* Placa de video con halo lila */}
          <div className="relative mt-10 sm:mt-14 ln-plate-glow">
            <div
              ref={videoWrapperRef}
              className="ln-plate relative z-10 w-full"
            >
              {MUX_PLAYBACK_ID ? (
                <>
                  <MuxPlayer
                    ref={muxRef}
                    playbackId={MUX_PLAYBACK_ID}
                    poster={`https://image.mux.com/${MUX_PLAYBACK_ID}/thumbnail.jpg?time=0`}
                    defaultPlaybackRate={1.2}
                    nohotkeys
                    style={{ width: '100%', display: 'block', aspectRatio: '16/9' } as React.CSSProperties}
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
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleVideoClick() : undefined)}
                  >
                    <div
                      className={`transition-all duration-300 ${
                        isPaused ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                      }`}
                    >
                      <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full bg-white flex items-center justify-center shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="translate-x-[2px]">
                          <path d="M8 5L23 14L8 23V5Z" fill="#0E0D12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleFullscreen}
                    aria-label="Pantalla completa"
                    className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/45 backdrop-blur-sm text-white hover:bg-black/70 transition-colors z-20"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M1 5V1H5M9 1H13V5M13 9V13H9M5 13H1V9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 text-center px-6">
                  <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center">
                    <span className="text-xl text-white/40">▶</span>
                  </div>
                  <p className="text-white/40 text-[13px] m-0">
                    Video no configurado. Agregá{' '}
                    <code className="bg-white/10 px-1.5 py-0.5 rounded" style={{ color: 'var(--ln-lila-bright)' }}>
                      VITE_MUX_PLAYBACK_ID
                    </code>
                    {' '}en{' '}
                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/60">.env</code>
                  </p>
                </div>
              )}
            </div>

            <div className="relative z-10 mt-4">
              <VideoProgressBar progress={videoProgress} unlocked={unlocked} />
            </div>
          </div>
        </div>
      </section>

      <ScrollHint active={unlocked} />

      {/* ══ Corte a claro: el método se revela al desbloquear ══════ */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-700 ease-out ${
          unlocked
            ? 'grid-rows-[1fr] opacity-100 pointer-events-auto'
            : 'grid-rows-[0fr] opacity-0 pointer-events-none select-none'
        }`}
        aria-hidden={!unlocked}
        style={{ background: 'var(--ln-canvas)' }}
      >
        <div className="min-h-0 overflow-hidden">
          {unlocked && <GatedContent />}
        </div>
      </div>

      {/* ══ Cierre de página: banda carbón, mismo mundo que el hero ══
          Además de firmar la página, evita que el final quede en blanco. */}
      {unlocked && (
        <footer
          className="px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: 'var(--ln-carbon)' }}
        >
          <img src={logoSvg} alt="DemicheriFitness" className="h-[20px] w-auto brightness-0 invert opacity-70" />
          <p className="m-0 text-[12px] text-center sm:text-right" style={{ color: 'var(--ln-on-dark-3)' }}>
            Entrenamiento, alimentación y hábitos ajustados a tu vida.
          </p>
        </footer>
      )}
    </div>
  )
}
