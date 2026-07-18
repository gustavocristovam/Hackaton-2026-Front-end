import { z } from 'zod'
import {
  toAvatarLevel,
  type Avatar,
  type AvatarHistoryEntry,
} from '../domain/Avatar'

const numeric = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((v) => (v === null || v === undefined ? 0 : Number(v) || 0))

/** DTO de /avatar — tolera snake_case e acentuação vinda do banco (força). */
export const avatarDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).nullish().transform((v) => String(v ?? '')),
  level: numeric.optional(),
  nivel: numeric.optional(),
  xp: numeric.optional(),
  energia: numeric.optional(),
  energy: numeric.optional(),
  forca: numeric.optional(),
  'força': numeric.optional(),
  strength: numeric.optional(),
  vitalidade: numeric.optional(),
  vitality: numeric.optional(),
})

export function toAvatar(raw: unknown): Avatar {
  const dto = avatarDtoSchema.parse(raw)
  return {
    id: dto.id,
    level: toAvatarLevel(dto.level ?? dto.nivel ?? 1),
    xp: dto.xp ?? 0,
    energia: dto.energia ?? dto.energy ?? 0,
    forca: dto.forca ?? dto['força'] ?? dto.strength ?? 0,
    vitalidade: dto.vitalidade ?? dto.vitality ?? 0,
  }
}

const historyEntrySchema = avatarDtoSchema.extend({
  date: z.string().nullish(),
  data: z.string().nullish(),
  created_at: z.string().nullish(),
  createdAt: z.string().nullish(),
})

/** A API pode devolver um array puro ou { data: [...] }. */
export function toAvatarHistory(raw: unknown): AvatarHistoryEntry[] {
  const list = Array.isArray(raw)
    ? raw
    : ((raw as { data?: unknown })?.data ?? [])
  return z
    .array(historyEntrySchema)
    .parse(list)
    .map((dto) => {
      const avatar = toAvatar(dto)
      return {
        date: dto.date ?? dto.data ?? dto.created_at ?? dto.createdAt ?? '',
        level: avatar.level,
        xp: avatar.xp,
        energia: avatar.energia,
        forca: avatar.forca,
        vitalidade: avatar.vitalidade,
      }
    })
}
