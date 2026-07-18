import { z } from 'zod'
import { PASSWORD_MIN_LENGTH } from '../domain/Credentials'

/** Schemas de formulário — espelham as regras do domínio para o React Hook Form. */
export const loginFormSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

export const registerFormSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo'),
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
