import { apiClient } from '@/shared/api/apiClient'
import type { User, UserStats } from '../domain/User'
import { toUser, toUserStats } from './userDto'

export const userRepository = {
  async me(): Promise<User> {
    return toUser(await apiClient.get<unknown>('/users/me'))
  },
  async stats(): Promise<UserStats> {
    return toUserStats(await apiClient.get<unknown>('/users/me/stats'))
  },
}
