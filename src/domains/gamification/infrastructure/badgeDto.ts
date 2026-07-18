import { z } from 'zod'
import type { Badge, EarnedBadge, Trophy } from '../domain/Badge'

const badgeDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).nullish().transform((v) => String(v ?? '')),
  name: z.string().nullish(),
  nome: z.string().nullish(),
  description: z.string().nullish(),
  descricao: z.string().nullish(),
  criterio: z.string().nullish(),
  criteria: z.string().nullish(),
  earned_at: z.string().nullish(),
  earnedAt: z.string().nullish(),
  // Alguns endpoints aninham a medalha: { badge: {...}, earned_at }
  badge: z.unknown().optional(),
})

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  const envelope = (raw ?? {}) as Record<string, unknown>
  if (Array.isArray(envelope.data)) return envelope.data
  if (Array.isArray(envelope.items)) return envelope.items
  return []
}

function baseBadge(dto: z.infer<typeof badgeDtoSchema>): Badge {
  return {
    id: dto.id,
    name: dto.name ?? dto.nome ?? 'Medalha',
    description: dto.description ?? dto.descricao ?? '',
    criterio: dto.criterio ?? dto.criteria ?? '',
  }
}

export function toBadges(raw: unknown): Badge[] {
  return unwrapList(raw).map((item) => baseBadge(badgeDtoSchema.parse(item)))
}

export function toEarnedBadges(raw: unknown): EarnedBadge[] {
  return unwrapList(raw).map((item) => {
    const dto = badgeDtoSchema.parse(item)
    // Quando vem aninhado, os dados da medalha estão em `badge`.
    const inner = dto.badge ? badgeDtoSchema.parse(dto.badge) : dto
    return {
      ...baseBadge(inner),
      earnedAt: dto.earned_at ?? dto.earnedAt ?? null,
    }
  })
}

export function toTrophies(raw: unknown): Trophy[] {
  return unwrapList(raw).map((item) => {
    const dto = badgeDtoSchema.parse(item)
    const inner = dto.badge ? badgeDtoSchema.parse(dto.badge) : dto
    const base = baseBadge(inner)
    return {
      id: base.id,
      name: base.name,
      description: base.description,
      earnedAt: dto.earned_at ?? dto.earnedAt ?? null,
    }
  })
}
