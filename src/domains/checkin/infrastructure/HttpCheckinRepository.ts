import { apiClient } from '@/shared/api/apiClient'
import { ApiError } from '@/shared/api/ApiError'
import type { CheckinAnswers, DailyCheckin } from '../domain/Checkin'
import { toCheckin, toCheckinPage, type CheckinPage } from './checkinDto'

export interface CheckinListParams {
  from?: string
  to?: string
  page?: number
  limit?: number
}

export const checkinRepository = {
  async create(answers: CheckinAnswers): Promise<DailyCheckin> {
    return toCheckin(await apiClient.post<unknown>('/checkins', answers))
  },

  /** Retorna null quando o usuário ainda não fez o check-in de hoje. */
  async today(): Promise<DailyCheckin | null> {
    try {
      const raw = await apiClient.get<unknown>('/checkins/today')
      if (!raw || (typeof raw === 'object' && Object.keys(raw).length === 0)) {
        return null
      }
      return toCheckin(raw)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },

  async list(params: CheckinListParams = {}): Promise<CheckinPage> {
    return toCheckinPage(
      await apiClient.get<unknown>('/checkins', { query: { ...params } }),
    )
  },

  async byId(id: string): Promise<DailyCheckin> {
    return toCheckin(await apiClient.get<unknown>(`/checkins/${id}`))
  },

  async update(id: string, answers: Partial<CheckinAnswers>): Promise<DailyCheckin> {
    return toCheckin(await apiClient.patch<unknown>(`/checkins/${id}`, answers))
  },
}
