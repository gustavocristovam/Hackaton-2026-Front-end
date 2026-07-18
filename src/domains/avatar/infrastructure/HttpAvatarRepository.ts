import { apiClient } from '@/shared/api/apiClient'
import type { Avatar, AvatarHistoryEntry } from '../domain/Avatar'
import { toAvatar, toAvatarHistory } from './avatarDto'

export interface HistoryRange {
  from?: string
  to?: string
}

export const avatarRepository = {
  async current(): Promise<Avatar> {
    return toAvatar(await apiClient.get<unknown>('/avatar'))
  },
  async history(range: HistoryRange = {}): Promise<AvatarHistoryEntry[]> {
    return toAvatarHistory(
      await apiClient.get<unknown>('/avatar/history', { query: { ...range } }),
    )
  },
}
