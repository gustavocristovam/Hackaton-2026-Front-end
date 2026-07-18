import { motion } from 'framer-motion'
import { Award, Lock, Trophy } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'
import { PageHeader } from '@/shared/ui/PageHeader'
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

  const ratio = badges.length ? earnedCount / badges.length : 0

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Coleção"
        title="Conquistas"
        subtitle={`${earnedCount} de ${badges.length} medalhas desbloqueadas.`}
        action={
          badges.length > 0 && (
            <div className="w-full sm:w-56">
              <div className="h-2 overflow-hidden rounded-full bg-ink/[0.07] shadow-[inset_0_1px_2px_rgb(11_26_18/0.08)]">
                <motion.div
                  className="h-full rounded-full brand-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${ratio * 100}%` }}
                  transition={{ duration: 0.9, ease: [0.2, 0, 0, 1], delay: 0.2 }}
                />
              </div>
              <p className="mt-1.5 text-right text-xs font-semibold text-muted">
                {Math.round(ratio * 100)}% completo
              </p>
            </div>
          )
        }
      />

      {trophies && trophies.length > 0 && (
        <section className="mt-8">
          <SectionHeading icon={<Trophy className="size-4" />} tone="amber">
            Troféus
          </SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            {trophies.map((trophy) => (
              <Card
                key={trophy.id}
                className="flex items-start gap-3.5 border-amber-200/70 bg-amber-50/60 p-5 backdrop-blur-xl"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-amber-400 to-amber-600 text-white shadow-[0_8px_24px_-8px_rgb(245_158_11/0.6),inset_0_1px_0_0_rgb(255_255_255/0.3)]">
                  <Trophy className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold tracking-tight text-ink">{trophy.name}</p>
                  {trophy.description && (
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">
                      {trophy.description}
                    </p>
                  )}
                  {trophy.earnedAt && (
                    <p className="mt-1.5 text-xs font-medium text-amber-700">
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
        <SectionHeading icon={<Award className="size-4" />} tone="brand">
          Medalhas
        </SectionHeading>

        {badges.length === 0 ? (
          <Card className="p-10 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-ink/5 text-muted">
              <Award className="size-6" />
            </span>
            <p className="mt-3 text-sm text-muted">
              O catálogo de medalhas ainda não está disponível.
            </p>
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.035, 0.35),
        ease: [0.2, 0, 0, 1],
      }}
    >
      <Card
        className={cn(
          'relative h-full overflow-hidden p-5',
          // Conquistada ganha cor e brilho; bloqueada recua para o fundo.
          badge.earned
            ? 'border-brand-200/70 bg-brand-50/60'
            : 'bg-white/45 saturate-[0.6]',
        )}
      >
        {badge.earned && (
          <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-brand-400/25 blur-2xl" />
        )}

        <span
          className={cn(
            'relative grid size-11 place-items-center rounded-xl',
            badge.earned
              ? 'brand-gradient text-white shadow-[var(--shadow-glow),inset_0_1px_0_0_rgb(255_255_255/0.3)]'
              : 'bg-ink/5 text-muted ring-1 ring-inset ring-ink/5',
          )}
        >
          {badge.earned ? <Award className="size-5" /> : <Lock className="size-4" />}
        </span>

        <p
          className={cn(
            'relative mt-3.5 font-bold tracking-tight',
            badge.earned ? 'text-ink' : 'text-ink/60',
          )}
        >
          {badge.name}
        </p>
        {badge.description && (
          <p className="relative mt-1 text-sm leading-relaxed text-muted">
            {badge.description}
          </p>
        )}
        {badge.criterio && (
          <p className="relative mt-2.5 rounded-lg bg-ink/[0.04] px-2 py-1 text-xs text-muted">
            {badge.criterio}
          </p>
        )}
        {badge.earned && badge.earnedAt && (
          <p className="relative mt-2.5 text-xs font-semibold text-brand-700">
            Conquistada em {formatDate(badge.earnedAt)}
          </p>
        )}
      </Card>
    </motion.div>
  )
}

function SectionHeading({
  icon,
  tone,
  children,
}: {
  icon: React.ReactNode
  tone: 'brand' | 'amber'
  children: React.ReactNode
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 font-bold tracking-tight text-ink">
      <span
        className={cn(
          'grid size-7 place-items-center rounded-lg ring-1 ring-inset',
          tone === 'brand'
            ? 'bg-brand-500/12 text-brand-600 ring-brand-500/15'
            : 'bg-amber-500/12 text-amber-600 ring-amber-500/15',
        )}
      >
        {icon}
      </span>
      {children}
    </h2>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}
