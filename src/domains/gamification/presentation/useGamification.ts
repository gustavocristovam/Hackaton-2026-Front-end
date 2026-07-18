import { useQuery } from '@tanstack/react-query'
import { mergeBadgeProgress } from '../domain/Badge'
import { gamificationRepository } from '../infrastructure/HttpGamificationRepository'

export const gamificationKeys = {
  all: ['gamification'] as const,
  catalog: () => [...gamificationKeys.all, 'catalog'] as const,
  mine: () => [...gamificationKeys.all, 'mine'] as const,
}

/** Catálogo + conquistas do usuário, já cruzados pela regra de domínio. */
export function useBadgeProgress() {
  const catalog = useQuery({
    queryKey: gamificationKeys.catalog(),
    queryFn: () => gamificationRepository.catalog(),
    staleTime: 1000 * 60 * 10, // catálogo é estático
  })
  const mine = useQuery({
    queryKey: gamificationKeys.mine(),
    queryFn: () => gamificationRepository.myBadges(),
  })

  return {
    badges: mergeBadgeProgress(catalog.data ?? [], mine.data ?? []),
    earnedCount: mine.data?.length ?? 0,
    isLoading: catalog.isLoading || mine.isLoading,
    error: catalog.error ?? mine.error,
  }
}
