/** Regras puras de validação de credenciais, reaproveitáveis por login e registro. */

export const PASSWORD_MIN_LENGTH = 6

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}
