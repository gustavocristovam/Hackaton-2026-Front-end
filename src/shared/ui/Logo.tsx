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
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="relative grid size-9 place-items-center rounded-[0.7rem] brand-gradient text-white shadow-[var(--shadow-glow),inset_0_1px_0_0_rgb(255_255_255/0.35)]">
        <HeartPulse className="size-5" />
      </span>
      {withText && (
        <span className="text-lg font-bold tracking-[-0.03em] text-ink">
          Orb<span className="brand-text-gradient">Fit</span>
        </span>
      )}
    </div>
  )
}
