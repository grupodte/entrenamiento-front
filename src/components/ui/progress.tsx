import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '../../lib/utils'

export function Progress({
  className,
  value
}: {
  className?: string
  value: number
}) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        'relative h-[6px] w-full overflow-hidden rounded-full bg-black/10',
        className
      )}
      value={value}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}
