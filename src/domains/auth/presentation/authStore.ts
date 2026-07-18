import { create } from 'zustand'
import { configureAuth } from '@/shared/api/apiClient'
import type { LoginCredentials, RegisterInput } from '../domain/Credentials'
import type { Session } from '../domain/Session'
import { authUseCases } from './authModule'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  session: Session | null
  status: AuthStatus
  bootstrap: () => Promise<void>
  login: (credentials: LoginCredentials) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  status: 'idle',

  bootstrap: async () => {
    set({ status: 'loading' })
    const session = await authUseCases.restore()
    set(
      session
        ? { session, status: 'authenticated' }
        : { session: null, status: 'unauthenticated' },
    )
  },

  login: async (credentials) => {
    const session = await authUseCases.login(credentials)
    set({ session, status: 'authenticated' })
  },

  register: async (input) => {
    const session = await authUseCases.register(input)
    set({ session, status: 'authenticated' })
  },

  logout: async () => {
    await authUseCases.logout()
    set({ session: null, status: 'unauthenticated' })
  },
}))

// Liga o apiClient à sessão do store: token, refresh transparente e perda de sessão.
configureAuth({
  getAccessToken: () => useAuthStore.getState().session?.accessToken ?? null,
  refreshToken: async () => {
    const current = useAuthStore.getState().session
    if (!current) return null
    const next = await authUseCases.refresh(current)
    if (next) {
      useAuthStore.setState({ session: next, status: 'authenticated' })
      return next.accessToken
    }
    useAuthStore.setState({ session: null, status: 'unauthenticated' })
    return null
  },
  onAuthLost: () => {
    useAuthStore.setState({ session: null, status: 'unauthenticated' })
  },
})
