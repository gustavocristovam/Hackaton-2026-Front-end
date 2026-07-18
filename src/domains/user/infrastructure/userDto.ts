import { z } from 'zod'
import type { User, UserStats } from '../domain/User'

const numeric = z.number().nullish().transform((v) => v ?? 0)

/** DTO de /users/me — tolera snake_case do banco (xp_total, streak_atual...). */
export const userDtoSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  email: z.string(),
  xp_total: numeric.optional(),
  xpTotal: numeric.optional(),
  streak_atual: numeric.optional(),
  currentStreak: numeric.optional(),
  streak_recorde: numeric.optional(),
  recordStreak: numeric.optional(),
  created_at: z.string().nullish(),
  createdAt: z.string().nullish(),
})

export function toUser(raw: unknown): User {
  const dto = userDtoSchema.parse(raw)
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    xpTotal: dto.xp_total ?? dto.xpTotal ?? 0,
    currentStreak: dto.streak_atual ?? dto.currentStreak ?? 0,
    recordStreak: dto.streak_recorde ?? dto.recordStreak ?? 0,
    createdAt: dto.created_at ?? dto.createdAt ?? null,
  }
}

/** DTO de /users/me/stats. */
export const userStatsDtoSchema = z.object({
  xp_total: numeric.optional(),
  xpTotal: numeric.optional(),
  streak_atual: numeric.optional(),
  currentStreak: numeric.optional(),
  streak_recorde: numeric.optional(),
  recordStreak: numeric.optional(),
  avatar_level: numeric.optional(),
  avatarLevel: numeric.optional(),
  level: numeric.optional(),
})

export function toUserStats(raw: unknown): UserStats {
  const dto = userStatsDtoSchema.parse(raw)
  return {
    xpTotal: dto.xp_total ?? dto.xpTotal ?? 0,
    currentStreak: dto.streak_atual ?? dto.currentStreak ?? 0,
    recordStreak: dto.streak_recorde ?? dto.recordStreak ?? 0,
    avatarLevel: dto.avatar_level ?? dto.avatarLevel ?? dto.level ?? 1,
  }
}
