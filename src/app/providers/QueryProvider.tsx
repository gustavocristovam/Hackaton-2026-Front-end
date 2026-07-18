import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { ApiError } from '@/shared/api/ApiError'

/** Provider do TanStack Query com política de retry consciente da API. */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              // Não insistir em erros de autenticação ou de validação.
              if (error instanceof ApiError && error.status < 500) return false
              return failureCount < 2
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
