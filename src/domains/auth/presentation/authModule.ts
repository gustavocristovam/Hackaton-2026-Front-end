import { AuthUseCases } from '../application/authUseCases'
import { HttpAuthRepository } from '../infrastructure/HttpAuthRepository'
import { sessionStorage } from '../infrastructure/sessionStorage'

/**
 * Raiz de composição do domínio auth: monta as dependências uma única vez.
 * A UI consome `authUseCases`, nunca as implementações concretas.
 */
export const authUseCases = new AuthUseCases(new HttpAuthRepository(), sessionStorage)
