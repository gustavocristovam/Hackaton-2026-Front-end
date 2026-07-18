import { apiClient } from '@/shared/api/apiClient'
import type { Badge, EarnedBadge, Trophy } from '../domain/Badge'
import { toBadges, toEarnedBadges, toTrophies } from './badgeDto'

export const gamificationRepository = {
  async catalog(): Promise<Badge[]> {
    return toBadges(await apiClient.get<unknown>('/badges'))
  },
  async myBadges(): Promise<EarnedBadge[]> {
    return toEarnedBadges(await apiClient.get<unknown>('/badges/me'))
  },
  async myTrophies(): Promise<Trophy[]> {
    return toTrophies(await apiClient.get<unknown>('/trophies/me'))
  },
}
