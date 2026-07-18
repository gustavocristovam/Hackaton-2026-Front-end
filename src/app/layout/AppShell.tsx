import { NavLink, Outlet } from 'react-router'
import { Award, Home, LineChart, LogOut, Sparkles, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '@/shared/ui/Logo'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/domains/auth/presentation/authStore'

const NAV = [
  { to: '/', label: 'Início', icon: <Home className="size-4" /> },
  { to: '/checkin', label: 'Check-in', icon: <Sparkles className="size-4" /> },
  { to: '/progresso', label: 'Progresso', icon: <LineChart className="size-4" /> },
  { to: '/conquistas', label: 'Conquistas', icon: <Award className="size-4" /> },
  { to: '/organizacao', label: 'Organização', icon: <Users className="size-4" /> },
]

/**
 * Casca das rotas autenticadas: header fixo com navegação entre os domínios
 * e um container único para o conteúdo de cada tela.
 */
export function AppShell() {
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-line)] bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <NavItem key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </NavItem>
            ))}
          </nav>
          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>

        {/* Em telas pequenas a navegação vira uma segunda linha rolável */}
        <nav className="flex gap-1 overflow-x-auto px-6 pb-3 sm:hidden">
          {NAV.map((item) => (
            <NavItem key={item.to} to={item.to} icon={item.icon}>
              {item.label}
            </NavItem>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({
  to,
  icon,
  children,
}: {
  to: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-600'
            : 'text-muted hover:bg-surface-alt hover:text-ink',
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  )
}
