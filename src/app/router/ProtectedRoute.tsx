import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/domains/auth/presentation/authStore'

/** Bloqueia rotas privadas quando não há sessão autenticada. */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)
  if (status !== 'authenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

/** Impede que usuário logado veja login/registro. */
export function PublicOnlyRoute() {
  const status = useAuthStore((s) => s.status)
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}
