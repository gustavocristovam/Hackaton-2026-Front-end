import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowRight, Check, Flame, Star, TrendingUp, Trophy, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { useCurrentUser, useUserStats } from '@/domains/user/presentation/useCurrentUser'
import { useAvatar } from '@/domains/avatar/presentation/useAvatar'
import { AvatarCreature } from '@/domains/avatar/presentation/AvatarCreature'
import { useTodayCheckin } from '@/domains/checkin/presentation/useCheckin'
import {
  AVATAR_LEVEL_NAMES,
  levelProgress,
  toAvatarLevel,
  xpToNextLevel,
} from '@/domains/avatar/domain/Avatar'

/** Tela principal: avatar, resumo do dia e atalho para o check-in. */
export function HomeScreen() {
  const { data: user } = useCurrentUser()
  const { data: stats } = useUserStats()
  const { data: avatar } = useAvatar()
  const { data: today } = useTodayCheckin()

  const level = toAvatarLevel(avatar?.level ?? stats?.avatarLevel ?? 1)
  const progress = avatar ? levelProgress(avatar) : 0

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      >
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-brand-600">
          {greeting()}
        </p>
        <h1 className="mt-1.5 text-[1.75rem] font-bold leading-tight text-ink">
          Olá, {user?.name?.split(' ')[0] ?? 'atleta'}
        </h1>
      </motion.div>

      {/* Herói: avatar sobre um halo cônico que gira devagar */}
      <Card variant="solid" className="relative mt-7 overflow-hidden p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand-400/15 blur-3xl" />

        <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
          <div className="relative shrink-0">
            <motion.div
              aria-hidden
              className="absolute inset-0 -m-4 rounded-full opacity-60 blur-xl"
              style={{
                background:
                  'conic-gradient(from 0deg, #4ade80, #0d9488, #65a30d, #4ade80)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative grid size-44 place-items-center rounded-full border border-white/60 bg-white/70 shadow-[var(--shadow-e2),var(--glass-highlight)] backdrop-blur-sm">
              <AvatarCreature level={level} className="size-36" />
            </div>
          </div>

          <div className="w-full text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/12 px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-inset ring-brand-500/20">
              <Trophy className="size-3" />
              Nível {level}
            </span>
            <p className="mt-3 text-3xl font-bold tracking-tight text-ink">
              {AVATAR_LEVEL_NAMES[level]}
            </p>

            <ProgressBar value={progress} />

            <p className="mt-2.5 text-xs font-medium text-muted">
              {avatar
                ? level >= 5
                  ? 'Nível máximo alcançado — você chegou ao topo.'
                  : `Faltam ${xpToNextLevel(avatar)} XP para o próximo nível`
                : 'Faça seu primeiro check-in para evoluir'}
            </p>

            <div className="mt-6">
              {today ? (
                <p className="inline-flex items-center gap-2 rounded-xl bg-brand-500/12 px-4 py-2.5 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-500/20">
                  <Check className="size-4" />
                  Check-in de hoje concluído
                </p>
              ) : (
                <Link to="/checkin">
                  <Button size="lg" className="group">
                    Fazer check-in de hoje
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<Star className="size-4" />}
          label="XP total"
          value={stats?.xpTotal ?? user?.xpTotal ?? 0}
          delay={0}
        />
        <Stat
          icon={<Flame className="size-4" />}
          label="Streak atual"
          value={stats?.currentStreak ?? user?.currentStreak ?? 0}
          suffix=" dias"
          delay={0.06}
        />
        <Stat
          icon={<TrendingUp className="size-4" />}
          label="Nível do avatar"
          value={level}
          delay={0.12}
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <ShortcutCard
          to="/progresso"
          icon={<TrendingUp className="size-4" />}
          title="Seu progresso"
          description="Score e atributos nos últimos 30 dias."
        />
        <ShortcutCard
          to="/conquistas"
          icon={<Trophy className="size-4" />}
          title="Conquistas"
          description="Medalhas que você desbloqueou."
        />
        <ShortcutCard
          to="/organizacao"
          icon={<Users className="size-4" />}
          title="Organização"
          description="Sua equipe e o ranking do grupo."
        />
      </div>
    </div>
  )
}

/** Barra de XP: gradiente da marca + varredura de brilho enquanto não estiver cheia. */
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-ink/[0.07] shadow-[inset_0_1px_2px_rgb(11_26_18/0.08)]">
      <motion.div
        className="relative h-full rounded-full brand-gradient"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(value * 100, 2)}%` }}
        transition={{ duration: 0.9, ease: [0.2, 0, 0, 1], delay: 0.15 }}
      >
        <motion.span
          aria-hidden
          className="absolute inset-y-0 w-16 bg-linear-to-r from-transparent via-white/50 to-transparent"
          animate={{ x: ['-4rem', '18rem'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </motion.div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  suffix,
  delay,
}: {
  icon: ReactNode
  label: string
  value: number
  suffix?: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.2, 0, 0, 1] }}
    >
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-brand-500/12 text-brand-600 ring-1 ring-inset ring-brand-500/15">
            {icon}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight brand-text-gradient">
          {value}
          {suffix && <span className="text-lg font-semibold">{suffix}</span>}
        </p>
      </Card>
    </motion.div>
  )
}

function ShortcutCard({
  to,
  icon,
  title,
  description,
}: {
  to: string
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Link to={to} className="group block">
      <Card interactive className="h-full p-5">
        <div className="flex items-center justify-between">
          <span className="grid size-8 place-items-center rounded-lg bg-brand-500/12 text-brand-600 ring-1 ring-inset ring-brand-500/15">
            {icon}
          </span>
          <ArrowRight className="size-4 text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-600" />
        </div>
        <h2 className="mt-3 font-bold tracking-tight text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
      </Card>
    </Link>
  )
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}
