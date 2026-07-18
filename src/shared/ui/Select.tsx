import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
}

/** Espelha o visual do Input — o select nativo do browser destoa do resto. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, id, children, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id ?? generatedId
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[0.8125rem] font-semibold tracking-tight text-ink"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'h-11 w-full appearance-none rounded-xl border bg-white/70 px-3.5 pr-10 text-sm text-ink backdrop-blur-md',
              'shadow-[var(--shadow-e1),var(--glass-highlight)] transition-all duration-200',
              'focus:bg-white focus:outline-none focus:ring-4',
              error
                ? 'border-danger/50 focus:border-danger focus:ring-danger/15'
                : 'border-(--glass-border) hover:border-brand-200 focus:border-brand-400 focus:ring-brand-500/15',
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        </div>
        {error ? (
          <span className="text-xs font-medium text-danger">{error}</span>
        ) : hint ? (
          <span className="text-xs text-muted">{hint}</span>
        ) : null}
      </div>
    )
  },
)
Select.displayName = 'Select'
