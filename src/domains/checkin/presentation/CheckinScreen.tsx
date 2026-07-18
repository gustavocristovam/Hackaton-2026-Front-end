import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Check, Droplets, Dumbbell, Moon, Smile, Utensils, Zap } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
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
      <header>
        <h1 className="text-2xl font-bold text-ink">Check-in de hoje</h1>
        <p className="mt-1 text-sm text-muted">
          Seis perguntas rápidas para o seu avatar acompanhar o seu dia.
        </p>
      </header>

      <div className="mt-8 space-y-4">
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
      <Card className="mt-6 flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted">Prévia do seu score</p>
          <p className="text-xs text-muted/80">
            O valor final é confirmado pelo servidor.
          </p>
        </div>
        <div className="text-right">
          <motion.p
            key={preview}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-brand-600"
          >
            {preview}
          </motion.p>
          <p className="text-xs font-medium text-muted">{classifyScore(preview)}</p>
        </div>
      </Card>

      {submit.isError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]">
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
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-ink">{label}</h2>
        {optional && <span className="text-xs text-muted">(opcional)</span>}
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
        'rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-[var(--color-line)] bg-white text-ink hover:border-brand-300 hover:bg-brand-50',
        className,
      )}
    >
      {children}
    </button>
  )
}
