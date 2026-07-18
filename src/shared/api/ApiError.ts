/** Erro normalizado de qualquer chamada à API. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isNetwork(): boolean {
    return this.status === 0
  }
}
