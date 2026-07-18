import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400',
              leftIcon && 'pl-10',
              error
                ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/40'
                : 'border-[var(--color-line)]',
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <span className="text-xs text-[var(--color-danger)]">{error}</span>
        ) : hint ? (
          <span className="text-xs text-muted">{hint}</span>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'
