import { z } from 'zod'
import {
  classifyScore,
  type DailyScore,
  type ScoreClassification,
  type ScorePoint,
  type WeeklyFeedback,
  type WeeklyScore,
} from '../domain/Score'

const numeric = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((v) => (v === null || v === undefined ? 0 : Number(v) || 0))

const CLASSIFICATIONS: ScoreClassification[] = [
  'Excelente',
  'Bom',
  'Regular',
  'Atenção',
]

function asClassification(value: unknown, score: number): ScoreClassification {
  if (typeof value === 'string') {
    const match = CLASSIFICATIONS.find(
      (c) => c.toLowerCase() === value.trim().toLowerCase(),
    )
    if (match) return match
  }
  return classifyScore(score)
}

export function toDailyScore(raw: unknown): DailyScore {
  const dto = z
    .object({
      score: numeric.optional(),
      score_dia: numeric.optional(),
      classificacao: z.string().nullish(),
      classification: z.string().nullish(),
      date: z.string().nullish(),
      data: z.string().nullish(),
    })
    .parse(raw ?? {})
  const score = dto.score ?? dto.score_dia ?? 0
  return {
    score,
    classificacao: asClassification(dto.classificacao ?? dto.classification, score),
    date: dto.date ?? dto.data ?? new Date().toISOString().slice(0, 10),
  }
}

export function toWeeklyScore(raw: unknown): WeeklyScore {
  const dto = z
    .object({
      media: numeric.optional(),
      average: numeric.optional(),
      score_medio: numeric.optional(),
      classificacao: z.string().nullish(),
      variacao: z.union([z.number(), z.string()]).nullish(),
    })
    .parse(raw ?? {})
  const media = dto.media ?? dto.average ?? dto.score_medio ?? 0
  const variacao =
    dto.variacao === null || dto.variacao === undefined
      ? null
      : Number(dto.variacao) || 0
  return {
    media,
    classificacao: asClassification(dto.classificacao, media),
    variacao,
  }
}

export function toScoreHistory(raw: unknown): ScorePoint[] {
  const list = Array.isArray(raw) ? raw : ((raw as { data?: unknown })?.data ?? [])
  return z
    .array(
      z.object({
        date: z.string().nullish(),
        data: z.string().nullish(),
        score: numeric.optional(),
        score_dia: numeric.optional(),
      }),
    )
    .parse(list)
    .map((point) => ({
      date: point.date ?? point.data ?? '',
      score: point.score ?? point.score_dia ?? 0,
    }))
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string')
  if (typeof value === 'string' && value.trim()) return [value]
  return []
}

export function toWeeklyFeedback(raw: unknown): WeeklyFeedback {
  const dto = z
    .object({
      resumo: z.string().nullish(),
      summary: z.string().nullish(),
      score_medio: numeric.optional(),
      scoreMedio: numeric.optional(),
      media: numeric.optional(),
      dias_treinados: numeric.optional(),
      diasTreinados: numeric.optional(),
      destaques: z.unknown(),
      highlights: z.unknown(),
      pontos_de_atencao: z.unknown(),
      atencao: z.unknown(),
    })
    .parse(raw ?? {})
  return {
    resumo: dto.resumo ?? dto.summary ?? '',
    scoreMedio: dto.score_medio ?? dto.scoreMedio ?? dto.media ?? 0,
    diasTreinados: dto.dias_treinados ?? dto.diasTreinados ?? 0,
    destaques: asStringList(dto.destaques ?? dto.highlights),
    pontosDeAtencao: asStringList(dto.pontos_de_atencao ?? dto.atencao),
  }
}
