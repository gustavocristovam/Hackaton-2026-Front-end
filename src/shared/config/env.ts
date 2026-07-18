/**
 * Configuração de ambiente.
 * O endereço real da API pode mudar — só este arquivo precisa saber disso.
 */
export const env = {
  apiBaseUrl:
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
    'http://localhost:3333',
} as const
