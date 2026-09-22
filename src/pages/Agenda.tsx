import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSEO } from '../lib/useSEO'
import { supabase } from '../lib/supabaseClient'
import { useGTM } from '../lib/useGTM'
import { useSessionTracking } from '../lib/useSessionTracking'
import { getMetaCookies } from '../lib/metaCookies'
import { COUNTRY_PREFIXES } from '../lib/countries'
import { META_CURRENCY, META_SCHEDULE_VALUE } from '../lib/metaConversionValues'
import brandIcon from '../assets/SVG - FAV ICON.svg'

type BookingSummary = {
  uid?: string
  start?: string
  end?: string
  title?: string
}

type BookingPhase = 'slots' | 'form' | 'success'
type AgendaMode = 'precall' | 'alumno'
type TimeFormat = '24h' | '12h'

const BUSINESS_DAYS_VISIBLE = 5
// Pedimos un día hábil extra: si hoy ya no tiene horarios lo ocultamos y
// seguimos mostrando 5 días hábiles hacia adelante.
const BUSINESS_DAYS_FETCHED = BUSINESS_DAYS_VISIBLE + 1
const AVAILABILITY_CACHE_KEY = 'ddfit_agenda_availability_v2'
const AVAILABILITY_CACHE_TTL_MS = 1000 * 60 * 10
const SLOT_SKELETON_ITEMS = 8
const DATE_LOCALE = 'es'

type AvailabilityCachePayload = {
  createdAt: number
  eventTypeId: string
  timeZone: string
  slotsByDate: Record<string, string[]>
}

// Pre-call data from localStorage
type PrecallData = {
  entrenaDias: string
  compromiso: string
  tieneEquipo: string
  dispuestoInvertir: string
  dispone99Mensuales: string
  obstaculoPrincipal: string
  porQueAhora: string
  nombre: string
  email: string
  whatsapp: string
  edad: string
  zonaHoraria: string
  pais?: string
}

const PRECALL_STORAGE_KEY = 'dmf_precall_data'
const PRECALL_LEAD_ID_STORAGE_KEY = 'dmf_precall_lead_id'

type AgendaProps = {
  mode?: AgendaMode
}

type IconProps = { className?: string }

const ClockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </svg>
)

const VideoIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
)

const GlobeIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
  </svg>
)

const CalendarIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const ArrowLeftIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const CheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const formatSlotTime = (value: string, timeFormat: TimeFormat = '24h') => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString(DATE_LOCALE, {
    hour: timeFormat === '12h' ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h'
  })
}

const formatLongDate = (date: Date) =>
  capitalize(date.toLocaleDateString(DATE_LOCALE, { weekday: 'long', month: 'long', day: 'numeric' }))

const formatSlotDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return formatLongDate(date)
}

const formatWeekdayShort = (date: Date) =>
  date.toLocaleDateString(DATE_LOCALE, { weekday: 'short' }).replace('.', '')

const formatMonthRange = (dates: Date[]) => {
  if (dates.length === 0) return ''
  const first = dates[0]
  const last = dates[dates.length - 1]
  if (first.getMonth() === last.getMonth()) {
    return capitalize(first.toLocaleDateString(DATE_LOCALE, { month: 'long', year: 'numeric' }))
  }
  const firstMonth = first.toLocaleDateString(DATE_LOCALE, { month: 'long' })
  const lastMonth = last.toLocaleDateString(DATE_LOCALE, { month: 'long', year: 'numeric' })
  return capitalize(`${firstMonth} – ${lastMonth}`)
}

const extractSlots = (raw: unknown): string[] => {
  if (!raw) return []
  if (typeof raw === 'string') return [raw]
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => extractSlots(item))
  }
  if (typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    if ('available' in record && record.available === false) return []
    if (record.start) return [String(record.start)]
    if (record.startTime) return [String(record.startTime)]
    if (record.time) return [String(record.time)]
    return Object.values(record).flatMap((value) => extractSlots(value))
  }
  return []
}

const formatLocalDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toLocalNoon = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

const buildBusinessDays = (count: number) => {
  const days: Date[] = []
  const cursor = toLocalNoon(new Date())
  while (days.length < count) {
    if (!isWeekend(cursor)) days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

const buildAvailabilityRange = (days: Date[]) => {
  const end = new Date(days[days.length - 1])
  end.setHours(23, 59, 59, 999)
  return {
    start: new Date().toISOString(),
    end: end.toISOString()
  }
}

// Mantiene el día elegido si sigue teniendo horarios; si no, salta al primer
// día hábil con disponibilidad.
const pickSelectedDate = (
  currentDate: Date,
  slotsByDate: Record<string, string[]>,
  candidates: Date[]
) => {
  const selectable = candidates.filter((date) => Boolean(slotsByDate[formatLocalDateKey(date)]))
  const currentKey = formatLocalDateKey(currentDate)
  if (selectable.some((date) => formatLocalDateKey(date) === currentKey)) return currentDate
  return selectable[0] ?? currentDate
}

const readAvailabilityCache = (
  eventTypeId: string,
  timeZone: string
): AvailabilityCachePayload | null => {
  if (typeof window === 'undefined') return null

  try {
    const rawCache = window.localStorage.getItem(AVAILABILITY_CACHE_KEY)
    if (!rawCache) return null

    const parsed = JSON.parse(rawCache) as Partial<AvailabilityCachePayload>
    if (parsed.eventTypeId !== eventTypeId || parsed.timeZone !== timeZone) return null
    if (typeof parsed.createdAt !== 'number') return null
    if (Date.now() - parsed.createdAt > AVAILABILITY_CACHE_TTL_MS) return null
    if (!parsed.slotsByDate) return null

    return parsed as AvailabilityCachePayload
  } catch {
    return null
  }
}

const saveAvailabilityCache = (payload: AvailabilityCachePayload) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(AVAILABILITY_CACHE_KEY, JSON.stringify(payload))
  } catch {
    return
  }
}

export default function Agenda({ mode = 'precall' }: AgendaProps) {
  // SEO Configuration
  const pageTitle = mode === 'alumno'
    ? 'Mi Agenda - DemicheriFitness'
    : 'Agendar Consulta - DemicheriFitness'
  const pageDescription = mode === 'alumno'
    ? 'Gestiona tu agenda y reserva tus sesiones de entrenamiento personalizado.'
    : 'Agenda tu consulta inicial gratuita con nuestro equipo de coaching fitness.'

  useSEO({
    title: pageTitle,
    description: pageDescription,
    canonical: mode === 'alumno' ? 'https://demicherifitness.com/alumno-agenda' : 'https://demicherifitness.com/agenda',
    ogTitle: pageTitle,
    ogDescription: pageDescription,
  })

  const navigate = useNavigate()
  const { trackConversion, trackPageView, trackEvent } = useGTM()
  const { sessionId, trackNavigation } = useSessionTracking()
  const isAlumnoAgenda = mode === 'alumno'
  const envEventTypeId = import.meta.env.VITE_CAL_EVENT_TYPE_ID as string | undefined
  const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>(
    envEventTypeId ? String(envEventTypeId) : ''
  )
  const [selectedDate, setSelectedDate] = useState<Date>(toLocalNoon(new Date()))
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]>>({})
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('24h')
  const [attendeeName, setAttendeeName] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [attendeePhoneCountry, setAttendeePhoneCountry] = useState('UY')
  const [attendeePhonePrefix, setAttendeePhonePrefix] = useState('+598')
  const [attendeePhone, setAttendeePhone] = useState('')
  const [timeZone] = useState(detectedTimeZone)
  const [bookingPhase, setBookingPhase] = useState<BookingPhase>('slots')
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [hasFetchedSlots, setHasFetchedSlots] = useState(false)
  const [hasLoadedSlots, setHasLoadedSlots] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [booking, setBooking] = useState<BookingSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  // leadId / precall data recuperados desde el link de WhatsApp (?lead=<id>), cuando el
  // usuario llega sin localStorage (ej. abre el link en el teléfono).
  const [urlLeadId, setUrlLeadId] = useState<string | null>(null)
  const [urlPrecallData, setUrlPrecallData] = useState<PrecallData | null>(null)

  const businessDays = useMemo(() => buildBusinessDays(BUSINESS_DAYS_FETCHED), [])
  const selectedDateKey = useMemo(
    () => formatLocalDateKey(selectedDate),
    [selectedDate]
  )
  const slotsForSelectedDate = slotsByDate[selectedDateKey] ?? []
  const displayDates = useMemo(() => {
    const todayKey = formatLocalDateKey(new Date())
    return businessDays
      .filter((date) => {
        const key = formatLocalDateKey(date)
        return key !== todayKey || Boolean(slotsByDate[key])
      })
      .slice(0, BUSINESS_DAYS_VISIBLE)
  }, [businessDays, slotsByDate])
  const hasAnyAvailability = displayDates.some((date) => Boolean(slotsByDate[formatLocalDateKey(date)]))
  const showInitialLoading = !hasLoadedSlots && (!hasFetchedSlots || isLoadingSlots)

  useEffect(() => {
    trackPageView('agenda', {
      session_id: sessionId,
      mode: mode,
      page_type: 'booking',
    })
    trackNavigation('pre_call', 'agenda', { session_id: sessionId })
  }, [sessionId, mode, trackPageView, trackNavigation])

  useEffect(() => {
    let isMounted = true

    const resolveEventTypeId = async () => {
      if (envEventTypeId) {
        setSelectedEventTypeId(String(envEventTypeId))
        return
      }

      setError(null)
      const { data, error: fetchError } = await supabase.functions.invoke('cal', {
        body: { action: 'event_types' }
      })

      if (!isMounted) return

      if (fetchError) {
        setError('No pudimos cargar la disponibilidad. Intentá de nuevo.')
        setHasLoadedSlots(true)
        return
      }

      const list = (data?.data?.data ?? data?.data ?? []) as Array<{ id: number | string }>
      if (list.length === 0) {
        setError('No hay horarios disponibles por ahora.')
        setHasLoadedSlots(true)
        return
      }

      setSelectedEventTypeId(String(list[0].id))
    }

    resolveEventTypeId()

    return () => {
      isMounted = false
    }
  }, [envEventTypeId])

  useEffect(() => {
    if (!selectedEventTypeId) return

    const cache = readAvailabilityCache(selectedEventTypeId, timeZone)
    if (!cache) return

    const nowMs = Date.now()
    const freshSlotsByDate: Record<string, string[]> = {}
    for (const [key, slots] of Object.entries(cache.slotsByDate)) {
      const future = slots.filter((slot) => new Date(slot).getTime() > nowMs)
      if (future.length > 0) freshSlotsByDate[key] = future
    }

    setSlotsByDate(freshSlotsByDate)
    setSelectedDate((currentDate) => pickSelectedDate(currentDate, freshSlotsByDate, businessDays))
    setHasLoadedSlots(true)
  }, [selectedEventTypeId, timeZone, businessDays])

  useEffect(() => {
    let isMounted = true

    const fetchSlots = async () => {
      if (!selectedEventTypeId) return
      setHasFetchedSlots(true)
      setIsLoadingSlots(true)
      setError(null)
      setSelectedSlot('')

      const { start, end } = buildAvailabilityRange(businessDays)

      const { data, error: fetchError } = await supabase.functions.invoke('cal', {
        body: {
          action: 'availability',
          eventTypeId: Number(selectedEventTypeId),
          start,
          end,
          timeZone
        }
      })

      if (!isMounted) return

      if (fetchError) {
        setError('No pudimos cargar la disponibilidad. Intentá de nuevo.')
        setHasLoadedSlots(true)
        setIsLoadingSlots(false)
        return
      }

      const calResponse = data?.data ?? {}
      const rawSlots =
        (calResponse as { data?: unknown })?.data ??
        (calResponse as { slots?: unknown })?.slots ??
        calResponse

      const normalized: Record<string, string[]> = {}

      if (rawSlots && typeof rawSlots === 'object' && !Array.isArray(rawSlots)) {
        Object.entries(rawSlots as Record<string, unknown>).forEach(([key, value]) => {
          const times = extractSlots(value)
          if (times.length > 0) normalized[key] = times
        })
      } else {
        extractSlots(rawSlots).forEach((slot) => {
          const slotDate = new Date(slot)
          if (Number.isNaN(slotDate.getTime())) return
          const key = formatLocalDateKey(slotDate)
          if (!normalized[key]) normalized[key] = []
          normalized[key].push(slot)
        })
      }

      const nowMs = Date.now()
      for (const key of Object.keys(normalized)) {
        const future = Array.from(new Set(normalized[key]))
          .filter((slot) => new Date(slot).getTime() > nowMs)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        if (future.length > 0) {
          normalized[key] = future
        } else {
          delete normalized[key]
        }
      }

      setSlotsByDate(normalized)
      setSelectedDate((currentDate) => pickSelectedDate(currentDate, normalized, businessDays))
      saveAvailabilityCache({
        createdAt: Date.now(),
        eventTypeId: selectedEventTypeId,
        timeZone,
        slotsByDate: normalized
      })
      setHasLoadedSlots(true)
      setIsLoadingSlots(false)
    }

    fetchSlots()

    return () => {
      isMounted = false
    }
  }, [selectedEventTypeId, timeZone, businessDays])

  useEffect(() => {
    if (!slotsForSelectedDate.includes(selectedSlot)) {
      setSelectedSlot('')
    }
  }, [selectedDateKey, slotsForSelectedDate, selectedSlot])

  // Load pre-call data on mount
  useEffect(() => {
    if (isAlumnoAgenda) {
      const params = new URLSearchParams(window.location.search)
      setAttendeeName(params.get('nombre') ?? params.get('name') ?? '')
      setAttendeeEmail(params.get('email') ?? '')
      setAttendeePhone(params.get('whatsapp') ?? params.get('telefono') ?? params.get('phone') ?? '')
      return
    }

    // Si llega desde el link de WhatsApp (?lead=<id>), traemos los datos del pre-call
    // desde el backend (no hay localStorage en ese dispositivo) y precargamos el form.
    const params = new URLSearchParams(window.location.search)
    const leadParam = params.get('lead') ?? params.get('leadId')
    if (leadParam) {
      setUrlLeadId(leadParam)
      supabase.functions
        .invoke('cal', { body: { action: 'get_lead_prefill', leadId: leadParam } })
        .then(({ data }) => {
          const lead = data?.data
          if (!lead) return
          if (lead.fullName) setAttendeeName(lead.fullName)
          if (lead.email) setAttendeeEmail(lead.email)
          if (lead.phone) setAttendeePhone(lead.phone)
          if (lead.precallData) setUrlPrecallData(lead.precallData as PrecallData)
        })
        .catch((err) => {
          console.error('[Agenda] get_lead_prefill error:', err)
        })
      return
    }

    try {
      const stored = localStorage.getItem(PRECALL_STORAGE_KEY)
      if (stored) {
        const precallData = JSON.parse(stored) as PrecallData
        if (precallData.nombre) setAttendeeName(precallData.nombre)
        if (precallData.email) setAttendeeEmail(precallData.email)
        if (precallData.whatsapp) setAttendeePhone(precallData.whatsapp)
      }
    } catch {
      // Ignore errors
    }
  }, [isAlumnoAgenda])

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot)
    setBookingPhase('form')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setBooking(null)

    if (!selectedEventTypeId) {
      setError('No hay horarios disponibles por ahora.')
      return
    }
    if (!selectedSlot) {
      setError('Seleccioná un horario disponible.')
      return
    }
    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setError('Completá tu nombre y email.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(attendeeEmail.trim())) {
      setError('Ingresá un email válido.')
      return
    }
    if (isAlumnoAgenda && !attendeePhone.trim()) {
      setError('Completá tu WhatsApp.')
      return
    }

    // Read pre-call data from localStorage
    let precallData: PrecallData | null = null
    let precallLeadId: string | null = null
    if (isAlumnoAgenda) {
      precallData = {
        entrenaDias: '',
        compromiso: '',
        tieneEquipo: '',
        dispuestoInvertir: '',
        dispone99Mensuales: '',
        obstaculoPrincipal: '',
        porQueAhora: '',
        nombre: attendeeName.trim(),
        email: attendeeEmail.trim(),
        whatsapp: `${attendeePhonePrefix}${attendeePhone.trim()}`,
        edad: '',
        zonaHoraria: timeZone,
        pais: attendeePhoneCountry
      }
    } else if (urlLeadId) {
      // Llegó desde el link de WhatsApp: usamos el leadId y los datos del pre-call
      // recuperados del backend, así la reserva queda vinculada al lead existente.
      precallLeadId = urlLeadId
      precallData = urlPrecallData
    } else {
      try {
        const stored = localStorage.getItem(PRECALL_STORAGE_KEY)
        if (stored) {
          precallData = JSON.parse(stored) as PrecallData
        }
        precallLeadId = localStorage.getItem(PRECALL_LEAD_ID_STORAGE_KEY)
      } catch {
        // Ignore parsing errors
      }
    }

    setIsBooking(true)
    const scheduleEventId = crypto.randomUUID()
    const { fbp, fbc } = getMetaCookies()
    const { data, error: bookingError } = await supabase.functions.invoke('cal', {
      body: {
        action: 'create_booking',
        eventTypeId: Number(selectedEventTypeId),
        start: selectedSlot,
        attendee: {
          name: attendeeName.trim(),
          email: attendeeEmail.trim(),
          timeZone
        },
        leadId: precallLeadId,
        precallData,
        source: isAlumnoAgenda ? 'alumno-agenda' : 'precall',
        eventId: scheduleEventId,
        fbp,
        fbc,
        eventSourceUrl: window.location.href
      }
    })

    if (bookingError) {
      let errorMessage = 'No pudimos confirmar tu cita. Intentá de nuevo.'
      try {
        const errCtx = (bookingError as { context?: Response }).context
        const errBody = errCtx ? await errCtx.json() : null
        console.error('[Agenda] Cal booking error:', errBody ?? bookingError)

        if (errBody?.error === 'ACTIVE_BOOKING_EXISTS') {
          errorMessage = 'Ya existe una cita activa para este contacto. Si necesitás cambiarla, reprogramá o cancelá la anterior.'
        } else if (
          errBody?.error === 'LEAD_NOT_FOUND' ||
          errBody?.error === 'PRECALL_EMAIL_MISMATCH' ||
          errBody?.error === 'LEAD_EMAIL_MISMATCH' ||
          errBody?.error === 'LEAD_PHONE_MISMATCH'
        ) {
          errorMessage = 'No pudimos validar esta agenda con tus datos del pre-call. Volvé a completar el formulario e intentá de nuevo.'
        }
      } catch {
        console.error('[Agenda] Cal booking error:', bookingError)
      }
      setError(errorMessage)
      setIsBooking(false)
      return
    }

    const payload = data?.data?.data ?? data?.data ?? {}
    setBooking({
      uid: payload.uid ?? payload.id,
      start: payload.start,
      end: payload.end,
      title: payload.title
    })
    setIsBooking(false)
    setBookingPhase('success')
    trackEvent('agenda_booking_success', {
      session_id: sessionId,
      event_id: scheduleEventId,
      slot: selectedSlot,
    })
    // Solo las agendas que vienen del pre-call son conversiones de ads; las de alumnos
    // (/alumno-agenda) no deben contar como Schedule en Meta.
    if (!isAlumnoAgenda) {
      trackConversion('meta_schedule', scheduleEventId, { value: META_SCHEDULE_VALUE, currency: META_CURRENCY })
    }

    if (!isAlumnoAgenda) {
      // Clear pre-call data from localStorage after successful booking
      try {
        localStorage.removeItem(PRECALL_STORAGE_KEY)
        localStorage.removeItem(PRECALL_LEAD_ID_STORAGE_KEY)
      } catch {
        // Ignore errors
      }
    }

    navigate({ to: '/gracias-agenda' })
  }

  const resetFlow = () => {
    setBookingPhase('slots')
    setSelectedSlot('')
    setBooking(null)
  }

  const eventTitle = isAlumnoAgenda ? 'Llamada de seguimiento' : 'Llamada de evaluación'
  const eventDescription = isAlumnoAgenda
    ? 'Elegí un horario para revisar tu progreso y ajustar el plan.'
    : 'Una llamada breve y gratuita para conocer tu objetivo y ver si el programa es para vos.'
  const inputClass =
    'h-11 w-full rounded-[10px] border border-[#E8E4EE] bg-white px-3 text-[14px] text-[#1A1820] outline-none transition-[border-color,box-shadow] placeholder:text-[#C8C6CA] focus:border-[#9580A6] focus:shadow-[0_0_0_3px_rgba(149,128,166,0.18)]'

  return (
    <div className="min-h-screen bg-[#FEFEFE] px-3 py-8 sm:px-5 md:py-14">
      <div className="mx-auto w-full max-w-[1040px]">
        <div className="overflow-hidden rounded-[18px] border border-[#E8E4EE] bg-white shadow-[0_1px_2px_rgba(26,24,32,0.04),0_16px_48px_rgba(149,128,166,0.12)] md:grid md:grid-cols-[300px_1fr]">
          <aside className="border-b border-[#E8E4EE] p-5 sm:p-6 md:border-b-0 md:border-r md:p-7">
            <div className="flex items-center gap-2.5">
              <img src={brandIcon} alt="" className="h-9 w-9 rounded-[10px]" />
              <span className="text-[13px] font-medium text-[#69686B]">Demicheri Fitness</span>
            </div>

            <h1 className="m-0 mt-4 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-[#1A1820] md:text-[24px]">
              {eventTitle}
            </h1>
            <p className="m-0 mt-1.5 text-[14px] leading-relaxed text-[#69686B] md:mt-2">
              {eventDescription}
            </p>

            <ul className="m-0 mt-4 flex list-none flex-wrap gap-x-5 gap-y-2.5 p-0 text-[14px] font-medium text-[#1A1820] md:mt-6 md:flex-col md:gap-3">
              {selectedSlot && bookingPhase !== 'slots' && (
                <li className="flex basis-full items-start gap-2.5">
                  <CalendarIcon className="mt-[1px] h-[18px] w-[18px] shrink-0 text-[#9580A6]" />
                  <span>
                    {formatSlotDate(selectedSlot)}
                    <br />
                    <span className="text-[#69686B]">{formatSlotTime(selectedSlot, timeFormat)}</span>
                  </span>
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <ClockIcon className="h-[18px] w-[18px] shrink-0 text-[#9D9B9F]" />
                <span>15-20 min</span>
              </li>
              <li className="flex items-center gap-2.5">
                <VideoIcon className="h-[18px] w-[18px] shrink-0 text-[#9D9B9F]" />
                <span>Google Meet</span>
              </li>
              <li className="flex items-center gap-2.5">
                <GlobeIcon className="h-[18px] w-[18px] shrink-0 text-[#9D9B9F]" />
                <span className="break-all">{timeZone.replace(/_/g, ' ')}</span>
              </li>
            </ul>
          </aside>

          <section className="flex flex-col p-5 sm:p-6 md:min-h-[500px] md:p-7">
            {bookingPhase === 'success' ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDE9F3] text-[#9580A6]">
                  <CheckIcon className="h-6 w-6" />
                </div>
                <h2 className="m-0 text-[20px] font-semibold text-[#1A1820]">Cita confirmada</h2>
                <p className="m-0 max-w-[360px] text-[14px] text-[#69686B]">
                  Te enviamos un correo con los detalles. Si necesitás cambiarla, avisanos con tiempo.
                </p>
                {booking?.start && (
                  <p className="m-0 text-[14px] font-semibold text-[#1A1820]">
                    {formatSlotDate(booking.start)} · {formatSlotTime(booking.start, timeFormat)}
                  </p>
                )}
                <div className="mt-2 flex w-full max-w-[320px] flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className="h-11 flex-1 rounded-[10px] border border-[#E8E4EE] text-[14px] font-medium text-[#1A1820] transition-colors hover:border-[#9580A6]"
                    onClick={resetFlow}
                  >
                    Agendar otra
                  </button>
                  <button
                    type="button"
                    className="h-11 flex-1 rounded-[10px] bg-[#9580A6] text-[14px] font-medium text-white transition-colors hover:bg-[#7A6A8F]"
                    onClick={() => (window.location.href = '/')}
                  >
                    Ir al inicio
                  </button>
                </div>
              </div>
            ) : bookingPhase === 'slots' ? (
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="m-0 text-[16px] font-semibold text-[#1A1820]">Elegí día y horario</h2>
                    <p className="m-0 mt-1 text-[13px] text-[#9D9B9F]">
                      {showInitialLoading ? 'Próximos 5 días hábiles' : formatMonthRange(displayDates)}
                    </p>
                  </div>
                  <div
                    role="group"
                    aria-label="Formato de hora"
                    className="flex shrink-0 rounded-[9px] border border-[#E8E4EE] bg-[#F4F2F7] p-[3px]"
                  >
                    {(['12h', '24h'] as const).map((format) => (
                      <button
                        key={format}
                        type="button"
                        aria-pressed={timeFormat === format}
                        className={`rounded-[7px] px-2.5 py-1 text-[12px] font-medium transition-colors ${
                          timeFormat === format
                            ? 'bg-white text-[#1A1820] shadow-[0_1px_2px_rgba(26,24,32,0.08)]'
                            : 'text-[#9D9B9F] hover:text-[#69686B]'
                        }`}
                        onClick={() => setTimeFormat(format)}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-5 gap-1.5 sm:gap-2">
                  {showInitialLoading
                    ? Array.from({ length: BUSINESS_DAYS_VISIBLE }).map((_, index) => (
                        <div
                          key={`day-skeleton-${index}`}
                          className="h-[76px] animate-pulse rounded-[12px] bg-[#F4F2F7]"
                        />
                      ))
                    : displayDates.map((date) => {
                        const key = formatLocalDateKey(date)
                        const isAvailable = Boolean(slotsByDate[key])
                        const isSelected = isAvailable && key === selectedDateKey
                        const isToday = key === formatLocalDateKey(new Date())
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={!isAvailable}
                            aria-pressed={isSelected}
                            aria-label={formatLongDate(date)}
                            className={`flex h-[76px] flex-col items-center justify-center gap-1 rounded-[12px] border transition-colors ${
                              isSelected
                                ? 'border-[#9580A6] bg-[#9580A6] text-white'
                                : isAvailable
                                  ? 'border-transparent bg-[#F4F2F7] text-[#1A1820] hover:border-[#9580A6]'
                                  : 'cursor-not-allowed border-transparent bg-transparent text-[#C8C6CA]'
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            <span
                              className={`text-[11px] font-medium uppercase tracking-[0.06em] ${
                                isSelected ? 'text-white/75' : isAvailable ? 'text-[#69686B]' : ''
                              }`}
                            >
                              {isToday ? 'Hoy' : formatWeekdayShort(date)}
                            </span>
                            <span className="text-[20px] font-semibold leading-none sm:text-[22px]">
                              {date.getDate()}
                            </span>
                          </button>
                        )
                      })}
                </div>

                <div className="mt-6 flex flex-1 flex-col border-t border-[#E8E4EE] pt-5">
                  {showInitialLoading ? (
                    <>
                      <div className="h-4 w-40 animate-pulse rounded bg-[#F4F2F7]" />
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: SLOT_SKELETON_ITEMS }).map((_, index) => (
                          <div
                            key={`slot-skeleton-${index}`}
                            className="h-11 animate-pulse rounded-[10px] bg-[#F4F2F7]"
                          />
                        ))}
                      </div>
                    </>
                  ) : !hasAnyAvailability || slotsForSelectedDate.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
                      <CalendarIcon className="h-6 w-6 text-[#C4BBCE]" />
                      <p className="m-0 mt-3 text-[14px] font-medium text-[#1A1820]">
                        {hasAnyAvailability
                          ? 'No hay horarios para esta fecha.'
                          : 'No hay horarios disponibles en los próximos 5 días hábiles.'}
                      </p>
                      <p className="m-0 mt-1 text-[13px] text-[#9D9B9F]">
                        {hasAnyAvailability ? 'Elegí otro día.' : 'Probá de nuevo en unos minutos.'}
                      </p>
                    </div>
                  ) : (
                    <div key={selectedDateKey} className="agenda-fade-up">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="m-0 text-[15px] font-semibold text-[#1A1820]">
                          {formatLongDate(selectedDate)}
                        </h3>
                        <span className="text-[12px] text-[#9D9B9F]">
                          {slotsForSelectedDate.length} {slotsForSelectedDate.length === 1 ? 'horario' : 'horarios'}
                        </span>
                      </div>
                      <div className="mt-4 grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
                        {slotsForSelectedDate.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className="h-11 rounded-[10px] border border-[#E8E4EE] bg-white text-[14px] font-medium text-[#1A1820] transition-colors hover:border-[#9580A6] hover:bg-[#EDE9F3] hover:text-[#7A6A8F]"
                            onClick={() => handleSlotSelect(slot)}
                          >
                            {formatSlotTime(slot, timeFormat)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 rounded-[10px] border border-red-500/30 bg-red-50 p-3 text-[13px] text-red-700">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <form className="agenda-fade-up flex flex-1 flex-col" onSubmit={handleSubmit}>
                <h2 className="m-0 text-[16px] font-semibold text-[#1A1820]">Confirmá tu llamada</h2>
                <p className="m-0 mt-1 text-[13px] text-[#9D9B9F]">
                  {isAlumnoAgenda
                    ? 'Dejanos tus datos de contacto para confirmar la sesión.'
                    : 'Revisá tus datos antes de confirmar.'}
                </p>

                <div className="mt-5 flex flex-col gap-4">
                  {isAlumnoAgenda ? (
                    <>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-[#1A1820]">Nombre</span>
                        <input
                          className={inputClass}
                          value={attendeeName}
                          onChange={(event) => setAttendeeName(event.target.value)}
                          placeholder="Tu nombre"
                          autoComplete="name"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-[#1A1820]">Email</span>
                        <input
                          className={inputClass}
                          type="email"
                          value={attendeeEmail}
                          onChange={(event) => setAttendeeEmail(event.target.value)}
                          placeholder="tu@email.com"
                          autoComplete="email"
                        />
                      </label>
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-[13px] font-medium text-[#1A1820]">País</span>
                          <select
                            className={inputClass}
                            value={attendeePhoneCountry}
                            onChange={(event) => {
                              const iso = event.target.value
                              const country = COUNTRY_PREFIXES.find(p => p.iso === iso)
                              setAttendeePhoneCountry(iso)
                              if (country) setAttendeePhonePrefix(country.code)
                            }}
                          >
                            {COUNTRY_PREFIXES.map(p => (
                              <option key={p.iso} value={p.iso}>{p.flag} {p.name} {p.code}</option>
                            ))}
                          </select>
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-[13px] font-medium text-[#1A1820]">WhatsApp</span>
                          <input
                            className={inputClass}
                            value={attendeePhone}
                            onChange={(event) => setAttendeePhone(event.target.value)}
                            placeholder="99123456"
                            inputMode="tel"
                            autoComplete="tel"
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-[12px] border border-[#E8E4EE] bg-[#F4F2F7] p-4">
                      <p className="m-0 text-[12px] font-medium text-[#9D9B9F]">Tus datos</p>
                      <p className="m-0 mt-1.5 text-[14px] font-semibold text-[#1A1820]">
                        {attendeeName || 'Sin nombre'}
                      </p>
                      <p className="m-0 mt-0.5 text-[14px] text-[#69686B]">
                        {attendeeEmail || 'Sin email'}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-[10px] border border-red-500/30 bg-red-50 p-3 text-[13px] text-red-700">
                      {error}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-8">
                  <p className="m-0 mb-4 text-[12px] text-[#9D9B9F]">
                    Recibirás un email con el link de Google Meet para la videollamada.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex h-11 items-center gap-1.5 rounded-[10px] px-4 text-[14px] font-medium text-[#69686B] transition-colors hover:bg-[#F4F2F7] hover:text-[#1A1820]"
                      onClick={() => setBookingPhase('slots')}
                    >
                      <ArrowLeftIcon className="h-4 w-4" />
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="h-11 rounded-[10px] bg-[#9580A6] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#7A6A8F] disabled:opacity-60"
                      disabled={isBooking}
                    >
                      {isBooking ? 'Confirmando...' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
