import { NavLink, Outlet, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, Home, LineChart, LogOut, Sparkles, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '@/shared/ui/Logo'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/domains/auth/presentation/authStore'

const NAV = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/checkin', label: 'Check-in', icon: Sparkles },
  { to: '/progresso', label: 'Progresso', icon: LineChart },
  { to: '/conquistas', label: 'Conquistas', icon: Award },
  { to: '/organizacao', label: 'Organização', icon: Users },
]

/**
 * Casca das rotas autenticadas: header de vidro fixo no topo e, no mobile,
 * uma barra inferior flutuante — o padrão de app, não de site.
 */
export function AppShell() {
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/60 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3.5">
          <Logo />

          <nav className="hidden items-center gap-0.5 sm:flex">
            {NAV.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>

          <button
            type="button"
            onClick={() => void logout()}
            title="Sair da conta"
            className="grid size-9 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
          >
            <LogOut className="size-4" />
            <span className="sr-only">Sair</span>
          </button>
        </div>
      </header>

      {/* pb extra no mobile para o conteúdo não ficar sob a barra flutuante */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-32 pt-8 sm:pb-16 sm:pt-10">
        <AnimatePresence mode="wait">
          {/* key por rota: cada tela entra com seu próprio fade */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Barra inferior flutuante — só no mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 sm:hidden">
        <div className="flex w-full max-w-md items-center justify-around gap-1 rounded-2xl border border-(--glass-border) bg-white/80 p-1.5 shadow-[var(--shadow-e3),var(--glass-highlight)] backdrop-blur-2xl backdrop-saturate-150">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} compact />
          ))}
        </div>
      </nav>
    </div>
  )
}

function NavItem({
  to,
  label,
  icon: Icon,
  compact,
}: {
  to: string
  label: string
  icon: typeof Home
  compact?: boolean
}) {
  return (
    <NavLink to={to} end={to === '/'} className="relative shrink-0">
      {({ isActive }) => (
        <>
          {/*
            layoutId compartilhado: a pílula desliza entre os itens em vez de
            piscar. `compact` separa os grupos para desktop e mobile não brigarem.
          */}
          {isActive && (
            <motion.span
              layoutId={compact ? 'nav-pill-mobile' : 'nav-pill'}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="absolute inset-0 rounded-xl bg-brand-500/12 ring-1 ring-inset ring-brand-500/20"
            />
          )}
          <span
            className={cn(
              'relative flex items-center justify-center gap-1.5 rounded-xl transition-colors duration-200',
              compact ? 'flex-col px-2 py-1.5' : 'px-3 py-2',
              isActive ? 'text-brand-700' : 'text-muted hover:text-ink',
            )}
          >
            <Icon className={compact ? 'size-[1.15rem]' : 'size-4'} />
            <Content compact={compact}>{label}</Content>
          </span>
        </>
      )}
    </NavLink>
  )
}

function Content({ compact, children }: { compact?: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        'font-semibold',
        compact ? 'text-[0.625rem] tracking-tight' : 'text-sm',
      )}
    >
      {children}
    </span>
  )
}
