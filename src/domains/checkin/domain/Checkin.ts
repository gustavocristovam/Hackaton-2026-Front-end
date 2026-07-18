/** Entidade do check-in diário e as regras do questionário (domínio puro). */

export const SONO_OPTIONS = ['Excelente', 'Boa', 'Regular', 'Ruim'] as const
export const AGUA_OPTIONS = ['Meta atingida', 'Quase', 'Não'] as const
export const HUMOR_OPTIONS = ['Muito bom', 'Bom', 'Regular', 'Ruim'] as const
export const ALIMENTACAO_OPTIONS = ['Excelente', 'Boa', 'Regular', 'Ruim'] as const

export type Sono = (typeof SONO_OPTIONS)[number]
export type Agua = (typeof AGUA_OPTIONS)[number]
export type Humor = (typeof HUMOR_OPTIONS)[number]
export type Alimentacao = (typeof ALIMENTACAO_OPTIONS)[number]
/** Energia percebida: 1 a 5 (campo opcional). */
export type Energia = 1 | 2 | 3 | 4 | 5

export interface CheckinAnswers {
  sono: Sono
  agua: Agua
  treino: boolean
  humor: Humor
  alimentacao: Alimentacao
  energia?: Energia
}

export interface DailyCheckin extends CheckinAnswers {
  id: string
  date: string
  scoreDia: number
  xpGanho: number
  createdAt: string | null
}

/**
 * Estimativa local do score (0–100), só para dar feedback imediato no formulário.
 * O valor oficial é sempre o que a API devolve — este é um espelho da regra.
 */
const SONO_POINTS: Record<Sono, number> = {
  Excelente: 25,
  Boa: 19,
  Regular: 11,
  Ruim: 3,
}
const AGUA_POINTS: Record<Agua, number> = {
  'Meta atingida': 20,
  Quase: 12,
  'Não': 3,
}
const HUMOR_POINTS: Record<Humor, number> = {
  'Muito bom': 15,
  Bom: 12,
  Regular: 7,
  Ruim: 2,
}
const ALIMENTACAO_POINTS: Record<Alimentacao, number> = {
  Excelente: 20,
  Boa: 15,
  Regular: 9,
  Ruim: 2,
}
const TREINO_POINTS = 15
const ENERGIA_MAX_POINTS = 5

export function estimateScore(answers: Partial<CheckinAnswers>): number {
  let score = 0
  if (answers.sono) score += SONO_POINTS[answers.sono]
  if (answers.agua) score += AGUA_POINTS[answers.agua]
  if (answers.humor) score += HUMOR_POINTS[answers.humor]
  if (answers.alimentacao) score += ALIMENTACAO_POINTS[answers.alimentacao]
  if (answers.treino) score += TREINO_POINTS
  if (answers.energia) score += (answers.energia / 5) * ENERGIA_MAX_POINTS
  return Math.min(100, Math.round(score))
}

export type ScoreClassification = 'Excelente' | 'Bom' | 'Regular' | 'Atenção'

export function classifyScore(score: number): ScoreClassification {
  if (score >= 80) return 'Excelente'
  if (score >= 60) return 'Bom'
  if (score >= 40) return 'Regular'
  return 'Atenção'
}

/** Regra de edição: a API permite corrigir um check-in por até 24h. */
export const EDIT_WINDOW_HOURS = 24

export function canEditCheckin(
  checkin: Pick<DailyCheckin, 'createdAt'>,
  now: Date = new Date(),
): boolean {
  if (!checkin.createdAt) return false
  const created = new Date(checkin.createdAt).getTime()
  if (Number.isNaN(created)) return false
  const elapsedHours = (now.getTime() - created) / 36e5
  return elapsedHours <= EDIT_WINDOW_HOURS
}
