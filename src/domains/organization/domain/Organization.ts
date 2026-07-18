/** Organizações, membros e ranking (domínio puro). */

export const ORG_TYPES = ['empresa', 'academia', 'escola'] as const
export type OrgType = (typeof ORG_TYPES)[number]

export type MemberRole = 'owner' | 'admin' | 'member'

export interface Organization {
  id: string
  name: string
  code: string
  tipo: OrgType | null
  ownerId: string | null
  createdAt: string | null
}

export interface OrganizationMember {
  id: string
  userId: string
  name: string
  role: MemberRole
  joinedAt: string | null
}

export interface RankingEntry {
  userId: string
  name: string
  total: number
  media: number
  position: number
}

export type RankingOrder = 'total' | 'media'

/** Só owner e admin administram a organização. */
export function canManageOrganization(role: MemberRole | null): boolean {
  return role === 'owner' || role === 'admin'
}

/** O owner não pode ser removido nem sair sem transferir a organização. */
export function canRemoveMember(
  actorRole: MemberRole | null,
  targetRole: MemberRole,
): boolean {
  if (!canManageOrganization(actorRole)) return false
  if (targetRole === 'owner') return false
  // Admin não remove outro admin; só o owner faz isso.
  if (targetRole === 'admin' && actorRole !== 'owner') return false
  return true
}

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Dono',
  admin: 'Administrador',
  member: 'Membro',
}

/** Código de convite normalizado (sempre maiúsculo, sem espaços). */
export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase()
}
