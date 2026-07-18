import { HeartPulse } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export function Logo({
  className,
  withText = true,
  tone = 'default',
}: {
  className?: string
  withText?: boolean
  /** `light` para fundos escuros (painel de marca do onboarding). */
  tone?: 'default' | 'light'
}) {
  const light = tone === 'light'

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'grid size-9 place-items-center rounded-[0.7rem] shadow-[var(--shadow-glow),inset_0_1px_0_0_rgb(255_255_255/0.35)]',
          light ? 'bg-white text-brand-600' : 'brand-gradient text-white',
        )}
      >
        <HeartPulse className="size-5" />
      </span>
      {withText && (
        <span
          className={cn(
            'text-lg font-bold tracking-[-0.03em]',
            light ? 'text-white' : 'text-ink',
          )}
        >
          Orb
          <span className={light ? 'text-brand-300' : 'brand-text-gradient'}>Fit</span>
        </span>
      )}
    </div>
  )
}
