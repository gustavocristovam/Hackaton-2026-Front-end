import { createBrowserRouter, RouterProvider } from 'react-router'
import { LoginScreen } from '@/domains/auth/presentation/LoginScreen'
import { RegisterScreen } from '@/domains/auth/presentation/RegisterScreen'
import { CheckinScreen } from '@/domains/checkin/presentation/CheckinScreen'
import { ProgressScreen } from '@/domains/score/presentation/ProgressScreen'
import { BadgesScreen } from '@/domains/gamification/presentation/BadgesScreen'
import { OrganizationScreen } from '@/domains/organization/presentation/OrganizationScreen'
import { HomeScreen } from '@/app/HomeScreen'
import { AppShell } from '@/app/layout/AppShell'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'

const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginScreen /> },
      { path: '/register', element: <RegisterScreen /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <HomeScreen /> },
          { path: '/checkin', element: <CheckinScreen /> },
          { path: '/progresso', element: <ProgressScreen /> },
          { path: '/conquistas', element: <BadgesScreen /> },
          { path: '/organizacao', element: <OrganizationScreen /> },
          { path: '*', element: <HomeScreen /> },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
