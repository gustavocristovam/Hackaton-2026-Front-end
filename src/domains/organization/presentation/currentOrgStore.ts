import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * O usuário pode participar de várias organizações.
 *
 * Quando a API expõe `GET /organizations/me`, ela é a fonte da verdade sobre
 * as participações. Este store guarda (a) quais organizações conhecemos
 * localmente — fallback para back-ends sem aquela rota — e (b) qual está
 * selecionada no momento.
 */
interface CurrentOrgState {
  organizationIds: string[]
  activeId: string | null
  addOrganization: (id: string) => void
  removeOrganization: (id: string) => void
  setActive: (id: string | null) => void
}

/** Formato antigo (uma única organização), migrado na v1. */
interface LegacyState {
  organizationId?: string | null
}

export const useCurrentOrgStore = create<CurrentOrgState>()(
  persist(
    (set) => ({
      organizationIds: [],
      activeId: null,

      addOrganization: (id) =>
        set((state) => ({
          organizationIds: state.organizationIds.includes(id)
            ? state.organizationIds
            : [...state.organizationIds, id],
          // Entrou agora: passa a ser a organização em foco.
          activeId: id,
        })),

      removeOrganization: (id) =>
        set((state) => {
          const organizationIds = state.organizationIds.filter((it) => it !== id)
          return {
            organizationIds,
            // Saiu da ativa: cai para a próxima que sobrou.
            activeId: state.activeId === id ? (organizationIds[0] ?? null) : state.activeId,
          }
        }),

      setActive: (activeId) => set({ activeId }),
    }),
    {
      name: 'sg:current-organization',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) {
          const legacy = (persisted ?? {}) as LegacyState
          const id = legacy.organizationId ?? null
          return {
            organizationIds: id ? [id] : [],
            activeId: id,
          } as Partial<CurrentOrgState>
        }
        return persisted as Partial<CurrentOrgState>
      },
    },
  ),
)
