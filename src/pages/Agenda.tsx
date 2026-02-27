import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import DatePicker from 'react-datepicker'
import { supabase } from '../lib/supabaseClient'
import 'react-datepicker/dist/react-datepicker.css'
import { useTranslation } from 'react-i18next'

type BookingSummary = {
  uid?: string
  start?: string
  end?: string
  title?: string
}

type BookingPhase = 'slots' | 'form' | 'success'

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

const buildMonthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
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

export default function Agenda() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const envEventTypeId = import.meta.env.VITE_CAL_EVENT_TYPE_ID as string | undefined
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>(
    envEventTypeId ? String(envEventTypeId) : ''
  )
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]>>({})
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [attendeeName, setAttendeeName] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [timeZone, setTimeZone] = useState('UTC')
  const [bookingPhase, setBookingPhase] = useState<BookingPhase>('slots')
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [booking, setBooking] = useState<BookingSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedDateKey = useMemo(
    () => formatLocalDateKey(selectedDate),
    [selectedDate]
  )
  const slotsForSelectedDate = slotsByDate[selectedDateKey] ?? []
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  )

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz) setTimeZone(tz)
  }, [])

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
        return
      }

      const list = (data?.data?.data ?? data?.data ?? []) as Array<{ id: number | string }>
      if (list.length === 0) {
        setError('No hay horarios disponibles por ahora.')
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
    let isMounted = true

    const fetchSlots = async () => {
      if (!selectedEventTypeId || !calendarMonth) return
      setIsLoadingSlots(true)
      setError(null)
      setSelectedSlot('')

      const { start, end } = buildMonthRange(calendarMonth)

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
        setError(t('agenda.errors.loadAvailability'))
        setSlotsByDate({})
        setAvailableDates([])
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
        const times = Array.from(new Set(extractSlots(rawSlots)))
        if (times.length > 0) {
          normalized[selectedDateKey] = times.sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          )
          dates.push(selectedDateKey)
        }
      }

      setSlotsByDate(normalized)
      setAvailableDates(dates)
      setIsLoadingSlots(false)
    }

    fetchSlots()

    return () => {
      isMounted = false
    }
  }, [selectedEventTypeId, calendarMonth, timeZone, selectedDateKey])

  useEffect(() => {
    if (!slotsForSelectedDate.includes(selectedSlot)) {
      setSelectedSlot('')
    }
  }, [selectedDateKey, slotsForSelectedDate, selectedSlot])

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot)
    setBookingPhase('form')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setBooking(null)

    if (!selectedEventTypeId) {
      setError(t('agenda.errors.noAvailability'))
      return
    }
    if (!selectedSlot) {
      setError(t('agenda.errors.selectSlot'))
      return
    }
    if (!attendeeName || !attendeeEmail) {
      setError(t('agenda.errors.completeForm'))
      return
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
        }
      }
    })

    if (bookingError) {
      setError(t('agenda.errors.bookingFailed'))
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
    navigate({ to: '/gracias-agenda' })
  }

  const resetFlow = () => {
    setBookingPhase('slots')
    setSelectedSlot('')
    setBooking(null)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-[1200px] min-h-[640px] md:min-h-[680px] overflow-hidden rounded-[30px] shadow-[0_30px_80px_rgba(0,0,0,0.18)] bg-white grid md:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-black text-white p-7 md:p-10 flex flex-col justify-between">
          <div className="space-y-6">
        
            <div>
              <h1 className="text-[28px] md:text-[34px] font-semibold">{t('agenda.title')}</h1>
              <p className="mt-3 text-[14px] text-white/70 max-w-[260px]">
                {t('agenda.subtitle')}
              </p>
            </div>

            <div className="space-y-3 text-[13px] text-white/80">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  ⏱
                </span>
                <span>{t('agenda.durationTbd')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  TZ
                </span>
                <span className="text-[12px]">{timeZone}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[18px] border border-white/15 bg-white/5 p-4 text-[12px]">
            <p className="m-0 text-white/70">{t('agenda.summary')}</p>
            <p className="m-0 mt-2 text-[14px] font-semibold">
              {selectedSlot
                ? `${formatSlotDate(selectedSlot)} · ${formatSlotTime(selectedSlot)}`
                : t('agenda.selectSlot')}
            </p>
          </div>
        </div>

        <div className="p-7 md:p-10 h-full flex flex-col justify-center">
          {bookingPhase === 'success' ? (
            <div className="flex flex-col items-center text-center gap-4 py-10">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[24px]">
                ✓
              </div>
              <h2 className="text-[22px] font-semibold">{t('agenda.confirmedTitle')}</h2>
              <p className="text-[13px] opacity-70 max-w-[360px]">
                {t('agenda.confirmedMessage')}
              </p>
              {booking?.start && (
                <p className="text-[14px] font-semibold">
                  {formatSlotDate(booking.start)} · {formatSlotTime(booking.start)}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[320px]">
                <button
                  type="button"
                  className="flex-1 rounded-[14px] border border-black/10 px-4 py-3 text-[13px] uppercase tracking-[0.18em]"
                  onClick={resetFlow}
                >
                  {t('agenda.bookAnother')}
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-[14px] bg-black text-white px-4 py-3 text-[13px] uppercase tracking-[0.18em]"
                  onClick={() => (window.location.href = '/')}
                >
                  {t('agenda.backHome')}
                </button>
              </div>
            </div>
          ) : bookingPhase === 'slots' ? (
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-black/60">
                  {t('agenda.stepSelect')}
                </p>
                <h2 className="mt-2 text-[22px] font-semibold">{t('agenda.pickTime')}</h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
                <div className="rounded-[20px] border border-black/10 bg-white p-3 ddfit-datepicker">
                  <DatePicker
                    inline
                    selected={selectedDate}
                    onChange={(date) =>
                      date &&
                      setSelectedDate(
                        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
                      )
                    }
                    onMonthChange={(date) => date && setCalendarMonth(date)}
                    minDate={new Date()}
                    calendarClassName="ddfit-calendar"
                    dayClassName={(date) =>
                      availableDateSet.size > 0 && !availableDateSet.has(formatLocalDateKey(date))
                        ? 'ddfit-day--disabled'
                        : 'ddfit-day'
                    }
                    filterDate={(date) =>
                      availableDateSet.size === 0 ||
                      availableDateSet.has(formatLocalDateKey(date))
                    }
                  />
                </div>

                <div className="rounded-[20px] border border-black/10 bg-white p-5 h-[400px] overflow-y-auto no-scrollbar">
                  {isLoadingSlots ? (
                    <p className="text-[13px] opacity-70">{t('agenda.loading')}</p>
                  ) : slotsForSelectedDate.length === 0 ? (
                    <p className="text-[13px] opacity-70">{t('agenda.noSlots')}</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {slotsForSelectedDate.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className="w-full rounded-[16px] border border-black/10 px-4 py-3 text-[14px] font-semibold flex items-center justify-between hover:border-black/40 transition"
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <span>{formatSlotTime(slot)}</span>
                          <span className="text-[11px] text-black/50 uppercase tracking-[0.18em]">
                            {t('agenda.reserve')}
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
                  <p className="text-[12px] uppercase tracking-[0.2em] text-black/60">
                    {t('agenda.stepFinal')}
                  </p>
                  <h2 className="mt-2 text-[22px] font-semibold">{t('agenda.confirmDetails')}</h2>
                </div>
                <button
                  type="button"
                  className="text-[12px] uppercase tracking-[0.16em] opacity-60 hover:opacity-100"
                  onClick={() => setBookingPhase('slots')}
                >
                  {t('agenda.back')}
                </button>
              </div>

              <div className="rounded-[14px] border border-black/10 bg-[#f7f7f7] p-4 text-[13px]">
                <p className="m-0 font-semibold">{t('agenda.selectedSlot')}</p>
                <p className="m-0 mt-2 opacity-70">
                  {selectedSlot
                    ? `${formatSlotDate(selectedSlot)} · ${formatSlotTime(selectedSlot)}`
                    : t('agenda.selectSlot')}
                </p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-2 text-[13px]">
                  {t('agenda.fullName')}
                  <input
                    type="text"
                    className="rounded-[12px] border border-black/20 bg-white px-3 py-2 text-[14px]"
                    value={attendeeName}
                    onChange={(event) => setAttendeeName(event.target.value)}
                    placeholder={t('agenda.fullNamePlaceholder')}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-[13px]">
                  {t('agenda.email')}
                  <input
                    type="email"
                    className="rounded-[12px] border border-black/20 bg-white px-3 py-2 text-[14px]"
                    value={attendeeEmail}
                    onChange={(event) => setAttendeeEmail(event.target.value)}
                    placeholder={t('agenda.emailPlaceholder')}
                    required
                  />
                </label>

                {error && (
                  <div className="rounded-[12px] border border-red-500/40 bg-red-50 p-3 text-[13px] text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 rounded-[14px] bg-black text-white px-4 py-3 text-[13px] uppercase tracking-[0.2em] disabled:opacity-60"
                  disabled={isBooking}
                >
                  {isBooking ? t('agenda.confirming') : t('agenda.confirm')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
