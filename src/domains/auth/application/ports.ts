import type { Session } from '../domain/Session'
import type { LoginCredentials, RegisterInput } from '../domain/Credentials'

/**
 * Contratos (portas) que a camada de aplicação depende.
 * A infraestrutura implementa; os casos de uso não conhecem HTTP nem storage.
 */

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<Session>
  register(input: RegisterInput): Promise<Session>
  refresh(refreshToken: string): Promise<Session>
  logout(): Promise<void>
}

export interface SessionStorage {
  load(): Promise<Session | null>
  save(session: Session): Promise<void>
  clear(): Promise<void>
}
