import {
  isValidEmail,
  isValidPassword,
  PASSWORD_MIN_LENGTH,
  type LoginCredentials,
  type RegisterInput,
} from '../domain/Credentials'
import type { Session } from '../domain/Session'
import type { AuthRepository, SessionStorage } from './ports'

/**
 * Casos de uso de autenticação. Orquestram domínio + portas.
 * Validam as regras de negócio antes de tocar a infraestrutura.
 */
export class AuthUseCases {
  constructor(
    private readonly repo: AuthRepository,
    private readonly storage: SessionStorage,
  ) {}

  async login(credentials: LoginCredentials): Promise<Session> {
    const email = credentials.email.trim()
    if (!isValidEmail(email)) throw new Error('E-mail inválido')
    if (!credentials.password) throw new Error('Informe a senha')

    const session = await this.repo.login({ email, password: credentials.password })
    await this.storage.save(session)
    return session
  }

  async register(input: RegisterInput): Promise<Session> {
    const name = input.name.trim()
    const email = input.email.trim()
    if (name.length < 2) throw new Error('Informe seu nome completo')
    if (!isValidEmail(email)) throw new Error('E-mail inválido')
    if (!isValidPassword(input.password))
      throw new Error(`A senha deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres`)

    const session = await this.repo.register({ name, email, password: input.password })
    await this.storage.save(session)
    return session
  }

  async logout(): Promise<void> {
    // Best-effort no servidor; a sessão local é sempre limpa.
    try {
      await this.repo.logout()
    } finally {
      await this.storage.clear()
    }
  }

  async restore(): Promise<Session | null> {
    return this.storage.load()
  }

  /** Usado pelo apiClient no fluxo de refresh transparente. */
  async refresh(current: Session): Promise<Session | null> {
    try {
      const next = await this.repo.refresh(current.refreshToken)
      await this.storage.save(next)
      return next
    } catch {
      await this.storage.clear()
      return null
    }
  }
}
