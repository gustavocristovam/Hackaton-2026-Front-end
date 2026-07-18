/**
 * Value object que representa a sessão autenticada.
 * Regra de negócio pura — sem React, sem HTTP.
 */
export interface SessionProps {
  accessToken: string
  refreshToken: string
  /** Epoch em ms de expiração do access token, se conhecido. */
  expiresAt?: number
}

export class Session {
  private constructor(private readonly props: SessionProps) {}

  static create(props: SessionProps): Session {
    if (!props.accessToken) throw new Error('Sessão sem access token')
    if (!props.refreshToken) throw new Error('Sessão sem refresh token')
    return new Session(props)
  }

  get accessToken(): string {
    return this.props.accessToken
  }

  get refreshToken(): string {
    return this.props.refreshToken
  }

  get expiresAt(): number | undefined {
    return this.props.expiresAt
  }

  /** Considera expirada 30s antes do prazo real, como margem de segurança. */
  isExpired(now: number = Date.now()): boolean {
    if (this.props.expiresAt === undefined) return false
    return now >= this.props.expiresAt - 30_000
  }

  /** Substitui os tokens após um refresh, preservando o refresh token se o novo não vier. */
  withRefreshedTokens(next: {
    accessToken: string
    refreshToken?: string
    expiresAt?: number
  }): Session {
    return new Session({
      accessToken: next.accessToken,
      refreshToken: next.refreshToken ?? this.props.refreshToken,
      expiresAt: next.expiresAt,
    })
  }

  toJSON(): SessionProps {
    return { ...this.props }
  }
}
