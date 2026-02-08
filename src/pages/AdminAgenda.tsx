import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'

type Booking = Record<string, unknown>

const formatDateTime = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const extractBookings = (payload: unknown): Booking[] => {
  if (!payload || typeof payload !== 'object') return []
  const record = payload as Record<string, unknown>
  if (Array.isArray(record)) return record as Booking[]
  if (Array.isArray(record.data)) return record.data as Booking[]
  if (Array.isArray(record.bookings)) return record.bookings as Booking[]
  if (Array.isArray(record.results)) return record.results as Booking[]
  return []
}

export default function AdminAgenda() {
  const { t } = useTranslation()
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'cancelled' | 'rescheduled'>('all')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const loadBookings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error: invokeError } = await supabase.functions.invoke('cal', {
      body: {
        action: 'admin_list_bookings',
        status: statusFilter === 'all' ? undefined : statusFilter
      }
    })

    if (invokeError) {
      setError(invokeError.message || t('adminAgenda.errors.load'))
      setBookings([])
      setIsLoading(false)
      return
    }

    const calResponse = data?.data ?? {}
    const items = extractBookings(calResponse)
    setBookings(items)
    setIsLoading(false)
  }, [statusFilter, t])

  useEffect(() => {
    if (session) {
      loadBookings()
    }
  }, [session, loadBookings])

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleCancel = async (booking: Booking) => {
    const bookingUid = String(booking.uid ?? booking.id ?? '')
    if (!bookingUid) return
    const ok = window.confirm(t('adminAgenda.confirmCancel'))
    if (!ok) return

    setIsLoading(true)
    const { error: cancelError } = await supabase.functions.invoke('cal', {
      body: {
        action: 'cancel_booking',
        bookingUid
      }
    })

    if (cancelError) {
      setError(cancelError.message || t('adminAgenda.errors.cancel'))
      setIsLoading(false)
      return
    }

    await loadBookings()
  }

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return bookings

    return bookings.filter((booking) => {
      const attendee = (booking.attendees as Array<Record<string, unknown>> | undefined)?.[0]
      const emailValue = String(attendee?.email ?? '')
      const nameValue = String(attendee?.name ?? '')
      return (
        emailValue.toLowerCase().includes(query) ||
        nameValue.toLowerCase().includes(query) ||
        String(booking.uid ?? booking.id ?? '').toLowerCase().includes(query)
      )
    })
  }, [bookings, search])

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[24px] bg-black text-white p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,70,70,0.35),_transparent_60%)]" />
        <div className="relative z-10 flex flex-col gap-2">
          <p className="uppercase tracking-[0.28em] text-[11px] opacity-70">
            {t('adminAgenda.eyebrow')}
          </p>
          <h1 className="text-[28px] md:text-[36px] font-semibold">{t('adminAgenda.title')}</h1>
          <p className="max-w-[560px] text-[14px] md:text-[16px] opacity-80">
            {t('adminAgenda.subtitle')}
          </p>
        </div>
      </section>

      {!session ? (
        <section className="rounded-[20px] border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <h2 className="text-[18px] font-semibold">{t('adminAgenda.loginTitle')}</h2>
          <p className="text-[13px] opacity-70 mt-2">{t('adminAgenda.loginSubtitle')}</p>
          <form className="mt-6 flex flex-col gap-4 max-w-[360px]" onSubmit={handleLogin}>
            <label className="flex flex-col gap-2 text-[13px]">
              {t('adminAgenda.email')}
              <input
                type="email"
                className="rounded-[12px] border border-black/20 bg-white px-3 py-2 text-[14px]"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-[13px]">
              {t('adminAgenda.password')}
              <input
                type="password"
                className="rounded-[12px] border border-black/20 bg-white px-3 py-2 text-[14px]"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
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
              className="rounded-[14px] bg-black text-white px-4 py-3 text-[13px] uppercase tracking-[0.2em]"
            >
              {t('adminAgenda.login')}
            </button>
          </form>
        </section>
      ) : (
        <section className="rounded-[20px] border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[18px] font-semibold">{t('adminAgenda.listTitle')}</h2>
              <p className="text-[13px] opacity-70 mt-1">{t('adminAgenda.listSubtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <select
                className="rounded-[12px] border border-black/20 bg-white px-3 py-2 text-[13px]"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              >
                <option value="all">{t('adminAgenda.filters.all')}</option>
                <option value="scheduled">{t('adminAgenda.filters.scheduled')}</option>
                <option value="cancelled">{t('adminAgenda.filters.cancelled')}</option>
                <option value="rescheduled">{t('adminAgenda.filters.rescheduled')}</option>
              </select>
              <input
                className="rounded-[12px] border border-black/20 bg-white px-3 py-2 text-[13px]"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('adminAgenda.searchPlaceholder')}
              />
              <button
                type="button"
                className="rounded-[12px] border border-black/20 px-3 py-2 text-[12px] uppercase tracking-[0.2em]"
                onClick={loadBookings}
              >
                {t('adminAgenda.refresh')}
              </button>
              <button
                type="button"
                className="rounded-[12px] bg-black text-white px-3 py-2 text-[12px] uppercase tracking-[0.2em]"
                onClick={handleSignOut}
              >
                {t('adminAgenda.logout')}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-[12px] border border-red-500/40 bg-red-50 p-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-3">
            {isLoading ? (
              <p className="text-[13px] opacity-70">{t('adminAgenda.loading')}</p>
            ) : filteredBookings.length === 0 ? (
              <p className="text-[13px] opacity-70">{t('adminAgenda.empty')}</p>
            ) : (
              filteredBookings.map((booking) => {
                const attendee = (booking.attendees as Array<Record<string, unknown>> | undefined)?.[0]
                const status = String(booking.status ?? '').toLowerCase()
                const start = formatDateTime(String(booking.start ?? booking.startTime ?? ''))
                const end = formatDateTime(String(booking.end ?? booking.endTime ?? ''))
                const bookingId = String(booking.uid ?? booking.id ?? '')

                return (
                  <div
                    key={bookingId}
                    className="rounded-[16px] border border-black/10 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div>
                        <p className="m-0 text-[14px] font-semibold">
                          {attendee?.name ?? t('adminAgenda.unknownName')}
                        </p>
                        <p className="m-0 text-[12px] opacity-70">
                          {attendee?.email ?? t('adminAgenda.unknownEmail')}
                        </p>
                        <p className="m-0 text-[12px] opacity-70 mt-1">
                          {start}{end ? ` · ${end}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-black/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
                          {status || t('adminAgenda.statusUnknown')}
                        </span>
                        {bookingId && (
                          <span className="text-[11px] text-black/50">ID: {bookingId}</span>
                        )}
                        {status !== 'cancelled' && (
                          <button
                            type="button"
                            className="rounded-[12px] border border-black/20 px-3 py-2 text-[11px] uppercase tracking-[0.2em]"
                            onClick={() => handleCancel(booking)}
                          >
                            {t('adminAgenda.cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      )}
    </div>
  )
}
