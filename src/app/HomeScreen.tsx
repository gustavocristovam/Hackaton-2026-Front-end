import { motion } from 'framer-motion'
import { Flame, LogOut, Star, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '@/shared/ui/Logo'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { useAuthStore } from '@/domains/auth/presentation/authStore'
import { useCurrentUser, useUserStats } from '@/domains/user/presentation/useCurrentUser'

/**
 * Placeholder da tela principal — apenas confirma o fluxo autenticado.
 * Próximo passo do roadmap: substituir pela tela do avatar + check-in diário.
 */
export function HomeScreen() {
  const logout = useAuthStore((s) => s.logout)
  const { data: user } = useCurrentUser()
  const { data: stats } = useUserStats()

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-line)] bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-sm text-muted">Que bom te ver por aqui 👋</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">
            Olá, {user?.name?.split(' ')[0] ?? 'atleta'}!
          </h1>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat
              icon={<Star className="size-5" />}
              label="XP total"
              value={stats?.xpTotal ?? user?.xpTotal ?? 0}
            />
            <Stat
              icon={<Flame className="size-5" />}
              label="Streak atual"
              value={stats?.currentStreak ?? user?.currentStreak ?? 0}
              suffix=" dias"
            />
            <Stat
              icon={<TrendingUp className="size-5" />}
              label="Nível do avatar"
              value={stats?.avatarLevel ?? 1}
            />
          </div>

          <Card className="mt-8 p-6">
            <h2 className="font-semibold text-ink">Próximo passo</h2>
            <p className="mt-1 text-sm text-muted">
              O login está funcionando. A partir daqui construímos a tela do avatar e o
              check-in diário.
            </p>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  suffix,
}: {
  icon: ReactNode
  label: string
  value: number
  suffix?: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-brand-600">
        {icon}
        <span className="text-sm font-medium text-muted">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">
        {value}
        {suffix}
      </p>
    </Card>
  )
}
