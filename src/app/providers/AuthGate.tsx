import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/domains/auth/presentation/authStore'
import { Spinner } from '@/shared/ui/Spinner'
import { Logo } from '@/shared/ui/Logo'

/**
 * Restaura a sessão persistida antes de renderizar as rotas.
 * Evita "piscar" a tela de login para quem já está autenticado.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    if (status === 'idle') void bootstrap()
  }, [status, bootstrap])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-alt">
        <div className="flex flex-col items-center gap-4">
          <Logo withText={false} className="scale-125" />
          <Spinner className="size-6 text-brand-600" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
