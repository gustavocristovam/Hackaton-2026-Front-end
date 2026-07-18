import { env } from '@/shared/config/env'
import { ApiError } from './ApiError'

/**
 * Cliente HTTP central. Encapsula fetch + autenticação + refresh de token.
 *
 * A camada de auth registra callbacks aqui (getAccessToken / refreshToken / onAuthLost)
 * para evitar dependência circular entre o cliente e o domínio de autenticação.
 */

type TokenGetter = () => string | null
type RefreshFn = () => Promise<string | null>
type AuthLostFn = () => void

let getAccessToken: TokenGetter = () => null
let refreshToken: RefreshFn = async () => null
let onAuthLost: AuthLostFn = () => {}

export function configureAuth(handlers: {
  getAccessToken: TokenGetter
  refreshToken: RefreshFn
  onAuthLost: AuthLostFn
}) {
  getAccessToken = handlers.getAccessToken
  refreshToken = handlers.refreshToken
  onAuthLost = handlers.onAuthLost
}

// Garante um único refresh em voo; requisições concorrentes esperam o mesmo.
let refreshInFlight: Promise<string | null> | null = null
function refreshOnce(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refreshToken().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  /** Rotas públicas (login/register/refresh) não injetam token nem tentam refresh. */
  auth?: boolean
  signal?: AbortSignal
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(env.apiBaseUrl + path)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function parseError(res: Response): Promise<ApiError> {
  let payload: unknown
  try {
    payload = await res.json()
  } catch {
    payload = undefined
  }
  const record = (payload ?? {}) as Record<string, unknown>
  const message =
    (typeof record.message === 'string' && record.message) ||
    (typeof record.error === 'string' && record.error) ||
    res.statusText ||
    'Erro inesperado'
  const code = typeof record.code === 'string' ? record.code : undefined
  return new ApiError(res.status, message, code, payload)
}

async function doFetch<T>(
  method: string,
  path: string,
  options: RequestOptions,
  isRetry = false,
): Promise<T> {
  const { query, body, auth = true, signal } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, 'Falha de conexão com o servidor')
  }

  // 401 em rota autenticada → tenta um refresh e repete uma única vez.
  if (res.status === 401 && auth && !isRetry) {
    const newToken = await refreshOnce()
    if (newToken) return doFetch<T>(method, path, options, true)
    onAuthLost()
    throw await parseError(res)
  }

  if (!res.ok) throw await parseError(res)

  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const apiClient = {
  get: <T>(path: string, options: RequestOptions = {}) =>
    doFetch<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    doFetch<T>('POST', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    doFetch<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options: RequestOptions = {}) =>
    doFetch<T>('DELETE', path, options),
}
