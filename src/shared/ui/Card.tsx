import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

const card = cva('rounded-[var(--radius-card)]', {
  variants: {
    variant: {
      /** Vidro translúcido sobre a aurora — o padrão do app. */
      glass: 'glass',
      /** Vidro mais opaco: use quando houver gráfico ou texto denso dentro. */
      solid: 'glass-strong',
      /** Destaque de marca: fundo verde suave com borda viva. */
      brand:
        'border border-brand-200/70 bg-brand-50/70 shadow-[var(--shadow-e1)] backdrop-blur-xl',
    },
    /** Reage ao mouse — só para cards clicáveis. */
    interactive: { true: 'lift cursor-pointer', false: '' },
  },
  defaultVariants: { variant: 'glass', interactive: false },
})

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card> {}

export function Card({ className, variant, interactive, ...props }: CardProps) {
  return <div className={cn(card({ variant, interactive }), className)} {...props} />
}
