import { useQuery } from '@tanstack/react-query'
import { userRepository } from '../infrastructure/HttpUserRepository'

/** Dados do usuário autenticado (/users/me). */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userRepository.me(),
  })
}

/** Resumo de gamificação (/users/me/stats). */
export function useUserStats() {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => userRepository.stats(),
  })
}
