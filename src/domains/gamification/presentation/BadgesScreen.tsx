import { motion } from 'framer-motion'
import { Award, Lock, Trophy } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'
import { useBadgeProgress, useMyTrophies } from './useGamification'
import type { BadgeProgress } from '../domain/Badge'

export function BadgesScreen() {
  const { badges, earnedCount, isLoading } = useBadgeProgress()
  const { data: trophies } = useMyTrophies()

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner className="size-8 text-brand-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="text-2xl font-bold text-ink">Conquistas</h1>
        <p className="mt-1 text-sm text-muted">
          {earnedCount} de {badges.length} medalhas desbloqueadas.
        </p>
      </header>

      {trophies && trophies.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <Trophy className="size-4 text-[var(--color-warning)]" />
            Troféus
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {trophies.map((trophy) => (
              <Card
                key={trophy.id}
                className="flex items-start gap-3 border-amber-200 bg-amber-50/60 p-5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--color-warning)] text-white">
                  <Trophy className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{trophy.name}</p>
                  {trophy.description && (
                    <p className="text-sm text-muted">{trophy.description}</p>
                  )}
                  {trophy.earnedAt && (
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(trophy.earnedAt)}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink">
          <Award className="size-4 text-brand-600" />
          Medalhas
        </h2>

        {badges.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted">
            O catálogo de medalhas ainda não está disponível.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge, index) => (
              <BadgeCard key={badge.id} badge={badge} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function BadgeCard({ badge, index }: { badge: BadgeProgress; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Card
        className={cn(
          'h-full p-5',
          badge.earned ? 'border-brand-200 bg-brand-50/50' : 'opacity-75',
        )}
      >
        <span
          className={cn(
            'grid size-10 place-items-center rounded-xl',
            badge.earned
              ? 'bg-brand-600 text-white'
              : 'bg-[var(--color-surface-alt)] text-muted',
          )}
        >
          {badge.earned ? <Award className="size-5" /> : <Lock className="size-4" />}
        </span>

        <p className="mt-3 font-semibold text-ink">{badge.name}</p>
        {badge.description && (
          <p className="mt-0.5 text-sm text-muted">{badge.description}</p>
        )}
        {badge.criterio && (
          <p className="mt-2 text-xs text-muted/80">Critério: {badge.criterio}</p>
        )}
        {badge.earned && badge.earnedAt && (
          <p className="mt-2 text-xs font-medium text-brand-600">
            Conquistada em {formatDate(badge.earnedAt)}
          </p>
        )}
      </Card>
    </motion.div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}
