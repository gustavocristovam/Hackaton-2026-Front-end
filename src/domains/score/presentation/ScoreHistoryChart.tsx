import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AXIS,
  DOT_RADIUS,
  GRID_STROKE,
  LINE_WIDTH,
  SERIES_PRIMARY,
} from '@/shared/ui/chartTokens'
import type { ScorePoint } from '../domain/Score'
import { classifyScore } from '../domain/Score'

/** Série única de score diário — o título nomeia a série, então não leva legenda. */
export function ScoreHistoryChart({ data }: { data: ScorePoint[] }) {
  if (data.length === 0) {
    return (
      <p className="grid h-56 place-items-center text-sm text-muted">
        Ainda não há scores registrados no período.
      </p>
    )
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            tick={AXIS.tick}
            axisLine={{ stroke: AXIS.stroke }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={[0, 100]}
            tick={AXIS.tick}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ stroke: AXIS.stroke, strokeWidth: 1 }}
            content={<ScoreTooltip />}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={SERIES_PRIMARY}
            strokeWidth={LINE_WIDTH}
            dot={false}
            activeDot={{ r: DOT_RADIUS + 1, strokeWidth: 2, stroke: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function formatDay(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

interface TooltipPayload {
  active?: boolean
  payload?: { payload: ScorePoint }[]
}

/** Texto sempre em tokens de tinta; a cor da série fica na marca ao lado. */
function ScoreTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 shadow-md">
      <p className="text-xs text-muted">{formatDay(point.date)}</p>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: SERIES_PRIMARY }}
        />
        {point.score} pts
      </p>
      <p className="text-xs text-muted">{classifyScore(point.score)}</p>
    </div>
  )
}
