import { Session, type SessionProps } from '../domain/Session'
import type { SessionStorage } from '../application/ports'

/**
 * Persistência da sessão. Usa o store nativo do Tauri quando disponível
 * (desktop) e cai para localStorage quando rodando só no browser (Vite dev).
 */
const STORE_KEY = 'auth.session'

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

function parse(raw: SessionProps | null): Session | null {
  if (!raw) return null
  try {
    return Session.create(raw)
  } catch {
    return null
  }
}

class TauriSessionStorage implements SessionStorage {
  private storePromise = import('@tauri-apps/plugin-store').then(({ Store }) =>
    Store.load('auth.json'),
  )

  async load(): Promise<Session | null> {
    const store = await this.storePromise
    const raw = await store.get<SessionProps>(STORE_KEY)
    return parse(raw ?? null)
  }

  async save(session: Session): Promise<void> {
    const store = await this.storePromise
    await store.set(STORE_KEY, session.toJSON())
    await store.save()
  }

  async clear(): Promise<void> {
    const store = await this.storePromise
    await store.delete(STORE_KEY)
    await store.save()
  }
}

class BrowserSessionStorage implements SessionStorage {
  async load(): Promise<Session | null> {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? parse(JSON.parse(raw) as SessionProps) : null
  }

  async save(session: Session): Promise<void> {
    localStorage.setItem(STORE_KEY, JSON.stringify(session.toJSON()))
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORE_KEY)
  }
}

export const sessionStorage: SessionStorage = isTauri()
  ? new TauriSessionStorage()
  : new BrowserSessionStorage()
