import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'
import { supabase } from '../lib/supabaseClient'
import { useGTM } from '../lib/useGTM'
import { useSessionTracking, getSessionId } from '../lib/useSessionTracking'
import { getMetaCookies } from '../lib/metaCookies'
import { getAttribution } from '../lib/attribution'
import { COUNTRY_PREFIXES } from '../lib/countries'
import { META_CURRENCY, META_LEAD_VALUE } from '../lib/metaConversionValues'

const PRECALL_STORAGE_KEY = 'dmf_precall_data'
const PRECALL_LEAD_ID_STORAGE_KEY = 'dmf_precall_lead_id'
const WAITLIST_NAME_STORAGE_KEY = 'dmf_waitlist_name'

// ── Types ──────────────────────────────────────────────────
type Data = {
  objetivo: string              // bajar_grasa | ganar_musculo | salud | rendimiento
  modalidadOnline: string       // si | no (quiere presencial)
  tiempoIntentando: string      // menos_6m | 6m_2a | mas_2a
  diasEntrenamiento: string     // 1_o_menos | 2 | 3 | 4_mas
  equipo: string                // gimnasio | casa | nada
  lesiones: string              // texto abierto (máx. 120)
  compromisoSeguimiento: string // si | no
  porQueAhora: string           // harto | evento | salud | decision | averiguando
  tipoPlan: string              // rutina | dieta | completo
  inversion: string             // ya | en_semanas (= evaluando -> lista de espera)
  compromisoLlamada: boolean
  nombre: string
  email: string
  pais: string // ISO2, fuente de verdad del pais/prefijo (varios paises comparten el mismo dial code, ej. +1)
  whatsappPrefix: string
  whatsapp: string
  edad: string
}

type TextField = { [K in keyof Data]: Data[K] extends string ? K : never }[keyof Data]

// iso es unico (a diferencia del dial code, que varios paises comparten, ej. +1).
const ISO_TO_COUNTRY: Record<string, (typeof COUNTRY_PREFIXES)[number]> = Object.fromEntries(
  COUNTRY_PREFIXES.map(p => [p.iso, p])
)

const INITIAL: Data = {
  objetivo: '', modalidadOnline: '', tiempoIntentando: '', diasEntrenamiento: '', equipo: '', lesiones: '',
  compromisoSeguimiento: '', porQueAhora: '', tipoPlan: '', inversion: '',
  compromisoLlamada: false,
  nombre: '', email: '', pais: 'UY', whatsappPrefix: '+598', whatsapp: '', edad: '',
}

const TOTAL = 11 // pasos con contenido (1-11), el 0 es welcome

// Respuestas que descalifican -> /no-es-el-momento, con el motivo a registrar.
const DISQUALIFIERS: Partial<Record<TextField, { value: string; reason: string }>> = {
  modalidadOnline: { value: 'no', reason: 'quiere_presencial' },
  diasEntrenamiento: { value: '1_o_menos', reason: 'poca_disponibilidad' },
  compromisoSeguimiento: { value: 'no', reason: 'sin_compromiso' },
  porQueAhora: { value: 'averiguando', reason: 'solo_averiguando' },
}

const priceForPlan = (tipoPlan: string) => (tipoPlan === 'completo' ? 300 : 200)

const priorityFor = (d: Data) =>
  d.diasEntrenamiento === '4_mas' && d.tiempoIntentando === 'mas_2a' && d.inversion === 'ya'
    ? 'alta'
    : 'normal'

const inputBase =
  'w-full bg-[#F4F2F7] border border-[#E8E4EE] rounded-[8px] px-4 py-3 text-[#1A1820] text-[15px] placeholder:text-[#9D9B9F] focus:outline-none focus:border-[#9580A6] focus:ring-2 focus:ring-[#9580A6]/15 transition-colors'

// ── Sub-components ─────────────────────────────────────────

function StepMeta({ step }: { step: number }) {
  return (
    <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.2em] mb-3 m-0">
      {step} / {TOTAL}
    </p>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="self-start text-[#69686B] text-[13px] font-bold hover:text-[#9580A6] transition-colors"
    >
      ← Volver
    </button>
  )
}

function StepChoice({
  step, question, hint, value, options, onBack, onChoose,
}: {
  step: number
  question: string
  hint?: string
  value: string
  options: { value: string; label: string; desc?: string }[]
  onBack: () => void
  onChoose: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <StepMeta step={step} />
        <h2 className="text-[#1A1820] text-[22px] sm:text-[30px] font-bold leading-tight m-0">
          {question}
        </h2>
        {hint && <p className="text-[#69686B] text-[13px] mt-2 m-0">{hint}</p>}
      </div>
      <div className="flex flex-col gap-2.5">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onChoose(o.value)}
            className={`w-full text-left px-5 py-4 rounded-[10px] border transition-all ${
              value === o.value
                ? 'bg-[#9580A6] border-[#9580A6] text-white'
                : 'bg-[#F4F2F7] border-[#E8E4EE] text-[#1A1820] hover:border-[#9580A6] hover:bg-[#EDE9F3]'
            }`}
          >
            <span className="block text-[15px] font-bold">{o.label}</span>
            {o.desc && (
              <span className={`block text-[12px] mt-0.5 ${value === o.value ? 'text-white/70' : 'text-[#9D9B9F]'}`}>
                {o.desc}
              </span>
            )}
          </button>
        ))}
      </div>
      <BackBtn onClick={onBack} />
    </div>
  )
}

function StepText({
  step, question, placeholder, hint, value, onChange, onBack, onNext, canContinue, maxLength = 120,
}: {
  step: number
  question: string
  placeholder: string
  hint?: string
  value: string
  onChange: (v: string) => void
  onBack: () => void
  onNext: () => void
  canContinue: boolean
  maxLength?: number
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <StepMeta step={step} />
        <h2 className="text-[#1A1820] text-[22px] sm:text-[30px] font-bold leading-tight m-0">
          {question}
        </h2>
        {hint && <p className="text-[#69686B] text-[13px] mt-2 m-0">{hint}</p>}
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus
        className={inputBase}
      />
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-4 rounded-[8px] border border-[#E8E4EE] text-[#69686B] text-[13px] font-bold hover:border-[#9580A6] transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="flex-1 bg-[#9580A6] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-8 rounded-[8px] hover:bg-[#7A6A8F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────
export default function PreCall() {
  const navigate = useNavigate()
  const { trackEvent, trackConversion } = useGTM()
  const { sessionId, trackNavigation } = useSessionTracking()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const [data, setData] = useState<Data>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof Data, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const submitInFlight = useRef(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  const set = (field: TextField) => (value: string) =>
    setData(prev => ({ ...prev, [field]: value }))

  const transition = (next: number) => {
    setVisible(false)
    setTimeout(() => { setStep(next); setVisible(true) }, 180)
  }

  const goNext = () => transition(step + 1)
  const goBack = () => transition(step - 1)

  const isWaitlist = data.inversion === 'en_semanas'
  const precio = priceForPlan(data.tipoPlan)

  // Auto-advance after choice selection
  const choose = (field: TextField, value: string) => {
    const nextData = { ...data, [field]: value }
    setData(nextData)
    trackEvent('precall_choice', { field, value, step, session_id: sessionId })
    const disqualifier = DISQUALIFIERS[field]
    if (disqualifier && disqualifier.value === value) {
      trackEvent('precall_disqualified', { reason: disqualifier.reason, step, session_id: sessionId })
      try {
        localStorage.setItem(PRECALL_STORAGE_KEY, JSON.stringify(nextData))
      } catch {
        // Non-blocking: this page does not need persisted data to render.
      }
      setTimeout(() => navigate({ to: '/no-es-el-momento' }), 320)
      return
    }
    setTimeout(() => transition(step + 1), 320)
  }

  useEffect(() => {
    trackNavigation('landing_page', 'pre_call', { session_id: sessionId })
  }, [sessionId, trackNavigation])

  useEffect(() => {
    if (step > 0) {
      trackEvent('precall_step_reached', {
        step,
        total: TOTAL,
        progress_percent: Math.round((step / TOTAL) * 100),
        session_id: sessionId,
      })
    }
  }, [step, trackEvent, sessionId])

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [step])

  const handleSubmit = async () => {
    if (submitInFlight.current) return
    setSubmitError(null)
    const e: typeof errors = {}
    if (!data.nombre.trim()) e.nombre = 'Requerido'
    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = 'Email inválido'
    if (!data.whatsapp.trim()) e.whatsapp = 'Requerido'
    if (!data.edad.trim()) e.edad = 'Requerido'
    if (!isWaitlist && !data.compromisoLlamada) {
      e.compromisoLlamada = 'Tenés que aceptar el compromiso para agendar'
    }
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})

    const estado = isWaitlist ? 'lista_espera' : 'califica'
    const prioridad = priorityFor(data)

    submitInFlight.current = true
    setSubmitting(true)
    const submitData = {
      ...data,
      compromisoLlamada: isWaitlist ? false : data.compromisoLlamada,
      precio,
      estado,
      prioridad,
      whatsapp: `${data.whatsappPrefix}${data.whatsapp.trim()}`,
      // Queda dentro de precall_data (jsonb) para poder cruzar anuncio -> lead -> venta.
      attribution: getAttribution(),
    }
    let leadId: string | null = null
    const leadEventId = crypto.randomUUID()
    try {
      const { fbp, fbc } = getMetaCookies()
      const { data: leadResponse, error } = await supabase.functions.invoke('cal', {
        body: {
          action: 'upsert_lead',
          source: 'precall',
          precallData: submitData,
          eventId: leadEventId,
          eventIdStrategy: 'lead',
          fbp,
          fbc,
          eventSourceUrl: window.location.href
        }
      })

      if (error || leadResponse?.error) {
        throw new Error('PRECALL_PERSIST_FAILED')
      }

      leadId = typeof leadResponse?.data?.leadId === 'string' ? leadResponse.data.leadId : null
      if (estado === 'califica') {
        // El servidor define el ID a partir del contacto guardado. El fallback
        // permite desplegar el frontend antes que la nueva función cal.
        const conversionEventId = typeof leadResponse?.data?.eventId === 'string'
          ? leadResponse.data.eventId
          : leadEventId
        // Solo los que califican cuentan como Lead para que Meta optimice hacia gente que agenda.
        trackConversion('meta_lead', conversionEventId, { value: META_LEAD_VALUE, currency: META_CURRENCY })
      }
    } catch (error) {
      // Keep the original booking flow working even if the new lead intake endpoint
      // is not deployed yet or returns a validation error.
      console.error('Lead intake unavailable, falling back to local storage only', error)
    }

    try {
      if (estado === 'califica') {
        localStorage.setItem(PRECALL_STORAGE_KEY, JSON.stringify(submitData))
        if (leadId) {
          localStorage.setItem(PRECALL_LEAD_ID_STORAGE_KEY, leadId)
        }
      } else {
        // La lista de espera no pasa por /agenda: solo guardamos el nombre para el saludo.
        localStorage.removeItem(PRECALL_STORAGE_KEY)
        localStorage.removeItem(PRECALL_LEAD_ID_STORAGE_KEY)
        sessionStorage.setItem(WAITLIST_NAME_STORAGE_KEY, data.nombre.trim())
      }
    } catch {
      if (estado === 'califica') {
        setSubmitError('No pudimos guardar tus datos. Intentá de nuevo.')
        setSubmitting(false)
        submitInFlight.current = false
        return
      }
    }
    await new Promise(r => setTimeout(r, 400))
    trackEvent('precall_submitted', {
      dias_entrenamiento: data.diasEntrenamiento,
      principal_need: data.tipoPlan,
      estado,
      prioridad,
      tipoPlan: data.tipoPlan,
      session_id: sessionId,
    })
    if (estado === 'lista_espera') {
      trackEvent('precall_waitlist', { tipoPlan: data.tipoPlan, session_id: sessionId })
      trackNavigation('pre_call', 'lista_espera', { session_id: sessionId })
      navigate({ to: '/lista-espera' })
      return
    }
    trackNavigation('pre_call', 'agenda', { session_id: sessionId })
    navigate({ to: '/agenda' })
  }

  const progressPct = step === 0 ? 0 : Math.round((step / TOTAL) * 100)

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-[#FEFEFE]">

      {/* Header */}
      <header className="w-full shrink-0 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#E8E4EE] bg-[#FEFEFE]">
        <img src={logoSvg} alt="DemicheriFitness" className="h-[20px] w-auto" />
        {step > 0 && (
          <span className="text-[#69686B] text-[11px] font-bold uppercase tracking-[0.15em]">
            {step} de {TOTAL}
          </span>
        )}
      </header>

      {/* Progress bar */}
      <div className="w-full h-[3px] shrink-0 bg-[#E8E4EE]">
        <div
          className="h-full bg-[#9580A6] transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Content */}
      <main
        ref={contentRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}
      >
        <div className="mx-auto flex min-h-full w-full max-w-[325px] flex-col justify-center md:max-w-[511px]">

          {/* ── Step 0: Bienvenida ── */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center gap-6">
              <p className="text-[#9580A6] text-[11px] font-bold uppercase tracking-[0.2em] m-0">
                Sistema Demicheri
              </p>
              <h1 className="text-[#1A1820] text-[28px] sm:text-[38px] font-bold leading-tight m-0">
                Este formulario evalúa si tenés el perfil.
              </h1>
              <p className="text-[#69686B] text-[15px] leading-relaxed m-0 max-w-[420px]">
                Toma <strong className="text-[#1A1820]">3 minutos</strong>. Solo aceptamos{' '}
                <strong className="text-[#1A1820]">8 personas por mes</strong>. Respondé con honestidad — es para asegurarnos de que podemos ayudarte.
              </p>
              <button
                onClick={goNext}
                className="mt-2 bg-[#9580A6] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-10 rounded-[8px] hover:bg-[#7A6A8F] transition-colors"
              >
                Empezar evaluación →
              </button>
            </div>
          )}

          {/* ── Step 1: Objetivo ── */}
          {step === 1 && (
            <StepChoice
              step={1}
              question="¿Cuál es tu objetivo principal?"
              value={data.objetivo}
              onBack={goBack}
              options={[
                { value: 'bajar_grasa', label: 'Bajar grasa' },
                { value: 'ganar_musculo', label: 'Ganar músculo' },
                { value: 'salud', label: 'Mejorar mi salud' },
                { value: 'rendimiento', label: 'Rendir más en mi deporte' },
              ]}
              onChoose={v => choose('objetivo', v)}
            />
          )}

          {/* ── Step 2: Modalidad online ── */}
          {step === 2 && (
            <StepChoice
              step={2}
              question="El proceso es 100% online, no hay entrenamientos presenciales. ¿Te sirve trabajar así?"
              value={data.modalidadOnline}
              onBack={goBack}
              options={[
                { value: 'si', label: 'Sí, me sirve online' },
                { value: 'no', label: 'Prefiero algo presencial' },
              ]}
              onChoose={v => choose('modalidadOnline', v)}
            />
          )}

          {/* ── Step 3: Tiempo intentando ── */}
          {step === 3 && (
            <StepChoice
              step={3}
              question="¿Hace cuánto querés lograr esto y no lo conseguís?"
              value={data.tiempoIntentando}
              onBack={goBack}
              options={[
                { value: 'menos_6m', label: 'Menos de 6 meses' },
                { value: '6m_2a', label: 'Entre 6 meses y 2 años' },
                { value: 'mas_2a', label: 'Más de 2 años' },
              ]}
              onChoose={v => choose('tiempoIntentando', v)}
            />
          )}

          {/* ── Step 4: Días de entrenamiento ── */}
          {step === 4 && (
            <StepChoice
              step={4}
              question="Siendo honesto/a, ¿cuántos días por semana podés entrenar?"
              value={data.diasEntrenamiento}
              onBack={goBack}
              options={[
                { value: '1_o_menos', label: '1 o menos' },
                { value: '2', label: '2 días' },
                { value: '3', label: '3 días' },
                { value: '4_mas', label: '4 o más' },
              ]}
              onChoose={v => choose('diasEntrenamiento', v)}
            />
          )}

          {/* ── Step 5: Equipo ── */}
          {step === 5 && (
            <StepChoice
              step={5}
              question="¿Tenés acceso a un gimnasio o equipo para entrenar?"
              value={data.equipo}
              onBack={goBack}
              options={[
                { value: 'gimnasio', label: 'Sí, voy a un gimnasio' },
                { value: 'casa', label: 'Tengo algo de equipo en casa' },
                { value: 'nada', label: 'No tengo equipo por ahora' },
              ]}
              onChoose={v => choose('equipo', v)}
            />
          )}

          {/* ── Step 6: Lesiones ── */}
          {step === 6 && (
            <StepText
              step={6}
              question="¿Tenés alguna lesión o condición que debamos saber?"
              hint="Respuesta corta."
              placeholder="Ej: molestia de rodilla, hernia lumbar, ninguna"
              value={data.lesiones}
              onChange={v => set('lesiones')(v)}
              onBack={goBack}
              onNext={goNext}
              canContinue={data.lesiones.trim().length > 0}
              maxLength={120}
            />
          )}

          {/* ── Step 7: Compromiso con el seguimiento ── */}
          {step === 7 && (
            <StepChoice
              step={7}
              question="¿Estás dispuesto a participar activamente en tu proceso de cambio?"
              value={data.compromisoSeguimiento}
              onBack={goBack}
              options={[
                { value: 'si', label: 'Sí, me comprometo' },
                { value: 'no', label: 'Prefiero algo más flexible' },
              ]}
              onChoose={v => choose('compromisoSeguimiento', v)}
            />
          )}

          {/* ── Step 8: Por qué ahora ── */}
          {step === 8 && (
            <StepChoice
              step={8}
              question="¿Por qué ahora y no el mes que viene?"
              value={data.porQueAhora}
              onBack={goBack}
              options={[
                { value: 'harto', label: 'Estoy harto/a de no ver resultados', desc: 'Ya intenté varias veces y nada funcionó' },
                { value: 'evento', label: 'Tengo una fecha o evento importante', desc: 'Necesito estar listo/a para algo concreto' },
                { value: 'salud', label: 'Me lo pidió mi salud', desc: 'No es solo estética, es necesidad' },
                { value: 'decision', label: 'Tomé la decisión y no quiero esperar', desc: 'Si no arranco ahora, no arranco nunca' },
                { value: 'averiguando', label: 'Solo estoy averiguando opciones', desc: 'Todavía no decidí empezar' },
              ]}
              onChoose={v => choose('porQueAhora', v)}
            />
          )}

          {/* ── Step 9: Tipo de plan ── */}
          {step === 9 && (
            <StepChoice
              step={9}
              question="¿Qué necesitás?"
              value={data.tipoPlan}
              onBack={goBack}
              options={[
                { value: 'rutina', label: 'Solo rutina de entrenamiento' },
                { value: 'dieta', label: 'Solo plan de alimentación' },
                { value: 'completo', label: 'Rutina y alimentación' },
              ]}
              onChoose={v => choose('tipoPlan', v)}
            />
          )}

          {/* ── Step 10: Inversión ── */}
          {step === 10 && (
            <StepChoice
              step={10}
              question={`El plan cuesta USD ${precio} por 8 semanas y podés pagarlo en cuotas. ¿Cuándo te gustaría empezar?`}
              value={data.inversion}
              onBack={goBack}
              options={[
                { value: 'ya', label: 'Lo antes posible' },
                // Se mantiene el valor 'en_semanas' por compatibilidad con los leads ya guardados.
                { value: 'en_semanas', label: 'Todavía lo estoy evaluando' },
              ]}
              onChoose={v => choose('inversion', v)}
            />
          )}

          {/* ── Step 11: Datos de contacto (califica / lista de espera) ── */}
          {step === 11 && (
            <div className="flex flex-col gap-6">
              <div>
                <StepMeta step={11} />
                <h2 className="text-[#1A1820] text-[24px] sm:text-[32px] font-bold leading-tight m-0">
                  {isWaitlist ? 'Te guardamos un lugar en la lista de espera' : '¿A dónde te enviamos la confirmación?'}
                </h2>
                <p className="text-[#69686B] text-[13px] mt-2 m-0">
                  {isWaitlist
                    ? 'Te escribimos por WhatsApp cuando se abra un cupo.'
                    : 'Estos datos son para confirmar tu llamada. No usamos spam.'}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-[#1A1820] text-[13px] font-bold mb-1.5">
                    Nombre completo <span className="text-[#9580A6]">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.nombre}
                    onChange={e => set('nombre')(e.target.value)}
                    placeholder="Tu nombre"
                    className={inputBase}
                  />
                  {errors.nombre && <p className="text-red-500 text-[12px] mt-1 m-0">{errors.nombre}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#1A1820] text-[13px] font-bold mb-1.5">
                    Email <span className="text-[#9580A6]">*</span>
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={e => set('email')(e.target.value)}
                    placeholder="tu@email.com"
                    className={inputBase}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-500 text-[12px] mt-1 m-0">{errors.email}</p>}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-[#1A1820] text-[13px] font-bold mb-1.5">
                    WhatsApp <span className="text-[#9580A6]">*</span>
                    <span className="text-[#9D9B9F] font-normal ml-1">(para confirmar tu turno)</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={data.pais}
                      onChange={e => {
                        const iso = e.target.value
                        const country = ISO_TO_COUNTRY[iso]
                        setData(prev => ({ ...prev, pais: iso, whatsappPrefix: country?.code ?? prev.whatsappPrefix }))
                      }}
                      className="bg-[#F4F2F7] border border-[#E8E4EE] rounded-[8px] px-3 py-3 text-[#1A1820] text-[15px] focus:outline-none focus:border-[#9580A6] focus:ring-2 focus:ring-[#9580A6]/15 transition-colors w-[120px] flex-shrink-0 cursor-pointer"
                    >
                      {COUNTRY_PREFIXES.map(p => (
                        <option key={p.iso} value={p.iso}>{p.flag} {p.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={data.whatsapp}
                      onChange={e => set('whatsapp')(e.target.value)}
                      placeholder="99 000 000"
                      className={`${inputBase} flex-1 min-w-0`}
                    />
                  </div>
                  {errors.whatsapp && <p className="text-red-500 text-[12px] mt-1 m-0">{errors.whatsapp}</p>}
                </div>

                {/* Edad */}
                <div>
                  <label className="block text-[#1A1820] text-[13px] font-bold mb-1.5">
                    Edad <span className="text-[#9580A6]">*</span>
                  </label>
                  <input
                    type="number"
                    min="16" max="80"
                    value={data.edad}
                    onChange={e => set('edad')(e.target.value)}
                    placeholder="Ej: 28"
                    className={inputBase}
                  />
                  {errors.edad && <p className="text-red-500 text-[12px] mt-1 m-0">{errors.edad}</p>}
                </div>

                {/* Compromiso con la llamada (solo si califica) */}
                {!isWaitlist && (
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer rounded-[10px] border border-[#E8E4EE] bg-[#F4F2F7] px-4 py-3">
                      <input
                        type="checkbox"
                        checked={data.compromisoLlamada}
                        onChange={e => {
                          const checked = e.target.checked
                          setData(prev => ({ ...prev, compromisoLlamada: checked }))
                          if (checked) setErrors(prev => ({ ...prev, compromisoLlamada: undefined }))
                        }}
                        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#9580A6]"
                      />
                      <span className="text-[#1A1820] text-[13px] leading-snug">
                        Entiendo que la llamada es 1 a 1 con Dani y ocupa uno de los 8 cupos del mes. Me comprometo a conectarme puntual y con cámara, o a avisar con 24 h de anticipación si no puedo.
                      </span>
                    </label>
                    {errors.compromisoLlamada && (
                      <p className="text-red-500 text-[12px] mt-1 m-0">{errors.compromisoLlamada}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="px-5 py-4 rounded-[8px] border border-[#E8E4EE] text-[#69686B] text-[13px] font-bold hover:border-[#9580A6] transition-colors"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  aria-disabled={!isWaitlist && !data.compromisoLlamada}
                  className={`flex-1 bg-[#9580A6] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-8 rounded-[8px] hover:bg-[#7A6A8F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    !isWaitlist && !data.compromisoLlamada ? 'opacity-40' : ''
                  }`}
                >
                  {submitting
                    ? 'Guardando...'
                    : isWaitlist ? 'Anotarme en la lista de espera →' : 'Agendar mi llamada →'}
                </button>
              </div>
              {submitError && (
                <p className="text-center text-[12px] text-red-500 m-0">
                  {submitError}
                </p>
              )}
              {!isWaitlist && (
                <p className="text-center text-[12px] text-[#9D9B9F] m-0">
                  Después de esto vas a poder elegir el día y horario de tu llamada.
                </p>
              )}
            </div>
          )}

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
