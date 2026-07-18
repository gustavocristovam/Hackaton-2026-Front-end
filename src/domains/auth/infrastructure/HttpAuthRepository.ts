import { apiClient } from '@/shared/api/apiClient'
import type { LoginCredentials, RegisterInput } from '../domain/Credentials'
import type { Session } from '../domain/Session'
import type { AuthRepository } from '../application/ports'
import { toSession } from './authDto'

/** Implementação concreta do AuthRepository conversando com /auth/*. */
export class HttpAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<Session> {
    const raw = await apiClient.post<unknown>('/auth/login', credentials, {
      auth: false,
    })
    return toSession(raw)
  }

  async register(input: RegisterInput): Promise<Session> {
    const raw = await apiClient.post<unknown>('/auth/register', input, {
      auth: false,
    })
    return toSession(raw)
  }

  async refresh(refreshToken: string): Promise<Session> {
    const raw = await apiClient.post<unknown>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { auth: false },
    )
    return toSession(raw)
  }

  async logout(): Promise<void> {
    await apiClient.post<void>('/auth/logout')
  }
}
