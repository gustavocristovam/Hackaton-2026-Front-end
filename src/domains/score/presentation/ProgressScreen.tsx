import { motion } from 'framer-motion'
import { CalendarDays, Dumbbell, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'
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
      <header>
        <h1 className="text-2xl font-bold text-ink">Seu progresso</h1>
        <p className="mt-1 text-sm text-muted">Últimos 30 dias de consistência.</p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-medium text-muted">Score de hoje</p>
          <p className="mt-1 text-3xl font-bold text-ink">{daily?.score ?? '—'}</p>
          <p className="text-xs font-medium text-brand-600">
            {daily?.classificacao ?? 'sem check-in'}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-muted">Média da semana</p>
          <p className="mt-1 text-3xl font-bold text-ink">{weekly?.media ?? '—'}</p>
          {weekly?.variacao != null && (
            <p
              className={`flex items-center gap-1 text-xs font-medium ${
                weekly.variacao >= 0 ? 'text-brand-600' : 'text-[var(--color-danger)]'
              }`}
            >
              {weekly.variacao >= 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {weekly.variacao > 0 ? '+' : ''}
              {weekly.variacao} vs. semana anterior
            </p>
          )}
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-muted">Dias treinados</p>
          <p className="mt-1 text-3xl font-bold text-ink">
            {feedback?.diasTreinados ?? '—'}
          </p>
          <p className="flex items-center gap-1 text-xs font-medium text-muted">
            <Dumbbell className="size-3" />
            nesta semana
          </p>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="size-4 text-brand-600" />
          <h2 className="font-semibold text-ink">Score diário</h2>
        </div>
        {isLoading ? (
          <div className="grid h-56 place-items-center">
            <Spinner className="size-7 text-brand-600" />
          </div>
        ) : (
          <ScoreHistoryChart data={history ?? []} />
        )}
      </Card>

      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-brand-600" />
          <h2 className="font-semibold text-ink">Atributos do avatar</h2>
        </div>
        <AvatarEvolutionChart data={avatarHistory ?? []} />
      </Card>

      {feedback && (feedback.resumo || feedback.destaques.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mt-6 border-brand-200 bg-brand-50 p-6">
            <h2 className="font-semibold text-ink">Resumo da semana</h2>
            {feedback.resumo && (
              <p className="mt-2 text-sm text-ink/80">{feedback.resumo}</p>
            )}

            {feedback.destaques.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {feedback.destaques.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-ink/80">
                    <span className="text-brand-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {feedback.pontosDeAtencao.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {feedback.pontosDeAtencao.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-ink/80">
                    <span className="text-[var(--color-warning)]">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  )
}
