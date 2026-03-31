import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '../lib/supabaseClient'

type BookingSummary = {
  uid?: string
  start?: string
  end?: string
  title?: string
}

type BookingPhase = 'slots' | 'form' | 'success'
const AVAILABILITY_LOOKAHEAD_DAYS = 30
const MAX_VISIBLE_AVAILABLE_DAYS = 7
const AVAILABILITY_CACHE_KEY = 'ddfit_agenda_availability_v1'
const AVAILABILITY_CACHE_TTL_MS = 1000 * 60 * 10
const DATE_SKELETON_ITEMS = 6
const SLOT_SKELETON_ITEMS = 8

type AvailabilityCachePayload = {
  createdAt: number
  eventTypeId: string
  timeZone: string
  slotsByDate: Record<string, string[]>
  availableDates: string[]
}

// Pre-call data from localStorage
type PrecallData = {
  entrenaDias: string
  compromiso: string
  tieneEquipo: string
  dispuestoInvertir: string
  obstaculoPrincipal: string
  porQueAhora: string
  nombre: string
  email: string
  whatsapp: string
  edad: string
  zonaHoraria: string
}

const PRECALL_STORAGE_KEY = 'dmf_precall_data'
const PRECALL_LEAD_ID_STORAGE_KEY = 'dmf_precall_lead_id'

const formatSlotTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatSlotDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

const extractSlots = (raw: unknown): string[] => {
  if (!raw) return []
  if (typeof raw === 'string') return [raw]
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => extractSlots(item))
  }
  if (typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    if (record.start) return [String(record.start)]
    if (record.startTime) return [String(record.startTime)]
    if (record.time) return [String(record.time)]
    return Object.values(record).flatMap((value) => extractSlots(value))
  }
  return []
}

const buildNextDaysRange = (days: number) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + Math.max(days - 1, 0))
  end.setHours(23, 59, 59, 999)
  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

const formatLocalDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseLocalDateKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

const toLocalNoon = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)

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
    if (!parsed.slotsByDate || !Array.isArray(parsed.availableDates)) return null

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

export default function Agenda() {
  const navigate = useNavigate()
  const envEventTypeId = import.meta.env.VITE_CAL_EVENT_TYPE_ID as string | undefined
  const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>(
    envEventTypeId ? String(envEventTypeId) : ''
  )
  const [selectedDate, setSelectedDate] = useState<Date>(toLocalNoon(new Date()))
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]>>({})
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [attendeeName, setAttendeeName] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [timeZone] = useState(detectedTimeZone)
  const [bookingPhase, setBookingPhase] = useState<BookingPhase>('slots')
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [hasFetchedSlots, setHasFetchedSlots] = useState(false)
  const [hasLoadedSlots, setHasLoadedSlots] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [booking, setBooking] = useState<BookingSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedDateKey = useMemo(
    () => formatLocalDateKey(selectedDate),
    [selectedDate]
  )
  const slotsForSelectedDate = slotsByDate[selectedDateKey] ?? []
  const displayDates = useMemo(
    () =>
      availableDates
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .slice(0, MAX_VISIBLE_AVAILABLE_DAYS)
        .map((key) => parseLocalDateKey(key))
        .filter((date): date is Date => Boolean(date)),
    [availableDates]
  )
  const showInitialLoading = !hasLoadedSlots && (!hasFetchedSlots || isLoadingSlots)

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

    setSlotsByDate(cache.slotsByDate)
    setAvailableDates(cache.availableDates)
    setSelectedDate((currentDate) => {
      if (cache.availableDates.length === 0) return currentDate
      const currentKey = formatLocalDateKey(currentDate)
      if (cache.slotsByDate[currentKey]) return currentDate
      const firstAvailable = parseLocalDateKey(cache.availableDates[0])
      return firstAvailable ?? currentDate
    })
    setHasLoadedSlots(true)
  }, [selectedEventTypeId, timeZone])

  useEffect(() => {
    let isMounted = true

    const fetchSlots = async () => {
      if (!selectedEventTypeId) return
      setHasFetchedSlots(true)
      setIsLoadingSlots(true)
      setError(null)
      setSelectedSlot('')

      const { start, end } = buildNextDaysRange(AVAILABILITY_LOOKAHEAD_DAYS)

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
      const dates: string[] = []

      if (rawSlots && typeof rawSlots === 'object' && !Array.isArray(rawSlots)) {
        Object.entries(rawSlots as Record<string, unknown>).forEach(([key, value]) => {
          const times = Array.from(new Set(extractSlots(value)))
          if (times.length > 0) {
            normalized[key] = times.sort(
              (a, b) => new Date(a).getTime() - new Date(b).getTime()
            )
            dates.push(key)
          }
        })
      } else {
        extractSlots(rawSlots).forEach((slot) => {
          const slotDate = new Date(slot)
          if (Number.isNaN(slotDate.getTime())) return
          const key = formatLocalDateKey(slotDate)
          if (!normalized[key]) normalized[key] = []
          normalized[key].push(slot)
        })

        Object.entries(normalized).forEach(([key, value]) => {
          const times = Array.from(new Set(value)).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          )
          if (times.length > 0) {
            normalized[key] = times
            dates.push(key)
          }
        })
      }

      const sortedDates = Array.from(new Set(dates)).sort((a, b) => a.localeCompare(b))

      setSlotsByDate(normalized)
      setAvailableDates(sortedDates)
      setSelectedDate((currentDate) => {
        if (sortedDates.length === 0) return currentDate
        const currentKey = formatLocalDateKey(currentDate)
        if (normalized[currentKey]) return currentDate
        const firstAvailable = parseLocalDateKey(sortedDates[0])
        return firstAvailable ?? currentDate
      })
      saveAvailabilityCache({
        createdAt: Date.now(),
        eventTypeId: selectedEventTypeId,
        timeZone,
        slotsByDate: normalized,
        availableDates: sortedDates
      })
      setHasLoadedSlots(true)
      setIsLoadingSlots(false)
    }

    fetchSlots()

    return () => {
      isMounted = false
    }
  }, [selectedEventTypeId, timeZone])

  useEffect(() => {
    if (!slotsForSelectedDate.includes(selectedSlot)) {
      setSelectedSlot('')
    }
  }, [selectedDateKey, slotsForSelectedDate, selectedSlot])

  // Load pre-call data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRECALL_STORAGE_KEY)
      if (stored) {
        const precallData = JSON.parse(stored) as PrecallData
        if (precallData.nombre) setAttendeeName(precallData.nombre)
        if (precallData.email) setAttendeeEmail(precallData.email)
      }
    } catch {
      // Ignore errors
    }
  }, [])

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
    if (!attendeeName || !attendeeEmail) {
      setError('Completá tu nombre y email.')
      return
    }

    // Read pre-call data from localStorage
    let precallData: PrecallData | null = null
    let leadId: string | null = null
    try {
      const stored = localStorage.getItem(PRECALL_STORAGE_KEY)
      if (stored) {
        precallData = JSON.parse(stored) as PrecallData
      }
      const storedLeadId = localStorage.getItem(PRECALL_LEAD_ID_STORAGE_KEY)
      if (storedLeadId) {
        leadId = storedLeadId
      }
    } catch {
      // Ignore parsing errors
    }

    setIsBooking(true)
    const { data, error: bookingError } = await supabase.functions.invoke('cal', {
      body: {
        action: 'create_booking',
        eventTypeId: Number(selectedEventTypeId),
        start: selectedSlot,
        attendee: {
          name: attendeeName,
          email: attendeeEmail,
          timeZone
        },
        precallData,
        leadId
      }
    })

    if (bookingError) {
      setError('No pudimos confirmar tu cita. Intentá de nuevo.')
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
    
    // Clear pre-call data from localStorage after successful booking
    try {
      localStorage.removeItem(PRECALL_STORAGE_KEY)
      localStorage.removeItem(PRECALL_LEAD_ID_STORAGE_KEY)
    } catch {
      // Ignore errors
    }
    
    navigate({ to: '/gracias-agenda' })
  }

  const resetFlow = () => {
    setBookingPhase('slots')
    setSelectedSlot('')
    setBooking(null)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FEFEFE]">
      <div className="w-full max-w-[1200px] min-h-[640px] md:min-h-[680px] overflow-hidden rounded-[30px] shadow-[0_30px_80px_rgba(149,128,166,0.15)] bg-[#FEFEFE] grid md:grid-cols-[0.85fr_1.15fr] border border-[#E8E4EE]">
        <div className="bg-[#F4F2F7] text-[#1A1820] p-7 md:p-10 flex flex-col justify-between border-r border-[#E8E4EE]">
          <div className="space-y-6">
        
            <div>
              <h1 className="text-[28px] md:text-[34px] font-bold text-[#1A1820]">
                {bookingPhase === 'form' ? 'Confirmá tu llamada' : 'Agendá tu llamada'}
              </h1>
              <p className="mt-3 text-[14px] text-[#69686B] max-w-[260px]">
                {bookingPhase === 'form' 
                  ? 'Revisá los datos de tu sesión de evaluación gratuita.' 
                  : 'Elegí un horario disponible para tu sesión de evaluación.'}
              </p>
            </div>

            <div className="space-y-3 text-[13px] text-[#69686B]">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#9580A6]/15 flex items-center justify-center text-[12px] text-[#9580A6]">
                  ⏱
                </span>
                <span>15-20 minutos</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#9580A6]/15 flex items-center justify-center text-[10px] text-[#9580A6]">
                  TZ
                </span>
                <span className="text-[12px]">{timeZone}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[18px] border border-[#E8E4EE] bg-[#FEFEFE] p-4 text-[12px]">
            {bookingPhase === 'form' && attendeeName ? (
              <>
                <p className="m-0 text-[#9580A6] font-bold uppercase text-[11px] tracking-[0.15em]">Sesión para</p>
                <p className="m-0 mt-1 text-[14px] font-bold text-[#1A1820]">{attendeeName}</p>
              </>
            ) : null}
            <p className={`m-0 text-[#9580A6] font-bold uppercase text-[11px] tracking-[0.15em] ${bookingPhase === 'form' && attendeeName ? 'mt-3' : ''}`}>
              {selectedSlot ? 'Horario seleccionado' : 'Resumen'}
            </p>
            <p className="m-0 mt-1 text-[14px] font-bold text-[#1A1820]">
              {selectedSlot
                ? `${formatSlotDate(selectedSlot)} · ${formatSlotTime(selectedSlot)}`
                : 'Elegí un horario para continuar.'}
            </p>
          </div>
        </div>

        <div className="p-7 md:p-10 h-full flex flex-col justify-center bg-[#FEFEFE]">
          {bookingPhase === 'success' ? (
            <div className="flex flex-col items-center text-center gap-4 py-10">
              <div className="w-16 h-16 rounded-full bg-[#9580A6]/15 flex items-center justify-center text-[#9580A6] text-[24px]">
                ✓
              </div>
              <h2 className="text-[22px] font-bold text-[#1A1820]">Cita confirmada</h2>
              <p className="text-[13px] text-[#69686B] max-w-[360px]">
                Te enviamos un correo con los detalles. Si necesitás cambiarla, avisanos con tiempo.
              </p>
              {booking?.start && (
                <p className="text-[14px] font-bold text-[#1A1820]">
                  {formatSlotDate(booking.start)} · {formatSlotTime(booking.start)}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[320px]">
                <button
                  type="button"
                  className="flex-1 rounded-[14px] border border-[#E8E4EE] px-4 py-3 text-[13px] uppercase tracking-[0.18em] text-[#69686B] hover:border-[#9580A6] hover:text-[#9580A6] transition-colors"
                  onClick={resetFlow}
                >
                  Agendar otra
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-[14px] bg-[#9580A6] text-white px-4 py-3 text-[13px] uppercase tracking-[0.18em] hover:bg-[#7A6A8F] transition-colors"
                  onClick={() => (window.location.href = '/')}
                >
                  Ir al inicio
                </button>
              </div>
            </div>
          ) : bookingPhase === 'slots' ? (
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9580A6]">
                  Seleccioná fecha y hora
                </p>
                <h2 className="mt-2 text-[22px] font-bold text-[#1A1820]">Elegí el horario disponible</h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
                <div className="rounded-[20px] border border-[#E8E4EE] bg-[#FEFEFE] p-5 h-[400px] overflow-y-auto no-scrollbar">
                  {showInitialLoading ? (
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: DATE_SKELETON_ITEMS }).map((_, index) => (
                        <div
                          key={`date-skeleton-${index}`}
                          className="h-[54px] w-full rounded-[14px] border border-[#E8E4EE] bg-gradient-to-r from-[#9580A6]/[0.05] via-[#9580A6]/[0.08] to-[#9580A6]/[0.05] animate-pulse"
                        />
                      ))}
                    </div>
                  ) : displayDates.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-full rounded-[14px] border border-[#E8E4EE] bg-[#F4F2F7] px-4 py-5 text-center">
                        <p className="m-0 text-[13px] font-medium text-[#1A1820]">
                          No hay horarios disponibles por ahora.
                        </p>
                        <p className="m-0 mt-1 text-[12px] text-[#69686B]">
                          Probá de nuevo en unos minutos.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {displayDates.map((date) => {
                        const key = formatLocalDateKey(date)
                        const isSelected = key === selectedDateKey
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`w-full rounded-[14px] border px-4 py-3 text-left transition ${
                              isSelected
                                ? 'border-[#9580A6] bg-[#9580A6] text-white'
                                : 'border-[#E8E4EE] bg-[#FEFEFE] text-[#1A1820] hover:border-[#9580A6]'
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[14px] font-bold">
                                {date.toLocaleDateString([], {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                              <span
                                className={`text-[11px] font-bold uppercase tracking-[0.14em] ${isSelected ? 'text-white/70' : 'text-[#9D9B9F]'}`}
                              >
                                {slotsByDate[key]?.length ?? 0} horarios
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-[20px] border border-[#E8E4EE] bg-[#FEFEFE] p-5 h-[400px] overflow-y-auto no-scrollbar">
                  {showInitialLoading ? (
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: SLOT_SKELETON_ITEMS }).map((_, index) => (
                        <div
                          key={`slot-skeleton-${index}`}
                          className="h-[54px] w-full rounded-[16px] border border-[#E8E4EE] bg-gradient-to-r from-[#9580A6]/[0.05] via-[#9580A6]/[0.08] to-[#9580A6]/[0.05] animate-pulse"
                        />
                      ))}
                    </div>
                  ) : displayDates.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-full rounded-[14px] border border-[#E8E4EE] bg-[#F4F2F7] px-4 py-5 text-center">
                        <p className="m-0 text-[13px] font-medium text-[#1A1820]">
                          No hay horarios disponibles por ahora.
                        </p>
                      </div>
                    </div>
                  ) : slotsForSelectedDate.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-full rounded-[14px] border border-[#E8E4EE] bg-[#F4F2F7] px-4 py-5 text-center">
                        <p className="m-0 text-[13px] font-medium text-[#1A1820]">
                          No hay horarios para esta fecha.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {slotsForSelectedDate.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className="w-full rounded-[16px] border border-[#E8E4EE] bg-[#F4F2F7] px-4 py-3 text-[14px] font-bold flex items-center justify-between hover:border-[#9580A6] hover:bg-[#EDE9F3] transition-colors text-[#1A1820]"
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <span>{formatSlotTime(slot)}</span>
                          <span className="text-[11px] text-[#9580A6] font-bold uppercase tracking-[0.18em]">
                            Reservar
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-[12px] border border-red-500/40 bg-red-50 p-3 text-[13px] text-red-700">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9580A6]">
                    Paso final
                  </p>
                  <h2 className="mt-2 text-[22px] font-bold text-[#1A1820]">Confirmá tu llamada</h2>
                </div>
                <button
                  type="button"
                  className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#69686B] hover:text-[#9580A6] transition-colors"
                  onClick={() => setBookingPhase('slots')}
                >
                  ← Volver
                </button>
              </div>

              {/* Datos de confirmación */}
              <div className="flex flex-col gap-3">
                <div className="rounded-[14px] border border-[#E8E4EE] bg-[#F4F2F7] p-4 text-[13px]">
                  <p className="m-0 font-bold text-[#9580A6] uppercase text-[11px] tracking-[0.15em]">Horario seleccionado</p>
                  <p className="m-0 mt-2 text-[#1A1820] font-semibold">
                    {selectedSlot
                      ? `${formatSlotDate(selectedSlot)} · ${formatSlotTime(selectedSlot)}`
                      : 'Elegí un horario para continuar.'}
                  </p>
                </div>

                <div className="rounded-[14px] border border-[#E8E4EE] bg-[#F4F2F7] p-4 text-[13px]">
                  <p className="m-0 font-bold text-[#9580A6] uppercase text-[11px] tracking-[0.15em]">Tus datos</p>
                  <p className="m-0 mt-2 text-[#1A1820] font-semibold">
                    {attendeeName || 'Sin nombre'}
                  </p>
                  <p className="m-0 text-[#69686B]">
                    {attendeeEmail || 'Sin email'}
                  </p>
                </div>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-[12px] border border-red-500/40 bg-red-50 p-3 text-[13px] text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 rounded-[8px] bg-[#9580A6] text-white px-4 py-4 text-[13px] font-bold uppercase tracking-[0.2em] disabled:opacity-60 hover:bg-[#7A6A8F] transition-colors"
                  disabled={isBooking}
                >
                  {isBooking ? 'Confirmando...' : 'Confirmar mi llamada →'}
                </button>
                
                <p className="text-[11px] text-[#9D9B9F] text-center">
                  Recibirás un email con el link de Google Meet para la videollamada
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
