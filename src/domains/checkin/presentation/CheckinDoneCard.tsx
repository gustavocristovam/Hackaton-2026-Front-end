import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowRight, CheckCircle2, Pencil } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import {
  canEditCheckin,
  classifyScore,
  EDIT_WINDOW_HOURS,
  type DailyCheckin,
} from '../domain/Checkin'

/** Estado "já concluído hoje" — substitui o formulário após o check-in. */
export function CheckinDoneCard({ checkin }: { checkin: DailyCheckin }) {
  const editable = canEditCheckin(checkin)

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card variant="solid" className="relative overflow-hidden p-8 text-center">
          {/* Brilho de celebração atrás do ícone */}
          <div className="pointer-events-none absolute left-1/2 top-0 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/25 blur-3xl" />

          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            className="relative mx-auto grid size-16 place-items-center rounded-full brand-gradient text-white shadow-[var(--shadow-glow),inset_0_1px_0_0_rgb(255_255_255/0.35)]"
          >
            <CheckCircle2 className="size-9" />
          </motion.span>

          <h1 className="relative mt-5 text-2xl font-bold tracking-tight text-ink">
            Check-in concluído
          </h1>
          <p className="relative mt-1.5 text-sm text-muted">
            Você já registrou seu dia. Volte amanhã para manter a sequência.
          </p>

          <div className="relative mt-7 grid grid-cols-2 gap-3.5">
            <Metric
              label="Score do dia"
              value={checkin.scoreDia}
              caption={classifyScore(checkin.scoreDia)}
            />
            <Metric
              label="XP ganho"
              value={`+${checkin.xpGanho}`}
              caption="experiência"
            />
          </div>

          <Link to="/" className="relative mt-6 block">
            <Button size="lg" block className="group">
              Ver meu avatar
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </Link>

          {editable ? (
            <p className="relative mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Pencil className="size-3" />
              Você pode corrigir as respostas por até {EDIT_WINDOW_HOURS}h.
            </p>
          ) : (
            <p className="relative mt-4 text-xs text-muted">
              A janela de edição deste check-in já encerrou.
            </p>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

function Metric({
  label,
  value,
  caption,
}: {
  label: string
  value: string | number
  caption: string
}) {
  return (
    <div className="rounded-xl border border-brand-200/60 bg-brand-50/70 p-4 backdrop-blur-sm">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight brand-text-gradient">
        {value}
      </p>
      <p className="text-xs font-semibold text-brand-700">{caption}</p>
    </div>
  )
}
