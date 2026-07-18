import { useState } from 'react'
import { Copy, LogOut, Plus, Users } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Spinner } from '@/shared/ui/Spinner'
import { ORG_TYPES, ROLE_LABELS, type OrgType } from '../domain/Organization'
import {
  useCreateOrganization,
  useJoinOrganization,
  useLeaveOrganization,
  useOrganization,
  useOrganizationMembers,
} from './useOrganization'
import { useCurrentOrgStore } from './currentOrgStore'

/**
 * Tela do domínio de organização: entra em uma organização por código
 * (ou cria uma) e, quando já faz parte, mostra os membros.
 */
export function OrganizationScreen() {
  const organizationId = useCurrentOrgStore((s) => s.organizationId)
  const { data: organization, isLoading } = useOrganization(organizationId)

  if (organizationId && isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner className="size-8 text-brand-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold text-ink">Organização</h1>
        <p className="mt-1 text-sm text-muted">
          {organization
            ? 'Acompanhe sua equipe e o ranking do grupo.'
            : 'Entre em uma organização com o código de convite ou crie a sua.'}
        </p>
      </header>

      {organization ? (
        <CurrentOrganization organizationId={organization.id} />
      ) : (
        <div className="mt-8 space-y-4">
          <JoinForm />
          <CreateForm />
        </div>
      )}
    </div>
  )
}

function JoinForm() {
  const [code, setCode] = useState('')
  const join = useJoinOrganization()

  return (
    <Card className="p-5">
      <SectionTitle icon={<Users className="size-4" />}>
        Entrar com código
      </SectionTitle>
      <form
        className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault()
          join.mutate(code)
        }}
      >
        <div className="flex-1">
          <Input
            label="Código de convite"
            placeholder="Ex.: SG-1234"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            error={join.isError ? (join.error as Error).message : undefined}
          />
        </div>
        <Button type="submit" loading={join.isPending} disabled={!code.trim()}>
          Entrar
        </Button>
      </form>
    </Card>
  )
}

function CreateForm() {
  const [name, setName] = useState('')
  const [tipo, setTipo] = useState<OrgType | ''>('')
  const create = useCreateOrganization()

  return (
    <Card className="p-5">
      <SectionTitle icon={<Plus className="size-4" />}>
        Criar uma organização
      </SectionTitle>
      <form
        className="mt-3 space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          create.mutate({ name, tipo: tipo || undefined })
        }}
      >
        <Input
          label="Nome"
          placeholder="Ex.: Academia Corpo & Mente"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={create.isError ? (create.error as Error).message : undefined}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="org-tipo" className="text-sm font-medium text-ink">
            Tipo <span className="text-xs text-muted">(opcional)</span>
          </label>
          <select
            id="org-tipo"
            value={tipo}
            onChange={(event) => setTipo(event.target.value as OrgType | '')}
            className="h-11 w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">Selecione…</option>
            {ORG_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          block
          variant="ghost"
          loading={create.isPending}
          disabled={!name.trim()}
        >
          Criar organização
        </Button>
      </form>
    </Card>
  )
}

function CurrentOrganization({ organizationId }: { organizationId: string }) {
  const { data: organization } = useOrganization(organizationId)
  const { data: members, isLoading } = useOrganizationMembers(organizationId)
  const leave = useLeaveOrganization()

  if (!organization) return null

  return (
    <div className="mt-8 space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-lg font-semibold text-ink">{organization.name}</h2>
          {organization.tipo && (
            <p className="text-xs capitalize text-muted">{organization.tipo}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(organization.code)}
          title="Copiar código de convite"
          className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-100"
        >
          <Copy className="size-4" />
          {organization.code}
        </button>
      </Card>

      <Card className="p-5">
        <SectionTitle icon={<Users className="size-4" />}>Membros</SectionTitle>
        {isLoading ? (
          <div className="grid place-items-center py-6">
            <Spinner className="size-6 text-brand-600" />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--color-line)]">
            {members?.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="font-medium text-ink">{member.name}</span>
                <span className="text-xs text-muted">{ROLE_LABELS[member.role]}</span>
              </li>
            ))}
            {!members?.length && (
              <li className="py-2.5 text-sm text-muted">Nenhum membro ainda.</li>
            )}
          </ul>
        )}
      </Card>

      <Button
        block
        variant="ghost"
        loading={leave.isPending}
        onClick={() => leave.mutate(organization.id)}
      >
        <LogOut className="size-4" />
        Sair da organização
      </Button>
    </div>
  )
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </span>
      <h2 className="text-sm font-semibold text-ink">{children}</h2>
    </div>
  )
}
