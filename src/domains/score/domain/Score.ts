/** Score diário/semanal e feedback (domínio puro). */

export type ScoreClassification = 'Excelente' | 'Bom' | 'Regular' | 'Atenção'

export interface DailyScore {
  score: number
  classificacao: ScoreClassification
  date: string
}

export interface WeeklyScore {
  media: number
  classificacao: ScoreClassification
  /** Variação em pontos frente à semana anterior (quando a API informa). */
  variacao: number | null
}

export interface ScorePoint {
  date: string
  score: number
}

export interface WeeklyFeedback {
  resumo: string
  scoreMedio: number
  diasTreinados: number
  destaques: string[]
  pontosDeAtencao: string[]
}

export function classifyScore(score: number): ScoreClassification {
  if (score >= 80) return 'Excelente'
  if (score >= 60) return 'Bom'
  if (score >= 40) return 'Regular'
  return 'Atenção'
}

/** Cor do tema associada à faixa de score — usada em gráficos e badges. */
export function scoreColor(score: number): string {
  if (score >= 80) return 'var(--color-brand-600)'
  if (score >= 60) return 'var(--color-brand-400)'
  if (score >= 40) return 'var(--color-warning)'
  return 'var(--color-danger)'
}
