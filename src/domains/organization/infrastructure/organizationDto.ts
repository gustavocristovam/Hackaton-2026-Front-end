import { z } from 'zod'
import {
  ORG_TYPES,
  type MemberRole,
  type Organization,
  type OrganizationMember,
  type OrgType,
  type RankingEntry,
} from '../domain/Organization'

const id = z.union([z.string(), z.number()]).nullish().transform((v) => String(v ?? ''))
const numeric = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((v) => (v === null || v === undefined ? 0 : Number(v) || 0))

function asOrgType(value: unknown): OrgType | null {
  if (typeof value !== 'string') return null
  const match = ORG_TYPES.find((t) => t === value.trim().toLowerCase())
  return match ?? null
}

function asRole(value: unknown): MemberRole {
  if (typeof value === 'string') {
    const role = value.trim().toLowerCase()
    if (role === 'owner' || role === 'admin' || role === 'member') return role
  }
  return 'member'
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  const envelope = (raw ?? {}) as Record<string, unknown>
  if (Array.isArray(envelope.data)) return envelope.data
  if (Array.isArray(envelope.items)) return envelope.items
  if (Array.isArray(envelope.members)) return envelope.members
  if (Array.isArray(envelope.ranking)) return envelope.ranking
  return []
}

export const organizationDtoSchema = z.object({
  id,
  name: z.string().nullish(),
  nome: z.string().nullish(),
  code: z.string().nullish(),
  codigo: z.string().nullish(),
  tipo: z.unknown(),
  type: z.unknown(),
  owner_id: id.optional(),
  ownerId: id.optional(),
  created_at: z.string().nullish(),
  createdAt: z.string().nullish(),
})

export function toOrganization(raw: unknown): Organization {
  const dto = organizationDtoSchema.parse(raw)
  return {
    id: dto.id,
    name: dto.name ?? dto.nome ?? '',
    code: (dto.code ?? dto.codigo ?? '').toUpperCase(),
    tipo: asOrgType(dto.tipo ?? dto.type),
    ownerId: dto.owner_id || dto.ownerId || null,
    createdAt: dto.created_at ?? dto.createdAt ?? null,
  }
}

/** /organizations/join pode devolver a org direto ou aninhada. */
export function toOrganizationLoose(raw: unknown): Organization {
  const envelope = (raw ?? {}) as Record<string, unknown>
  const target = envelope.organization ?? envelope.data ?? raw
  return toOrganization(target)
}

/** Lista de organizações do usuário (quando a API expõe). */
export function toOrganizations(raw: unknown): Organization[] {
  return unwrapList(raw).map(toOrganization)
}

const memberDtoSchema = z.object({
  id,
  user_id: id.optional(),
  userId: id.optional(),
  name: z.string().nullish(),
  nome: z.string().nullish(),
  role: z.unknown(),
  papel: z.unknown(),
  joined_at: z.string().nullish(),
  joinedAt: z.string().nullish(),
  user: z.unknown().optional(),
})

export function toMembers(raw: unknown): OrganizationMember[] {
  return unwrapList(raw).map((item) => {
    const dto = memberDtoSchema.parse(item)
    // O nome pode vir aninhado em `user`.
    const nested = dto.user
      ? z.object({ id, name: z.string().nullish() }).parse(dto.user)
      : null
    return {
      id: dto.id,
      userId: dto.user_id || dto.userId || nested?.id || '',
      name: dto.name ?? dto.nome ?? nested?.name ?? 'Membro',
      role: asRole(dto.role ?? dto.papel),
      joinedAt: dto.joined_at ?? dto.joinedAt ?? null,
    }
  })
}

const rankingDtoSchema = z.object({
  user_id: id.optional(),
  userId: id.optional(),
  id: id.optional(),
  name: z.string().nullish(),
  nome: z.string().nullish(),
  total: numeric.optional(),
  media: numeric.optional(),
  average: numeric.optional(),
})

export function toRanking(raw: unknown): RankingEntry[] {
  return unwrapList(raw).map((item, index) => {
    const dto = rankingDtoSchema.parse(item)
    return {
      userId: dto.user_id || dto.userId || dto.id || String(index),
      name: dto.name ?? dto.nome ?? 'Participante',
      total: dto.total ?? 0,
      media: dto.media ?? dto.average ?? 0,
      position: index + 1,
    }
  })
}
