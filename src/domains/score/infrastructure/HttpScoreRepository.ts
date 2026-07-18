import { apiClient } from '@/shared/api/apiClient'
import type {
  DailyScore,
  ScorePoint,
  WeeklyFeedback,
  WeeklyScore,
} from '../domain/Score'
import {
  toDailyScore,
  toScoreHistory,
  toWeeklyFeedback,
  toWeeklyScore,
} from './scoreDto'

export interface ScoreRange {
  from?: string
  to?: string
}

export const scoreRepository = {
  async daily(): Promise<DailyScore> {
    return toDailyScore(await apiClient.get<unknown>('/score/daily'))
  },
  async weekly(): Promise<WeeklyScore> {
    return toWeeklyScore(await apiClient.get<unknown>('/score/weekly'))
  },
  async history(range: ScoreRange = {}): Promise<ScorePoint[]> {
    return toScoreHistory(
      await apiClient.get<unknown>('/score/history', { query: { ...range } }),
    )
  },
  async weeklyFeedback(): Promise<WeeklyFeedback> {
    return toWeeklyFeedback(await apiClient.get<unknown>('/feedback/weekly'))
  },
}
