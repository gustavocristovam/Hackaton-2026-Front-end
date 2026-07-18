import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Sparkles, TrendingUp, Trophy } from 'lucide-react'
import { Logo } from '@/shared/ui/Logo'

/** Moldura das telas de onboarding: painel de marca à esquerda, formulário à direita. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel de marca */}
      <div className="relative hidden overflow-hidden bg-brand-600 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-800" />
        <div className="absolute -right-16 -top-16 size-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-10 size-96 rounded-full bg-white/5" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo className="[&_span:last-child]:text-white [&_span:first-child]:bg-white [&_svg]:text-brand-600" />
          <div className="space-y-6">
            <h2 className="max-w-sm text-3xl font-bold leading-tight">
              Sua saúde vira um jogo que você quer vencer todo dia.
            </h2>
            <ul className="space-y-4 text-brand-50">
              <Feature icon={<Sparkles className="size-5" />}>
                Check-in diário e evolução do seu avatar
              </Feature>
              <Feature icon={<TrendingUp className="size-5" />}>
                Score, XP e streak de 100 dias
              </Feature>
              <Feature icon={<Trophy className="size-5" />}>
                Medalhas, troféus e ranking com sua organização
              </Feature>
            </ul>
          </div>
          <p className="text-sm text-brand-100">Desafio de 100 dias · Free e Premium</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center bg-surface-alt px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        </motion.div>
      </div>
    </div>
  )
}

function Feature({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15">
        {icon}
      </span>
      <span className="text-sm">{children}</span>
    </li>
  )
}
