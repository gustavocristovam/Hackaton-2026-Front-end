import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowRight, Check, Flame, Star, TrendingUp } from 'lucide-react'
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="text-sm text-muted">Que bom te ver por aqui 👋</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">
        Olá, {user?.name?.split(' ')[0] ?? 'atleta'}!
      </h1>

      <Card className="mt-8 flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-center">
        <AvatarCreature level={level} className="size-48 shrink-0" />

        <div className="w-full text-center sm:text-left">
          <p className="text-sm font-medium text-muted">Nível {level}</p>
          <p className="text-2xl font-bold text-ink">{AVATAR_LEVEL_NAMES[level]}</p>

          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface-alt">
            <motion.div
              className="h-full rounded-full bg-brand-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {avatar
              ? level >= 5
                ? 'Nível máximo alcançado!'
                : `Faltam ${xpToNextLevel(avatar)} XP para o próximo nível`
              : 'Faça seu primeiro check-in para evoluir'}
          </p>

          <div className="mt-5">
            {today ? (
              <p className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700">
                <Check className="size-4" />
                Check-in de hoje concluído
              </p>
            ) : (
              <Link to="/checkin">
                <Button size="lg">
                  Fazer check-in de hoje
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
          value={level}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ShortcutCard
          to="/progresso"
          title="Seu progresso"
          description="Gráficos de score e evolução dos atributos nos últimos 30 dias."
        />
        <ShortcutCard
          to="/conquistas"
          title="Conquistas"
          description="Medalhas e troféus que você desbloqueou até agora."
        />
      </div>
    </motion.div>
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

function ShortcutCard({
  to,
  title,
  description,
}: {
  to: string
  title: string
  description: string
}) {
  return (
    <Link to={to}>
      <Card className="h-full p-6 transition-colors hover:border-brand-300 hover:bg-brand-50/40">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">{title}</h2>
          <ArrowRight className="size-4 text-brand-600" />
        </div>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </Card>
    </Link>
  )
}
