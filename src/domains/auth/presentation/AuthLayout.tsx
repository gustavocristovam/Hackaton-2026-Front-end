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
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Painel de marca — verde profundo com aurora e grão próprios */}
      <div className="relative hidden overflow-hidden bg-brand-900 lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(48rem 32rem at 18% 8%, #16a34a 0%, transparent 58%),' +
              'radial-gradient(40rem 30rem at 88% 78%, #0d9488 0%, transparent 60%),' +
              'linear-gradient(160deg, #14532d 0%, #052e1a 100%)',
          }}
        />
        {/* Grão: mesma textura do app, mais forte sobre fundo escuro */}
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <motion.div
          aria-hidden
          className="absolute -right-24 top-1/4 size-96 rounded-full bg-brand-400/20 blur-3xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo tone="light" />

          <div className="space-y-8">
            <h2 className="max-w-md text-[2.5rem] font-bold leading-[1.1] tracking-[-0.03em]">
              Sua saúde vira um jogo que você quer{' '}
              <span className="bg-linear-to-r from-brand-300 to-teal-300 bg-clip-text text-transparent">
                vencer todo dia.
              </span>
            </h2>
            <ul className="space-y-3">
              <Feature icon={<Sparkles className="size-5" />} delay={0.1}>
                Check-in diário e evolução do seu avatar
              </Feature>
              <Feature icon={<TrendingUp className="size-5" />} delay={0.18}>
                Score, XP e streak de 100 dias
              </Feature>
              <Feature icon={<Trophy className="size-5" />} delay={0.26}>
                Medalhas, troféus e ranking com sua organização
              </Feature>
            </ul>
          </div>

          <p className="text-sm font-medium text-white/50">
            Desafio de 100 dias · Free e Premium
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-[1.75rem] font-bold leading-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        </motion.div>
      </div>
    </div>
  )
}

/** Item da lista de benefícios: cartão de vidro escuro. */
function Feature({
  icon,
  delay,
  children,
}: {
  icon: ReactNode
  delay: number
  children: ReactNode
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.2, 0, 0, 1] }}
      className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/12 text-brand-200 ring-1 ring-inset ring-white/15">
        {icon}
      </span>
      <span className="text-sm font-medium text-white/85">{children}</span>
    </motion.li>
  )
}
