import { useQuery } from '@tanstack/react-query'
import {
  scoreRepository,
  type ScoreRange,
} from '../infrastructure/HttpScoreRepository'

export const scoreKeys = {
  all: ['score'] as const,
  daily: () => [...scoreKeys.all, 'daily'] as const,
  weekly: () => [...scoreKeys.all, 'weekly'] as const,
  history: (range: ScoreRange) => [...scoreKeys.all, 'history', range] as const,
  feedback: () => [...scoreKeys.all, 'feedback', 'weekly'] as const,
}

export function useDailyScore() {
  return useQuery({
    queryKey: scoreKeys.daily(),
    queryFn: () => scoreRepository.daily(),
  })
}

export function useWeeklyScore() {
  return useQuery({
    queryKey: scoreKeys.weekly(),
    queryFn: () => scoreRepository.weekly(),
  })
}

export function useScoreHistory(range: ScoreRange = {}) {
  return useQuery({
    queryKey: scoreKeys.history(range),
    queryFn: () => scoreRepository.history(range),
  })
}

export function useWeeklyFeedback() {
  return useQuery({
    queryKey: scoreKeys.feedback(),
    queryFn: () => scoreRepository.weeklyFeedback(),
  })
}
