import { useQuery } from '@tanstack/react-query'
import {
  avatarRepository,
  type HistoryRange,
} from '../infrastructure/HttpAvatarRepository'

export const avatarKeys = {
  all: ['avatar'] as const,
  current: () => [...avatarKeys.all, 'current'] as const,
  history: (range: HistoryRange) => [...avatarKeys.all, 'history', range] as const,
}

/** Estado atual do avatar (/avatar). */
export function useAvatar() {
  return useQuery({
    queryKey: avatarKeys.current(),
    queryFn: () => avatarRepository.current(),
  })
}

/** Linha do tempo de evolução (/avatar/history). */
export function useAvatarHistory(range: HistoryRange = {}) {
  return useQuery({
    queryKey: avatarKeys.history(range),
    queryFn: () => avatarRepository.history(range),
  })
}
