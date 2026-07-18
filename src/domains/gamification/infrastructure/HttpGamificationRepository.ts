import { apiClient } from '@/shared/api/apiClient'
import type { Badge, EarnedBadge } from '../domain/Badge'
import { toBadges, toEarnedBadges } from './badgeDto'

export const gamificationRepository = {
  async catalog(): Promise<Badge[]> {
    return toBadges(await apiClient.get<unknown>('/badges'))
  },
  async myBadges(): Promise<EarnedBadge[]> {
    return toEarnedBadges(await apiClient.get<unknown>('/badges/me'))
  },
}
