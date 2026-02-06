import { cn } from '../../lib/utils'
import type { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full min-h-[120px] rounded-[18px] border border-black/10 bg-white/80 px-4 py-3 text-[14px] text-black shadow-[0_10px_30px_rgba(15,15,15,0.06)] outline-none transition focus:border-black/40 focus:bg-white',
        className
      )}
      {...props}
    />
  )
}
