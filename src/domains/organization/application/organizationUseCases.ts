import { normalizeInviteCode, type OrgType } from '../domain/Organization'
import type { Organization } from '../domain/Organization'
import { organizationRepository } from '../infrastructure/HttpOrganizationRepository'

/** Casos de uso de organização. */

export class InvalidInviteCodeError extends Error {
  constructor() {
    super('Informe o código de convite da organização.')
    this.name = 'InvalidInviteCodeError'
  }
}

/** Entra em uma organização a partir do código de convite. */
export async function joinOrganizationByCode(rawCode: string): Promise<Organization> {
  const code = normalizeInviteCode(rawCode)
  if (!code) throw new InvalidInviteCodeError()
  return organizationRepository.join(code)
}

export async function createOrganization(
  name: string,
  tipo?: OrgType,
): Promise<Organization> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Informe o nome da organização.')
  return organizationRepository.create({ name: trimmed, tipo })
}
