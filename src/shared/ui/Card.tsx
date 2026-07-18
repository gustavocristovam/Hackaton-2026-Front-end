import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--color-line)] bg-surface shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
