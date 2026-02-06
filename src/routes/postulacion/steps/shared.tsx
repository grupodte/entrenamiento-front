import type { ReactNode } from 'react'
import { Label } from '../../../components/ui/label'
import { cn } from '../../../lib/utils'

export function FieldWrapper({
  label,
  hint,
  children
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        {hint ? <p className="m-0 text-[13px] text-black/50">{hint}</p> : null}
      </div>
      {children}
    </div>
  )
}

function getErrorMessage(error: unknown) {
  if (!error) return null
  if (typeof error === 'string') return error
  if (typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '')
  }
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

export function FieldError({
  touched,
  error
}: {
  touched: boolean
  error?: unknown
}) {
  const message = touched ? getErrorMessage(error) : null
  if (!message) return null
  return <p className="m-0 text-[12px] text-[#c1121f]">{message}</p>
}

export function OptionCard({
  label,
  description,
  active,
  onClick
}: {
  label: string
  description?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full rounded-[20px] border px-4 py-3 text-left transition-all duration-200',
        active
          ? 'border-black bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)]'
          : 'border-black/10 bg-white/70 text-black hover:border-black/30 hover:bg-white'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={cn('m-0 text-[14px] font-medium', active ? 'text-white' : 'text-black')}>
            {label}
          </p>
          {description ? (
            <p className={cn('m-0 text-[12px]', active ? 'text-white/70' : 'text-black/50')}>
              {description}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full transition',
            active ? 'bg-white' : 'bg-black/10 group-hover:bg-black/20'
          )}
        />
      </div>
    </button>
  )
}

export function YesNoButtons({
  value,
  onChange,
  yesLabel = 'Sí',
  noLabel = 'No'
}: {
  value: boolean | undefined
  onChange: (value: boolean) => void
  yesLabel?: string
  noLabel?: string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <OptionCard label={yesLabel} active={value === true} onClick={() => onChange(true)} />
      <OptionCard label={noLabel} active={value === false} onClick={() => onChange(false)} />
    </div>
  )
}

export function markTouched(field: { state: { meta: { isTouched: boolean } }; setMeta: any }) {
  if (!field.state.meta.isTouched) {
    field.setMeta((prev: any) => ({ ...prev, isTouched: true }))
  }
}
