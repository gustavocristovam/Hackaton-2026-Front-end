/** Entidade de usuário e estatísticas de gamificação (camada de domínio pura). */
export interface User {
  id: string
  name: string
  email: string
  xpTotal: number
  currentStreak: number
  recordStreak: number
  createdAt: string | null
}

export interface UserStats {
  xpTotal: number
  currentStreak: number
  recordStreak: number
  avatarLevel: number
}
