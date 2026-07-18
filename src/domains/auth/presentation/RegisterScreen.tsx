import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { Lock, Mail, User } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { ApiError } from '@/shared/api/ApiError'
import { useAuthStore } from './authStore'
import { AuthLayout } from './AuthLayout'
import { registerFormSchema, type RegisterFormValues } from './authForms'

export function RegisterScreen() {
  const registerUser = useAuthStore((s) => s.register)
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await registerUser(values)
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.status === 409
            ? 'Já existe uma conta com este e-mail.'
            : err.message
          : 'Não foi possível criar a conta. Tente novamente.',
      )
    }
  })

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle="Comece hoje o desafio e dê vida ao seu avatar."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3.5 py-2.5 text-sm text-[var(--color-danger)]">
            {formError}
          </div>
        )}
        <Input
          label="Nome completo"
          placeholder="Seu nome"
          autoComplete="name"
          leftIcon={<User className="size-4" />}
          error={errors.name?.message}
          {...register('name')}
        />
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
          placeholder="Mínimo de 6 caracteres"
          autoComplete="new-password"
          leftIcon={<Lock className="size-4" />}
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" block loading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  )
}
