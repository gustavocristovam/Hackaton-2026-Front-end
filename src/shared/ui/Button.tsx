import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { Spinner } from './Spinner'

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
        secondary:
          'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200',
        outline:
          'border border-[var(--color-line)] bg-white text-ink hover:bg-brand-50',
        ghost: 'text-brand-700 hover:bg-brand-50',
        danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
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
