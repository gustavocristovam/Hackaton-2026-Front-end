import { createBrowserRouter, RouterProvider } from 'react-router'
import { LoginScreen } from '@/domains/auth/presentation/LoginScreen'
import { RegisterScreen } from '@/domains/auth/presentation/RegisterScreen'
import { HomeScreen } from '@/app/HomeScreen'
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
    children: [{ path: '/', element: <HomeScreen /> }],
  },
  { path: '*', element: <HomeScreen /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
