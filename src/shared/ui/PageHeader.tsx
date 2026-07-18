import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Cabeçalho padrão das telas internas. Centraliza o ritmo tipográfico
 * (eyebrow → título → subtítulo) para as telas não divergirem entre si.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      className="flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        {eyebrow && (
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 text-[1.75rem] font-bold leading-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </motion.header>
  )
}
