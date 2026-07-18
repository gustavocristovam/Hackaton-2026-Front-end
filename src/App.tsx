import { QueryProvider } from '@/app/providers/QueryProvider'
import { AuthGate } from '@/app/providers/AuthGate'
import { AppRouter } from '@/app/router/AppRouter'

export default function App() {
  return (
    <QueryProvider>
      <AuthGate>
        <AppRouter />
      </AuthGate>
    </QueryProvider>
  )
}
