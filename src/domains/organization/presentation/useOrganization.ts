import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { OrgType, Organization } from '../domain/Organization'
import {
  organizationRepository,
  type RankingParams as RepoRankingParams,
} from '../infrastructure/HttpOrganizationRepository'
import {
  createOrganization,
  joinOrganizationByCode,
} from '../application/organizationUseCases'
import { useCurrentOrgStore } from './currentOrgStore'

export const orgKeys = {
  all: ['organization'] as const,
  mine: (ids: string[]) => [...orgKeys.all, 'mine', ids] as const,
  detail: (id: string) => [...orgKeys.all, 'detail', id] as const,
  members: (id: string) => [...orgKeys.all, 'members', id] as const,
  ranking: (id: string, params: RepoRankingParams) =>
    [...orgKeys.all, 'ranking', id, params] as const,
}

/**
 * Todas as organizações do usuário. Prefere `GET /organizations/me`; se o
 * back-end não tiver a rota, resolve os ids guardados no store um a um.
 */
export function useMyOrganizations() {
  const organizationIds = useCurrentOrgStore((s) => s.organizationIds)

  return useQuery({
    queryKey: orgKeys.mine(organizationIds),
    queryFn: async (): Promise<Organization[]> => {
      const remote = await organizationRepository.mine()
      if (remote) return remote

      // Fallback: uma organização removida no servidor simplesmente falha aqui
      // e some da lista, sem derrubar as demais.
      const results = await Promise.allSettled(
        organizationIds.map((id) => organizationRepository.byId(id)),
      )
      return results
        .filter((r): r is PromiseFulfilledResult<Organization> => r.status === 'fulfilled')
        .map((r) => r.value)
    },
  })
}

export function useOrganization(id: string | null) {
  return useQuery({
    queryKey: orgKeys.detail(id ?? ''),
    queryFn: () => organizationRepository.byId(id as string),
    enabled: !!id,
  })
}

export function useOrganizationMembers(id: string | null) {
  return useQuery({
    queryKey: orgKeys.members(id ?? ''),
    queryFn: () => organizationRepository.members(id as string),
    enabled: !!id,
  })
}

export function useOrganizationRanking(
  id: string | null,
  params: RepoRankingParams = { orderBy: 'total' },
) {
  return useQuery({
    queryKey: orgKeys.ranking(id ?? '', params),
    queryFn: () => organizationRepository.ranking(id as string, params),
    enabled: !!id,
  })
}

export function useCreateOrganization() {
  const addOrganization = useCurrentOrgStore((s) => s.addOrganization)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, tipo }: { name: string; tipo?: OrgType }) =>
      createOrganization(name, tipo),
    onSuccess: (org) => {
      addOrganization(org.id)
      void queryClient.invalidateQueries({ queryKey: orgKeys.all })
    },
  })
}

export function useJoinOrganization() {
  const addOrganization = useCurrentOrgStore((s) => s.addOrganization)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => joinOrganizationByCode(code),
    onSuccess: (org) => {
      addOrganization(org.id)
      void queryClient.invalidateQueries({ queryKey: orgKeys.all })
    },
  })
}

export function useLeaveOrganization() {
  const removeOrganization = useCurrentOrgStore((s) => s.removeOrganization)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizationRepository.leave(id),
    onSuccess: (_data, id) => {
      removeOrganization(id)
      void queryClient.invalidateQueries({ queryKey: orgKeys.all })
    },
  })
}

export function useRemoveMember(organizationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      organizationRepository.removeMember(organizationId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgKeys.members(organizationId) })
      void queryClient.invalidateQueries({ queryKey: orgKeys.all })
    },
  })
}

export type { RepoRankingParams as RankingParams }
