import { motion } from 'framer-motion'
import { CalendarDays, Dumbbell, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'
import { PageHeader } from '@/shared/ui/PageHeader'
import { cn } from '@/shared/lib/cn'
import { useAvatarHistory } from '@/domains/avatar/presentation/useAvatar'
import { ScoreHistoryChart } from './ScoreHistoryChart'
import { AvatarEvolutionChart } from './AvatarEvolutionChart'
import {
  useDailyScore,
  useScoreHistory,
  useWeeklyFeedback,
  useWeeklyScore,
} from './useScore'

/** Últimos 30 dias como período padrão dos gráficos. */
function defaultRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

export function ProgressScreen() {
  const range = defaultRange()
  const { data: daily } = useDailyScore()
  const { data: weekly } = useWeeklyScore()
  const { data: history, isLoading } = useScoreHistory(range)
  const { data: feedback } = useWeeklyFeedback()
  const { data: avatarHistory } = useAvatarHistory(range)

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Últimos 30 dias"
        title="Seu progresso"
        subtitle="Score, consistência e evolução dos atributos do avatar."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Score de hoje"
          value={daily?.score ?? '—'}
          delay={0}
          footer={
            <span className="text-xs font-semibold text-brand-700">
              {daily?.classificacao ?? 'sem check-in'}
            </span>
          }
        />

        <MetricCard
          label="Média da semana"
          value={weekly?.media ?? '—'}
          delay={0.06}
          footer={
            weekly?.variacao != null ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold',
                  weekly.variacao >= 0
                    ? 'bg-brand-500/12 text-brand-700'
                    : 'bg-danger/10 text-danger',
                )}
              >
                {weekly.variacao >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {weekly.variacao > 0 ? '+' : ''}
                {weekly.variacao} vs. semana anterior
              </span>
            ) : null
          }
        />

        <MetricCard
          label="Dias treinados"
          value={feedback?.diasTreinados ?? '—'}
          delay={0.12}
          footer={
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
              <Dumbbell className="size-3" />
              nesta semana
            </span>
          }
        />
      </div>

      <ChartCard
        icon={<CalendarDays className="size-4" />}
        title="Score diário"
        className="mt-5"
      >
        {isLoading ? (
          <div className="grid h-56 place-items-center">
            <Spinner className="size-7 text-brand-600" />
          </div>
        ) : (
          <ScoreHistoryChart data={history ?? []} />
        )}
      </ChartCard>

      <ChartCard
        icon={<Sparkles className="size-4" />}
        title="Atributos do avatar"
        className="mt-5"
      >
        <AvatarEvolutionChart data={avatarHistory ?? []} />
      </ChartCard>

      {feedback && (feedback.resumo || feedback.destaques.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
        >
          <Card variant="brand" className="mt-5 p-6">
            <h2 className="font-bold tracking-tight text-ink">Resumo da semana</h2>
            {feedback.resumo && (
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                {feedback.resumo}
              </p>
            )}

            {feedback.destaques.length > 0 && (
              <ul className="mt-4 space-y-2">
                {feedback.destaques.map((item) => (
                  <Highlight key={item} tone="good">
                    {item}
                  </Highlight>
                ))}
              </ul>
            )}

            {feedback.pontosDeAtencao.length > 0 && (
              <ul className="mt-2 space-y-2">
                {feedback.pontosDeAtencao.map((item) => (
                  <Highlight key={item} tone="warn">
                    {item}
                  </Highlight>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  footer,
  delay,
}: {
  label: string
  value: string | number
  footer: ReactNode
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.2, 0, 0, 1] }}
    >
      <Card className="h-full p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight brand-text-gradient">
          {value}
        </p>
        <div className="mt-1.5">{footer}</div>
      </Card>
    </motion.div>
  )
}

function ChartCard({
  icon,
  title,
  className,
  children,
}: {
  icon: ReactNode
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    // `solid`: gráfico sobre vidro translúcido demais prejudica a leitura
    <Card variant="solid" className={cn('p-6', className)}>
      <div className="mb-5 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-brand-500/12 text-brand-600 ring-1 ring-inset ring-brand-500/15">
          {icon}
        </span>
        <h2 className="font-bold tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </Card>
  )
}

function Highlight({
  tone,
  children,
}: {
  tone: 'good' | 'warn'
  children: ReactNode
}) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-ink/75">
      <span
        className={cn(
          'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-[0.625rem] font-bold text-white',
          tone === 'good' ? 'bg-brand-600' : 'bg-warning',
        )}
      >
        {tone === 'good' ? '✓' : '!'}
      </span>
      {children}
    </li>
  )
}
