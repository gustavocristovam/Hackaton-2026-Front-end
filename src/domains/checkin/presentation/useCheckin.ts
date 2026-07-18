import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { avatarKeys } from '@/domains/avatar/presentation/useAvatar'
import type { CheckinAnswers, DailyCheckin } from '../domain/Checkin'
import {
  checkinRepository,
  type CheckinListParams,
} from '../infrastructure/HttpCheckinRepository'
import { editCheckin, submitDailyCheckin } from '../application/checkinUseCases'

export const checkinKeys = {
  all: ['checkin'] as const,
  today: () => [...checkinKeys.all, 'today'] as const,
  list: (params: CheckinListParams) => [...checkinKeys.all, 'list', params] as const,
}

/** Check-in de hoje — null quando ainda não foi feito. */
export function useTodayCheckin() {
  return useQuery({
    queryKey: checkinKeys.today(),
    queryFn: () => checkinRepository.today(),
  })
}

export function useCheckinHistory(params: CheckinListParams = { limit: 30 }) {
  return useQuery({
    queryKey: checkinKeys.list(params),
    queryFn: () => checkinRepository.list(params),
  })
}

/**
 * Um check-in altera avatar, score, XP e streak — por isso invalida
 * todos os caches que dependem desse resultado.
 */
function useInvalidateAfterCheckin() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: checkinKeys.all })
    void queryClient.invalidateQueries({ queryKey: avatarKeys.all })
    void queryClient.invalidateQueries({ queryKey: ['score'] })
    void queryClient.invalidateQueries({ queryKey: ['user'] })
    void queryClient.invalidateQueries({ queryKey: ['gamification'] })
  }
}

export function useSubmitCheckin() {
  const invalidate = useInvalidateAfterCheckin()
  return useMutation({
    mutationFn: (answers: CheckinAnswers) => submitDailyCheckin(answers),
    onSuccess: invalidate,
  })
}

export function useEditCheckin() {
  const invalidate = useInvalidateAfterCheckin()
  return useMutation({
    mutationFn: ({
      checkin,
      answers,
    }: {
      checkin: DailyCheckin
      answers: Partial<CheckinAnswers>
    }) => editCheckin(checkin, answers),
    onSuccess: invalidate,
  })
}
