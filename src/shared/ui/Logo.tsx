import { HeartPulse } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export function Logo({
  className,
  withText = true,
}: {
  className?: string
  withText?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
        <HeartPulse className="size-5" />
      </span>
      {withText && (
        <span className="text-lg font-bold tracking-tight text-ink">
          Saúde<span className="text-brand-600">Gamificada</span>
        </span>
      )}
    </div>
  )
}
