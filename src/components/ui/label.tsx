import { cn } from '../../lib/utils'
import type { LabelHTMLAttributes } from 'react'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('text-[13px] uppercase tracking-[0.2em] text-black/60', className)} {...props} />
  )
}
