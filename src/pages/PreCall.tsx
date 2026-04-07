import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import logoSvg from '../assets/DD FIT - LOGO PRINCIPAL.svg'
import { supabase } from '../lib/supabaseClient'

const PRECALL_STORAGE_KEY = 'dmf_precall_data'
const PRECALL_LEAD_ID_STORAGE_KEY = 'dmf_precall_lead_id'

// ── Types ──────────────────────────────────────────────────
type Data = {
  entrenaDias: string       // si | no
  compromiso: string        // 1-5
  tieneEquipo: string       // si | no | parcial
  dispuestoInvertir: string
  obstaculoPrincipal: string
  porQueAhora: string
  nombre: string
  email: string
  whatsapp: string
  edad: string
  zonaHoraria: string
}

const INITIAL: Data = {
  entrenaDias: '', compromiso: '', tieneEquipo: '', dispuestoInvertir: '',
  obstaculoPrincipal: '', porQueAhora: '',
  nombre: '', email: '', whatsapp: '', edad: '', zonaHoraria: '',
}

const TOTAL = 7 // pasos con contenido (1-7), el 0 es welcome

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
  const labels = ['Nada', 'Poco', 'Regular', 'Bastante', 'Total']
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
  step, question, placeholder, value, onChange, onBack, onNext, canContinue,
}: {
  step: number
  question: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  onBack: () => void
  onNext: () => void
  canContinue: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <StepMeta step={step} />
        <h2 className="text-[#1A1820] text-[22px] sm:text-[30px] font-bold leading-tight m-0">
          {question}
        </h2>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        autoFocus
        className={`${inputBase} resize-none`}
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
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const [data, setData] = useState<Data>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof Data, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    setData(prev => ({ ...prev, [field]: value }))
    setTimeout(() => transition(step + 1), 320)
  }

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
    let leadId: string | null = null
    try {
      const { data: leadResponse, error } = await supabase.functions.invoke('cal', {
        body: {
          action: 'upsert_lead',
          source: 'precall',
          precallData: data
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
      localStorage.setItem(PRECALL_STORAGE_KEY, JSON.stringify(data))
      if (leadId) {
        localStorage.setItem(PRECALL_LEAD_ID_STORAGE_KEY, leadId)
      }
    } catch {
      setSubmitError('No pudimos guardar tus datos. Intentá de nuevo.')
      setSubmitting(false)
      return
    }
    await new Promise(r => setTimeout(r, 400))
    navigate({ to: '/agenda' })
  }

  const progressPct = step === 0 ? 0 : Math.round((step / TOTAL) * 100)

  return (
    <div className="min-h-full flex flex-col overflow-hidden bg-[#FEFEFE]">

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
        className="flex-1 min-h-0 flex flex-col mt-20 items-center justify-center overflow-hidden px-4 py-6 sm:py-8"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}
      >
        <div className="w-full   max-w-[325px]  md:max-w-[511px] ">

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
              question="¿Cuántos días por semana estás dispuesto/a a entrenar los próximos 60 días?"
              value={data.entrenaDias}
              onBack={goBack}
              options={[
                { value: '2', label: '2 días por semana', desc: 'Lo que mi agenda me permite hoy' },
                { value: '3', label: '3 días por semana', desc: 'Constante y manejable' },
                { value: '4', label: '4 días por semana', desc: 'Comprometido/a con el proceso' },
                { value: '5+', label: '5 o más días por semana', desc: 'Todo para dentro' },
              ]}
              onChoose={v => choose('entrenaDias', v)}
            />
          )}

          {/* ── Step 2: Compromiso alimentación ── */}
          {step === 2 && (
            <StepScale
              step={2}
              question="¿Qué tan comprometido/a estás con cambiar tus hábitos de alimentación?"
              hint="No se trata de hacer dieta estricta — se trata de cambiar hábitos reales."
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

          {/* ── Step 4: Plan ── */}
          {step === 4 && (
            <StepChoice
              step={4}
              question="¿Con qué plan te gustaría arrancar?"
              hint="Podemos ajustarlo en la llamada si tenés dudas."
              value={data.dispuestoInvertir}
              onBack={goBack}
              options={[
                { value: 'rutina-dieta-300', label: 'Rutina + Dieta', desc: 'USD 300 · El paquete completo con ahorro de USD 50' },
                { value: 'rutina-200', label: 'Solo Rutina', desc: 'USD 200 · Plan de entrenamiento personalizado' },
                { value: 'dieta-200', label: 'Solo Dieta', desc: 'USD 200 · Plan nutricional completo' },
              ]}
              onChoose={v => choose('dispuestoInvertir', v)}
            />
          )}

          {/* ── Step 5: Obstáculo ── */}
          {step === 5 && (
            <StepChoice
              step={5}
              question="¿Cuál fue el obstáculo número 1 hasta ahora?"
              value={data.obstaculoPrincipal}
              onBack={goBack}
              options={[
                { value: 'constancia', label: 'Falta de constancia', desc: 'Empiezo y no puedo mantenerlo' },
                { value: 'guia', label: 'No sé qué hacer', desc: 'Me falta dirección y un plan claro' },
                { value: 'alimentacion', label: 'La alimentación', desc: 'No sé cómo comer o no puedo sostenerlo' },
                { value: 'tiempo', label: 'Falta de tiempo', desc: 'Mi agenda no me lo permite fácil' },
                { value: 'lesion', label: 'Lesiones o limitaciones físicas', desc: 'Mi cuerpo me puso freno' },
              ]}
              onChoose={v => choose('obstaculoPrincipal', v)}
            />
          )}

          {/* ── Step 6: Por qué ahora ── */}
          {step === 6 && (
            <StepChoice
              step={6}
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

          {/* ── Step 7: Datos de contacto ── */}
          {step === 7 && (
            <div className="flex flex-col gap-6">
              <div>
                <StepMeta step={7} />
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
                  <input
                    type="tel"
                    value={data.whatsapp}
                    onChange={e => set('whatsapp')(e.target.value)}
                    placeholder="+598 99 000 000"
                    className={inputBase}
                  />
                  {errors.whatsapp && <p className="text-red-500 text-[12px] mt-1 m-0">{errors.whatsapp}</p>}
                </div>

                {/* Edad + Zona horaria */}
                <div className="grid grid-cols-2 gap-3">
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
                  <div>
                    <label className="block text-[#1A1820] text-[13px] font-bold mb-1.5">
                      Zona horaria
                      <span className="text-[#9D9B9F] font-normal ml-1">(opcional)</span>
                    </label>
                    <select
                      value={data.zonaHoraria}
                      onChange={e => set('zonaHoraria')(e.target.value)}
                      className={`${inputBase} cursor-pointer appearance-none`}
                    >
                      <option value="">Seleccioná</option>
                      <option value="UY">Uruguay (UYT)</option>
                      <option value="AR">Argentina (ART)</option>
                      <option value="CL">Chile (CLT)</option>
                      <option value="CO">Colombia (COT)</option>
                      <option value="MX">México (CST)</option>
                      <option value="ES">España (CET)</option>
                      <option value="US-EST">EE.UU. Este (EST)</option>
                      <option value="US-PST">EE.UU. Oeste (PST)</option>
                      <option value="otra">Otra</option>
                    </select>
                  </div>
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

        <footer className="w-full fixed bottom-0 border-t border-[#E8E4EE] bg-[#FEFEFE] px-4 py-3 text-center">
          <p className="text-[11px] text-[#9D9B9F] m-0">
            © DemicheriFitness · Todos los derechos reservados
          </p>
        </footer>
    </div>
  )
}
