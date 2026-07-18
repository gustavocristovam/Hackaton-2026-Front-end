import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Check, Droplets, Dumbbell, Moon, Smile, Utensils, Zap } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { PageHeader } from '@/shared/ui/PageHeader'
import { cn } from '@/shared/lib/cn'
import {
  AGUA_OPTIONS,
  ALIMENTACAO_OPTIONS,
  HUMOR_OPTIONS,
  SONO_OPTIONS,
  classifyScore,
  estimateScore,
  type CheckinAnswers,
  type Energia,
} from '../domain/Checkin'
import { useSubmitCheckin, useTodayCheckin } from './useCheckin'
import { CheckinDoneCard } from './CheckinDoneCard'

export function CheckinScreen() {
  const navigate = useNavigate()
  const { data: today, isLoading } = useTodayCheckin()
  const submit = useSubmitCheckin()
  const [answers, setAnswers] = useState<Partial<CheckinAnswers>>({})

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner className="size-8 text-brand-600" />
      </div>
    )
  }

  // Já respondeu hoje → mostra o resultado em vez do formulário.
  if (today) return <CheckinDoneCard checkin={today} />

  const complete =
    !!answers.sono &&
    !!answers.agua &&
    !!answers.humor &&
    !!answers.alimentacao &&
    answers.treino !== undefined

  const preview = estimateScore(answers)

  function handleSubmit() {
    if (!complete) return
    submit.mutate(answers as CheckinAnswers, {
      onSuccess: () => navigate('/'),
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow={todayLabel()}
        title="Check-in de hoje"
        subtitle="Seis perguntas rápidas para o seu avatar acompanhar o seu dia."
      />

      <div className="mt-8 space-y-3.5">
        <Question icon={<Moon className="size-4" />} label="Como foi seu sono?">
          <Options
            options={SONO_OPTIONS}
            value={answers.sono}
            onChange={(sono) => setAnswers((a) => ({ ...a, sono }))}
          />
        </Question>

        <Question icon={<Droplets className="size-4" />} label="Bebeu água suficiente?">
          <Options
            options={AGUA_OPTIONS}
            value={answers.agua}
            onChange={(agua) => setAnswers((a) => ({ ...a, agua }))}
          />
        </Question>

        <Question icon={<Dumbbell className="size-4" />} label="Treinou hoje?">
          <div className="flex gap-2">
            {[
              { label: 'Sim, treinei', value: true },
              { label: 'Hoje não', value: false },
            ].map((option) => (
              <Chip
                key={String(option.value)}
                selected={answers.treino === option.value}
                onClick={() => setAnswers((a) => ({ ...a, treino: option.value }))}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </Question>

        <Question icon={<Smile className="size-4" />} label="Como está seu humor?">
          <Options
            options={HUMOR_OPTIONS}
            value={answers.humor}
            onChange={(humor) => setAnswers((a) => ({ ...a, humor }))}
          />
        </Question>

        <Question icon={<Utensils className="size-4" />} label="E a alimentação?">
          <Options
            options={ALIMENTACAO_OPTIONS}
            value={answers.alimentacao}
            onChange={(alimentacao) => setAnswers((a) => ({ ...a, alimentacao }))}
          />
        </Question>

        <Question
          icon={<Zap className="size-4" />}
          label="Nível de energia"
          optional
        >
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as Energia[]).map((level) => (
              <Chip
                key={level}
                selected={answers.energia === level}
                onClick={() => setAnswers((a) => ({ ...a, energia: level }))}
                className="w-12 justify-center"
              >
                {level}
              </Chip>
            ))}
          </div>
        </Question>
      </div>

      {/* Prévia do score — feedback imediato, valor oficial vem da API */}
      <Card variant="brand" className="mt-5 flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-bold tracking-tight text-ink">
            Prévia do seu score
          </p>
          <p className="mt-0.5 text-xs text-muted">
            O valor final é confirmado pelo servidor.
          </p>
        </div>
        <div className="text-right">
          <motion.p
            key={preview}
            initial={{ scale: 0.85, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            className="text-4xl font-bold tracking-tight brand-text-gradient"
          >
            {preview}
          </motion.p>
          <p className="text-xs font-semibold text-brand-700">
            {classifyScore(preview)}
          </p>
        </div>
      </Card>

      {submit.isError && (
        <p className="mt-4 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
          {(submit.error as Error).message}
        </p>
      )}

      <Button
        block
        size="lg"
        className="mt-6"
        disabled={!complete}
        loading={submit.isPending}
        onClick={handleSubmit}
      >
        <Check className="size-5" />
        Registrar check-in
      </Button>
    </div>
  )
}

function Question({
  icon,
  label,
  optional,
  children,
}: {
  icon: React.ReactNode
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <Card className="p-5">
      <div className="mb-3.5 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-brand-500/12 text-brand-600 ring-1 ring-inset ring-brand-500/15">
          {icon}
        </span>
        <h2 className="text-sm font-bold tracking-tight text-ink">{label}</h2>
        {optional && (
          <span className="rounded-md bg-ink/5 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-muted">
            opcional
          </span>
        )}
      </div>
      {children}
    </Card>
  )
}

function Options<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[]
  value: T | undefined
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Chip
          key={option}
          selected={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  selected,
  onClick,
  className,
  children,
}: {
  selected: boolean
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'rounded-xl border px-3.5 py-2 text-sm font-semibold',
        'transition-[transform,box-shadow,background-color,border-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
        'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2',
        selected
          ? 'brand-gradient border-transparent text-white shadow-[var(--shadow-glow),inset_0_1px_0_0_rgb(255_255_255/0.28)]'
          : 'border-(--glass-border) bg-white/60 text-ink shadow-[var(--shadow-e1),var(--glass-highlight)] backdrop-blur-md hover:border-brand-300 hover:bg-white/90',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Data por extenso no eyebrow — ancora o "hoje" do título. */
function todayLabel(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
