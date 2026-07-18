import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { CheckCircle2, Pencil } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
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
        <Card className="p-8 text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            className="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 text-brand-600"
          >
            <CheckCircle2 className="size-9" />
          </motion.span>

          <h1 className="mt-5 text-2xl font-bold text-ink">Check-in concluído!</h1>
          <p className="mt-1 text-sm text-muted">
            Você já registrou seu dia. Volte amanhã para manter a sequência.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-brand-50 p-4">
              <p className="text-xs font-medium text-muted">Score do dia</p>
              <p className="mt-1 text-3xl font-bold text-brand-700">
                {checkin.scoreDia}
              </p>
              <p className="text-xs font-medium text-brand-600">
                {classifyScore(checkin.scoreDia)}
              </p>
            </div>
            <div className="rounded-xl bg-brand-50 p-4">
              <p className="text-xs font-medium text-muted">XP ganho</p>
              <p className="mt-1 text-3xl font-bold text-brand-700">
                +{checkin.xpGanho}
              </p>
              <p className="text-xs font-medium text-brand-600">experiência</p>
            </div>
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Ver meu avatar
          </Link>

          {editable ? (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Pencil className="size-3" />
              Você pode corrigir as respostas por até {EDIT_WINDOW_HOURS}h.
            </p>
          ) : (
            <p className="mt-4 text-xs text-muted">
              A janela de edição deste check-in já encerrou.
            </p>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
