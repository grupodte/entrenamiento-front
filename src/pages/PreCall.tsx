import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'
import { supabase } from '../lib/supabaseClient'
import { useGTM } from '../lib/useGTM'

const PRECALL_STORAGE_KEY = 'dmf_precall_data'
const PRECALL_LEAD_ID_STORAGE_KEY = 'dmf_precall_lead_id'

// ── Types ──────────────────────────────────────────────────
type Data = {
  entrenaDias: string       // 2x | 3x | +3x
  compromiso: string        // 1-5 (salud de la alimentación)
  tieneEquipo: string       // si | no | parcial
  dispuestoInvertir: string // rutina | dieta | rutina-dieta
  dispone99Mensuales: string // si | no
  obstaculoPrincipal: string // lesión o insuficiencia (respuesta abierta corta)
  porQueAhora: string
  nombre: string
  email: string
  whatsappPrefix: string
  whatsapp: string
  edad: string
}

const COUNTRY_PREFIXES = [
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+52',  flag: '🇲🇽', name: 'México' },
  { code: '+55',  flag: '🇧🇷', name: 'Brasil' },
  { code: '+51',  flag: '🇵🇪', name: 'Perú' },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+34',  flag: '🇪🇸', name: 'España' },
  { code: '+1',   flag: '🇺🇸', name: 'EE.UU. / Canadá' },
]

const INITIAL: Data = {
  entrenaDias: '', compromiso: '', tieneEquipo: '', dispuestoInvertir: '',
  dispone99Mensuales: '',
  obstaculoPrincipal: '', porQueAhora: '',
  nombre: '', email: '', whatsappPrefix: '+598', whatsapp: '', edad: '',
}

const TOTAL = 8 // pasos con contenido (1-8), el 0 es welcome

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

function StepScale({
  step, question, hint, value, onBack, onChoose,
}: {
  step: number
  question: string
  hint?: string
  value: string
  onBack: () => void
  onChoose: (v: string) => void
}) {
  const labels = ['Muy baja', 'Baja', 'Media', 'Buena', 'Muy buena']
  return (
    <div className="flex flex-col gap-6">
      <div>
        <StepMeta step={step} />
        <h2 className="text-[#1A1820] text-[22px] sm:text-[30px] font-bold leading-tight m-0">
          {question}
        </h2>
        {hint && <p className="text-[#69686B] text-[13px] mt-2 m-0">{hint}</p>}
      </div>
      <div className="flex gap-2">
        {['1','2','3','4','5'].map((n, i) => (
          <button
            key={n}
            onClick={() => onChoose(n)}
            className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-[10px] border transition-all ${
              value === n
                ? 'bg-[#9580A6] border-[#9580A6] text-white'
                : 'bg-[#F4F2F7] border-[#E8E4EE] text-[#1A1820] hover:border-[#9580A6]'
            }`}
          >
            <span className="text-[22px] font-bold leading-none">{n}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wide ${value === n ? 'text-white/70' : 'text-[#9D9B9F]'}`}>
              {labels[i]}
            </span>
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
  const { trackPageView, trackEvent } = useGTM()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const [data, setData] = useState<Data>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof Data, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  const set = (field: keyof Data) => (value: string) =>
    setData(prev => ({ ...prev, [field]: value }))

  const transition = (next: number) => {
    setVisible(false)
    setTimeout(() => { setStep(next); setVisible(true) }, 180)
  }

  const goNext = () => transition(step + 1)
  const goBack = () => transition(step - 1)

  // Auto-advance after choice selection
  const choose = (field: keyof Data, value: string) => {
    const nextData = { ...data, [field]: value }
    setData(nextData)
    trackEvent('precall_choice', { field, value, step })
    if (field === 'dispone99Mensuales' && value === 'no') {
      trackEvent('budget_rejection', { reason: 'insufficient_budget', step })
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
    trackPageView('pre_call', { initial_step: 0 })
  }, [trackPageView])

  useEffect(() => {
    if (step > 0) {
      trackEvent('precall_step_reached', { step, total: TOTAL, progress_percent: Math.round((step / TOTAL) * 100) })
    }
  }, [step, trackEvent])

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
    setSubmitError(null)
    const e: typeof errors = {}
    if (!data.nombre.trim()) e.nombre = 'Requerido'
    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = 'Email inválido'
    if (!data.whatsapp.trim()) e.whatsapp = 'Requerido'
    if (!data.edad.trim()) e.edad = 'Requerido'
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})

    setSubmitting(true)
    const submitData = {
      ...data,
      whatsapp: `${data.whatsappPrefix}${data.whatsapp.trim()}`,
    }
    let leadId: string | null = null
    try {
      const { data: leadResponse, error } = await supabase.functions.invoke('cal', {
        body: {
          action: 'upsert_lead',
          source: 'precall',
          precallData: submitData
        }
      })

      if (error || leadResponse?.error) {
        throw new Error('PRECALL_PERSIST_FAILED')
      }

      leadId = typeof leadResponse?.data?.leadId === 'string' ? leadResponse.data.leadId : null
    } catch (error) {
      // Keep the original booking flow working even if the new lead intake endpoint
      // is not deployed yet or returns a validation error.
      console.error('Lead intake unavailable, falling back to local storage only', error)
    }

    try {
      localStorage.setItem(PRECALL_STORAGE_KEY, JSON.stringify(submitData))
      if (leadId) {
        localStorage.setItem(PRECALL_LEAD_ID_STORAGE_KEY, leadId)
      }
    } catch {
      setSubmitError('No pudimos guardar tus datos. Intentá de nuevo.')
      setSubmitting(false)
      return
    }
    await new Promise(r => setTimeout(r, 400))
    trackEvent('precall_submitted', { dias_entrenamiento: data.entrenaDias, principal_need: data.dispuestoInvertir })
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

          {/* ── Step 1: Días de entrenamiento ── */}
          {step === 1 && (
            <StepChoice
              step={1}
              question="¿Cuántos días por semana estás dispuesto/a a entrenar?"
              value={data.entrenaDias}
              onBack={goBack}
              options={[
                { value: '2x', label: '2 x semana' },
                { value: '3x', label: '3 x semana' },
                { value: '+3x', label: '+3 x semana' },
              ]}
              onChoose={v => choose('entrenaDias', v)}
            />
          )}

          {/* ── Step 2: Alimentación actual ── */}
          {step === 2 && (
            <StepScale
              step={2}
              question="Del 1 al 5: ¿Qué tan saludable es tu alimentación hoy?"
              value={data.compromiso}
              onBack={goBack}
              onChoose={v => choose('compromiso', v)}
            />
          )}

          {/* ── Step 3: Tiene equipo ── */}
          {step === 3 && (
            <StepChoice
              step={3}
              question="¿Tenés acceso a un gimnasio o equipo básico para entrenar?"
              value={data.tieneEquipo}
              onBack={goBack}
              options={[
                { value: 'si', label: 'Sí, tengo acceso a un gimnasio' },
                { value: 'parcial', label: 'Tengo algo de equipo en casa' },
                { value: 'no', label: 'No tengo equipo por ahora' },
              ]}
              onChoose={v => choose('tieneEquipo', v)}
            />
          )}

          {/* ── Step 4: Apoyo principal ── */}
          {step === 4 && (
            <StepChoice
              step={4}
              question="¿Con cuál de estas opciones necesitás mayor apoyo hoy?"
              value={data.dispuestoInvertir}
              onBack={goBack}
              options={[
                { value: 'rutina', label: 'Rutina' },
                { value: 'dieta', label: 'Dieta' },
                { value: 'rutina-dieta', label: 'Rutina y dieta' },
              ]}
              onChoose={v => choose('dispuestoInvertir', v)}
            />
          )}

          {/* ── Step 5: Presupuesto mínimo ── */}
          {step === 5 && (
            <StepChoice
              step={5}
              question="El proceso personalizado dura 8 semanas. La inversión mínima es de USD 200. ¿Está dentro de tus posibilidades?"
              value={data.dispone99Mensuales}
              onBack={goBack}
              options={[
                { value: 'si', label: 'Sí' },
                { value: 'no', label: 'No es el momento' },
              ]}
              onChoose={v => choose('dispone99Mensuales', v)}
            />
          )}

          {/* ── Step 6: Lesión o insuficiencia ── */}
          {step === 6 && (
            <StepText
              step={6}
              question="¿Tenés algún tipo de lesión o insuficiencia?"
              hint="Respuesta abierta corta."
              placeholder="Ej: molestia de rodilla, hernia lumbar, ninguna"
              value={data.obstaculoPrincipal}
              onChange={v => set('obstaculoPrincipal')(v)}
              onBack={goBack}
              onNext={goNext}
              canContinue={data.obstaculoPrincipal.trim().length > 0}
              maxLength={120}
            />
          )}

          {/* ── Step 7: Por qué ahora ── */}
          {step === 7 && (
            <StepChoice
              step={7}
              question="¿Por qué ahora y no el mes que viene?"
              value={data.porQueAhora}
              onBack={goBack}
              options={[
                { value: 'harto', label: 'Estoy harto/a de no ver resultados', desc: 'Ya intenté varias veces y nada funcionó' },
                { value: 'evento', label: 'Tengo una fecha o evento importante', desc: 'Necesito estar listo/a para algo concreto' },
                { value: 'decision', label: 'Tomé la decisión y no quiero esperar', desc: 'Si no arranco ahora, no arranco nunca' },
                { value: 'salud', label: 'Me lo pidió mi salud', desc: 'No es solo estética, es necesidad' },
              ]}
              onChoose={v => choose('porQueAhora', v)}
            />
          )}

          {/* ── Step 8: Datos de contacto ── */}
          {step === 8 && (
            <div className="flex flex-col gap-6">
              <div>
                <StepMeta step={8} />
                <h2 className="text-[#1A1820] text-[24px] sm:text-[32px] font-bold leading-tight m-0">
                  ¿A dónde te enviamos la confirmación?
                </h2>
                <p className="text-[#69686B] text-[13px] mt-2 m-0">
                  Estos datos son para confirmar tu llamada. No usamos spam.
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
                      value={data.whatsappPrefix}
                      onChange={e => set('whatsappPrefix')(e.target.value)}
                      className="bg-[#F4F2F7] border border-[#E8E4EE] rounded-[8px] px-3 py-3 text-[#1A1820] text-[15px] focus:outline-none focus:border-[#9580A6] focus:ring-2 focus:ring-[#9580A6]/15 transition-colors w-[120px] flex-shrink-0 cursor-pointer"
                    >
                      {COUNTRY_PREFIXES.map(p => (
                        <option key={p.code + p.name} value={p.code}>{p.flag} {p.code}</option>
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
                  className="flex-1 bg-[#9580A6] text-white font-bold text-[13px] uppercase tracking-widest py-4 px-8 rounded-[8px] hover:bg-[#7A6A8F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Guardando...' : 'Agendar mi llamada →'}
                </button>
              </div>
              {submitError && (
                <p className="text-center text-[12px] text-red-500 m-0">
                  {submitError}
                </p>
              )}
              <p className="text-center text-[12px] text-[#9D9B9F] m-0">
                Después de esto vas a poder elegir el día y horario de tu llamada.
              </p>
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
