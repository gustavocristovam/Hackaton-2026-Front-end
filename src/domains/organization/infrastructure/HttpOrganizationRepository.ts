import { apiClient } from '@/shared/api/apiClient'
import type {
  Organization,
  OrganizationMember,
  OrgType,
  RankingEntry,
  RankingOrder,
} from '../domain/Organization'
import {
  toMembers,
  toOrganization,
  toOrganizationLoose,
  toRanking,
} from './organizationDto'

export interface CreateOrgInput {
  name: string
  tipo?: OrgType
}

export interface RankingParams {
  from?: string
  to?: string
  orderBy?: RankingOrder
}

export const organizationRepository = {
  async create(input: CreateOrgInput): Promise<Organization> {
    return toOrganizationLoose(await apiClient.post<unknown>('/organizations', input))
  },

  async byId(id: string): Promise<Organization> {
    return toOrganization(await apiClient.get<unknown>(`/organizations/${id}`))
  },

  async update(
    id: string,
    input: { name?: string; tipo?: OrgType },
  ): Promise<Organization> {
    return toOrganizationLoose(
      await apiClient.patch<unknown>(`/organizations/${id}`, input),
    )
  },

  async join(code: string): Promise<Organization> {
    return toOrganizationLoose(
      await apiClient.post<unknown>('/organizations/join', { code }),
    )
  },

  async leave(id: string): Promise<void> {
    await apiClient.post<void>(`/organizations/${id}/leave`)
  },

  async members(
    id: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<OrganizationMember[]> {
    return toMembers(
      await apiClient.get<unknown>(`/organizations/${id}/members`, {
        query: { ...params },
      }),
    )
  },

  async removeMember(id: string, userId: string): Promise<void> {
    await apiClient.delete<void>(`/organizations/${id}/members/${userId}`)
  },

  async ranking(id: string, params: RankingParams = {}): Promise<RankingEntry[]> {
    return toRanking(
      await apiClient.get<unknown>(`/organizations/${id}/ranking`, {
        query: { ...params },
      }),
    )
  },
}
