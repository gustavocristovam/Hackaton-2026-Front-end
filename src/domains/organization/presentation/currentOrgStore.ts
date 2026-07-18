import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * O contrato da API não expõe "minhas organizações" (não há GET /organizations/me),
 * então o app guarda localmente qual organização o usuário está acompanhando.
 * É definido ao criar ou entrar em uma, e limpo ao sair.
 */
interface CurrentOrgState {
  organizationId: string | null
  setOrganizationId: (id: string | null) => void
}

export const useCurrentOrgStore = create<CurrentOrgState>()(
  persist(
    (set) => ({
      organizationId: null,
      setOrganizationId: (organizationId) => set({ organizationId }),
    }),
    { name: 'sg:current-organization' },
  ),
)
