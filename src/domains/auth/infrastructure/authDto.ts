import { z } from 'zod'
import { Session } from '../domain/Session'

/**
 * Schemas dos DTOs de /auth/*. Fonte de verdade do formato que a API retorna.
 * Aceitamos snake_case e camelCase pois o contrato ainda pode variar nesse detalhe.
 */
export const authTokensSchema = z
  .object({
    access_token: z.string().optional(),
    accessToken: z.string().optional(),
    refresh_token: z.string().optional(),
    refreshToken: z.string().optional(),
    expires_in: z.number().optional(),
    expiresIn: z.number().optional(),
  })
  .transform((dto, ctx) => {
    const accessToken = dto.access_token ?? dto.accessToken
    const refreshToken = dto.refresh_token ?? dto.refreshToken
    if (!accessToken || !refreshToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Resposta de autenticação sem tokens',
      })
      return z.NEVER
    }
    const expiresIn = dto.expires_in ?? dto.expiresIn
    return {
      accessToken,
      refreshToken,
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
    }
  })

export type AuthTokensDto = z.infer<typeof authTokensSchema>

/** Mapper DTO → entidade de domínio. */
export function toSession(raw: unknown): Session {
  const dto = authTokensSchema.parse(raw)
  return Session.create(dto)
}
