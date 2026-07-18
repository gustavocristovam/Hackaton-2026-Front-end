/** Entidade do avatar e regras de nível (camada de domínio pura). */

export type AvatarLevel = 1 | 2 | 3 | 4 | 5

export interface Avatar {
  id: string
  level: AvatarLevel
  xp: number
  energia: number
  forca: number
  vitalidade: number
}

export interface AvatarHistoryEntry {
  date: string
  level: AvatarLevel
  xp: number
  energia: number
  forca: number
  vitalidade: number
}

/** XP acumulado necessário para alcançar cada nível. */
const LEVEL_THRESHOLDS: Record<AvatarLevel, number> = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3500,
  5: 7000,
}

export const AVATAR_LEVEL_NAMES: Record<AvatarLevel, string> = {
  1: 'Despertar',
  2: 'Em Movimento',
  3: 'Constante',
  4: 'Forte',
  5: 'Lendário',
}

export function toAvatarLevel(value: number): AvatarLevel {
  const clamped = Math.min(5, Math.max(1, Math.round(value || 1)))
  return clamped as AvatarLevel
}

/** Progresso (0–1) dentro do nível atual, para a barra de XP. */
export function levelProgress(avatar: Pick<Avatar, 'level' | 'xp'>): number {
  if (avatar.level >= 5) return 1
  const current = LEVEL_THRESHOLDS[avatar.level]
  const next = LEVEL_THRESHOLDS[toAvatarLevel(avatar.level + 1)]
  const span = next - current
  if (span <= 0) return 1
  return Math.min(1, Math.max(0, (avatar.xp - current) / span))
}

/** XP que ainda falta para o próximo nível (0 se já está no máximo). */
export function xpToNextLevel(avatar: Pick<Avatar, 'level' | 'xp'>): number {
  if (avatar.level >= 5) return 0
  const next = LEVEL_THRESHOLDS[toAvatarLevel(avatar.level + 1)]
  return Math.max(0, next - avatar.xp)
}

/** Média dos atributos — usada como "vigor" geral na tela principal. */
export function overallVigor(avatar: Avatar): number {
  return Math.round((avatar.energia + avatar.forca + avatar.vitalidade) / 3)
}
