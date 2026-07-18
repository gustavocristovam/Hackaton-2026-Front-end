import { z } from 'zod'
import {
  ALIMENTACAO_OPTIONS,
  AGUA_OPTIONS,
  HUMOR_OPTIONS,
  SONO_OPTIONS,
  type Alimentacao,
  type Agua,
  type DailyCheckin,
  type Energia,
  type Humor,
  type Sono,
} from '../domain/Checkin'

const numeric = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((v) => (v === null || v === undefined ? 0 : Number(v) || 0))

/** O banco pode guardar a resposta bruta (string) ou já convertida em pontos. */
function pickEnum<T extends string>(options: readonly T[], fallback: T) {
  return (value: unknown): T => {
    if (typeof value === 'string') {
      const match = options.find(
        (o) => o.toLowerCase() === value.trim().toLowerCase(),
      )
      if (match) return match
    }
    // Valor numérico: quanto maior, melhor — mapeia para a posição na lista.
    if (typeof value === 'number' && Number.isFinite(value)) {
      const index = Math.min(options.length - 1, Math.max(0, options.length - 1 - value))
      return options[index] ?? fallback
    }
    return fallback
  }
}

const asSono = pickEnum<Sono>(SONO_OPTIONS, 'Regular')
const asAgua = pickEnum<Agua>(AGUA_OPTIONS, 'Quase')
const asHumor = pickEnum<Humor>(HUMOR_OPTIONS, 'Regular')
const asAlimentacao = pickEnum<Alimentacao>(ALIMENTACAO_OPTIONS, 'Regular')

function asTreino(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  if (typeof value === 'string') return ['true', 'sim', '1'].includes(value.toLowerCase())
  return false
}

function asEnergia(value: unknown): Energia | undefined {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return undefined
  return Math.min(5, Math.max(1, Math.round(n))) as Energia
}

export const checkinDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).nullish().transform((v) => String(v ?? '')),
  date: z.string().nullish(),
  data: z.string().nullish(),
  sono: z.unknown(),
  agua: z.unknown(),
  treino: z.unknown(),
  humor: z.unknown(),
  alimentacao: z.unknown(),
  energia: z.unknown(),
  score_dia: numeric.optional(),
  scoreDia: numeric.optional(),
  score: numeric.optional(),
  xp_ganho: numeric.optional(),
  xpGanho: numeric.optional(),
  created_at: z.string().nullish(),
  createdAt: z.string().nullish(),
})

export function toCheckin(raw: unknown): DailyCheckin {
  const dto = checkinDtoSchema.parse(raw)
  return {
    id: dto.id,
    date: dto.date ?? dto.data ?? '',
    sono: asSono(dto.sono),
    agua: asAgua(dto.agua),
    treino: asTreino(dto.treino),
    humor: asHumor(dto.humor),
    alimentacao: asAlimentacao(dto.alimentacao),
    energia: asEnergia(dto.energia),
    scoreDia: dto.score_dia ?? dto.scoreDia ?? dto.score ?? 0,
    xpGanho: dto.xp_ganho ?? dto.xpGanho ?? 0,
    createdAt: dto.created_at ?? dto.createdAt ?? null,
  }
}

export interface CheckinPage {
  items: DailyCheckin[]
  page: number
  total: number
}

/** Lista paginada: aceita array puro ou envelope { data, meta }. */
export function toCheckinPage(raw: unknown): CheckinPage {
  if (Array.isArray(raw)) {
    const items = raw.map(toCheckin)
    return { items, page: 1, total: items.length }
  }
  const envelope = (raw ?? {}) as Record<string, unknown>
  const list = Array.isArray(envelope.data)
    ? envelope.data
    : Array.isArray(envelope.items)
      ? envelope.items
      : []
  const meta = (envelope.meta ?? envelope) as Record<string, unknown>
  const items = list.map(toCheckin)
  return {
    items,
    page: Number(meta.page ?? 1) || 1,
    total: Number(meta.total ?? items.length) || items.length,
  }
}
