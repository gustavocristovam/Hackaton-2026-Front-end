import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { ApiError } from '@/shared/api/ApiError'
import { useAuthStore } from './authStore'
import { AuthLayout } from './AuthLayout'
import { loginFormSchema, type LoginFormValues } from './authForms'

export function LoginScreen() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values)
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.status === 401
            ? 'E-mail ou senha incorretos.'
            : err.message
          : 'Não foi possível entrar. Tente novamente.',
      )
    }
  })

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre para continuar seu desafio de 100 dias."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-sm font-medium text-danger">
            {formError}
          </div>
        )}
        <Input
          type="email"
          label="E-mail"
          placeholder="voce@email.com"
          autoComplete="email"
          leftIcon={<Mail className="size-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          type="password"
          label="Senha"
          placeholder="••••••••"
          autoComplete="current-password"
          leftIcon={<Lock className="size-4" />}
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" block loading={isSubmitting}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
