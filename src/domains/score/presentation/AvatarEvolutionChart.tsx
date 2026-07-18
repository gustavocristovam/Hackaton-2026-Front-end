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
  CATEGORICAL,
  DOT_RADIUS,
  GRID_STROKE,
  LINE_WIDTH,
} from '@/shared/ui/chartTokens'
import type { AvatarHistoryEntry } from '@/domains/avatar/domain/Avatar'

/**
 * Três séries categóricas — cores em ordem fixa da paleta validada,
 * com legenda sempre presente (identidade nunca só pela cor).
 */
const SERIES = [
  { key: 'energia', label: 'Energia', color: CATEGORICAL[0] },
  { key: 'forca', label: 'Força', color: CATEGORICAL[1] },
  { key: 'vitalidade', label: 'Vitalidade', color: CATEGORICAL[2] },
] as const

export function AvatarEvolutionChart({ data }: { data: AvatarHistoryEntry[] }) {
  if (data.length === 0) {
    return (
      <p className="grid h-56 place-items-center text-sm text-muted">
        O histórico do avatar aparece aqui conforme você faz check-ins.
      </p>
    )
  }

  return (
    <div>
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
              tick={AXIS.tick}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ stroke: AXIS.stroke, strokeWidth: 1 }}
              content={<AttributesTooltip />}
            />
            {SERIES.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                stroke={series.color}
                strokeWidth={LINE_WIDTH}
                dot={false}
                activeDot={{ r: DOT_RADIUS + 1, strokeWidth: 2, stroke: '#fff' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 flex flex-wrap justify-center gap-4">
        {SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-1.5 text-xs text-muted">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </li>
        ))}
      </ul>
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
  payload?: { payload: AvatarHistoryEntry }[]
}

function AttributesTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  return (
    <div className="rounded-xl border border-(--glass-border) bg-white/90 px-3 py-2 shadow-[var(--shadow-e2)] backdrop-blur-md">
      <p className="mb-1 text-xs text-muted">{formatDay(entry.date)}</p>
      {SERIES.map((series) => (
        <p
          key={series.key}
          className="flex items-center gap-1.5 text-sm font-medium text-ink"
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: series.color }}
          />
          {series.label}: {entry[series.key]}
        </p>
      ))}
    </div>
  )
}
