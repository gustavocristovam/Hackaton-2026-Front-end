import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { Spinner } from './Spinner'

const button = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold',
    'transition-[transform,box-shadow,background-color,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-alt)]',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55',
  ],
  {
    variants: {
      variant: {
        /* Gradiente + linha de brilho no topo: dá volume sem parecer skeuomorfismo */
        primary: [
          'brand-gradient text-white',
          'shadow-[var(--shadow-e2),inset_0_1px_0_0_rgb(255_255_255/0.28)]',
          'hover:shadow-[var(--shadow-glow),inset_0_1px_0_0_rgb(255_255_255/0.28)]',
        ],
        secondary:
          'bg-brand-50/80 text-brand-700 backdrop-blur-sm hover:bg-brand-100/90 shadow-[var(--shadow-e1)]',
        outline: [
          'border border-[var(--glass-border)] bg-white/60 text-ink backdrop-blur-md',
          'shadow-[var(--shadow-e1),var(--glass-highlight)]',
          'hover:border-brand-300 hover:bg-white/85',
        ],
        ghost: 'text-brand-700 hover:bg-brand-500/10',
        danger:
          'bg-[var(--color-danger)] text-white shadow-[var(--shadow-e2)] hover:brightness-110',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(button({ variant, size, block }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
