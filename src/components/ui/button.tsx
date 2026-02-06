import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'subtle'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[transform,opacity,background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 disabled:opacity-50 disabled:pointer-events-none active:translate-y-[1px]'

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-black/90',
  outline:
    'border border-black/20 bg-white/60 text-black backdrop-blur hover:border-black/40',
  ghost: 'bg-transparent text-black/70 hover:text-black hover:bg-black/5',
  subtle: 'bg-black/5 text-black hover:bg-black/10'
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs tracking-[0.08em] uppercase',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
)

Button.displayName = 'Button'

export { Button }
