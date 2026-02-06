import { cn } from '../../lib/utils'
import type { SelectHTMLAttributes } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full rounded-[18px] border border-black/10 bg-white/80 px-4 py-3 text-[14px] text-black shadow-[0_10px_30px_rgba(15,15,15,0.06)] outline-none transition focus:border-black/40 focus:bg-white',
        className
      )}
      {...props}
    />
  )
}
