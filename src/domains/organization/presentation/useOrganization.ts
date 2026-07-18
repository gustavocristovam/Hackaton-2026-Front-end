import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { OrgType } from '../domain/Organization'
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
  detail: (id: string) => [...orgKeys.all, 'detail', id] as const,
  members: (id: string) => [...orgKeys.all, 'members', id] as const,
  ranking: (id: string, params: RepoRankingParams) =>
    [...orgKeys.all, 'ranking', id, params] as const,
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
  const setOrganizationId = useCurrentOrgStore((s) => s.setOrganizationId)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, tipo }: { name: string; tipo?: OrgType }) =>
      createOrganization(name, tipo),
    onSuccess: (org) => {
      setOrganizationId(org.id)
      void queryClient.invalidateQueries({ queryKey: orgKeys.all })
    },
  })
}

export function useJoinOrganization() {
  const setOrganizationId = useCurrentOrgStore((s) => s.setOrganizationId)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => joinOrganizationByCode(code),
    onSuccess: (org) => {
      setOrganizationId(org.id)
      void queryClient.invalidateQueries({ queryKey: orgKeys.all })
    },
  })
}

export function useLeaveOrganization() {
  const setOrganizationId = useCurrentOrgStore((s) => s.setOrganizationId)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizationRepository.leave(id),
    onSuccess: () => {
      setOrganizationId(null)
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
