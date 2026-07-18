import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Crown, LogOut, Plus, Trophy, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Spinner } from '@/shared/ui/Spinner'
import { PageHeader } from '@/shared/ui/PageHeader'
import { cn } from '@/shared/lib/cn'
import { ORG_TYPES, ROLE_LABELS, type OrgType } from '../domain/Organization'
import {
  useCreateOrganization,
  useJoinOrganization,
  useLeaveOrganization,
  useOrganization,
  useOrganizationMembers,
  useOrganizationRanking,
} from './useOrganization'
import { useCurrentOrgStore } from './currentOrgStore'

/**
 * Tela do domínio de organização: entra em uma organização por código
 * (ou cria uma) e, quando já faz parte, mostra membros e ranking.
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
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Equipe"
        title="Organização"
        subtitle={
          organization
            ? 'Acompanhe sua equipe e o ranking do grupo.'
            : 'Entre com um código de convite ou crie a sua organização.'
        }
      />

      {organization ? (
        <CurrentOrganization organizationId={organization.id} />
      ) : (
        <div className="mt-7 grid gap-4">
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
    <Card variant="solid" className="relative overflow-hidden p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="relative">
        <SectionTitle icon={<Users className="size-4" />}>
          Entrar com código
        </SectionTitle>
        <p className="mt-1.5 text-sm text-muted">
          Peça o código de convite para quem administra a organização.
        </p>
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start"
          onSubmit={(event) => {
            event.preventDefault()
            join.mutate(code)
          }}
        >
          <div className="flex-1">
            <Input
              placeholder="Ex.: ORB-1234"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="font-semibold uppercase tracking-[0.12em]"
              error={join.isError ? (join.error as Error).message : undefined}
            />
          </div>
          <Button type="submit" loading={join.isPending} disabled={!code.trim()}>
            Entrar
          </Button>
        </form>
      </div>
    </Card>
  )
}

function CreateForm() {
  const [name, setName] = useState('')
  const [tipo, setTipo] = useState<OrgType | ''>('')
  const create = useCreateOrganization()

  return (
    <Card className="p-6">
      <SectionTitle icon={<Plus className="size-4" />}>
        Criar uma organização
      </SectionTitle>
      <p className="mt-1.5 text-sm text-muted">
        Você vira o dono e recebe um código para convidar sua equipe.
      </p>
      <form
        className="mt-4 space-y-3.5"
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
        <Select
          label="Tipo"
          hint="Opcional — ajuda a organizar o ranking."
          value={tipo}
          onChange={(event) => setTipo(event.target.value as OrgType | '')}
        >
          <option value="">Selecione…</option>
          {ORG_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Button
          type="submit"
          block
          variant="outline"
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
  const { data: ranking } = useOrganizationRanking(organizationId)
  const leave = useLeaveOrganization()

  if (!organization) return null

  return (
    <div className="mt-7 space-y-4">
      {/* Cabeçalho da org: identidade + código de convite copiável */}
      <Card variant="solid" className="relative overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl brand-gradient text-lg font-bold text-white shadow-[var(--shadow-glow),inset_0_1px_0_0_rgb(255_255_255/0.3)]">
              {organization.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink">
                {organization.name}
              </h2>
              <p className="text-xs font-medium capitalize text-muted">
                {organization.tipo ?? 'organização'}
                {members && ` · ${members.length} membros`}
              </p>
            </div>
          </div>
          <CopyCode code={organization.code} />
        </div>
      </Card>

      {ranking && ranking.length > 0 && (
        <Card className="p-6">
          <SectionTitle icon={<Trophy className="size-4" />}>Ranking</SectionTitle>
          <ol className="mt-4 space-y-1.5">
            {ranking.slice(0, 10).map((entry, index) => (
              <motion.li
                key={entry.userId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5',
                  // Só o pódio ganha fundo — o resto vira ruído visual.
                  index < 3 ? 'bg-brand-50/70 ring-1 ring-inset ring-brand-200/60' : '',
                )}
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold',
                    index === 0
                      ? 'bg-linear-to-br from-amber-400 to-amber-600 text-white'
                      : index < 3
                        ? 'bg-brand-500/15 text-brand-700'
                        : 'bg-ink/5 text-muted',
                  )}
                >
                  {entry.position || index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                  {entry.name}
                </span>
                <span className="text-sm font-bold text-brand-700">{entry.total}</span>
              </motion.li>
            ))}
          </ol>
        </Card>
      )}

      <Card className="p-6">
        <SectionTitle icon={<Users className="size-4" />}>Membros</SectionTitle>
        {isLoading ? (
          <div className="grid place-items-center py-8">
            <Spinner className="size-6 text-brand-600" />
          </div>
        ) : members?.length ? (
          <ul className="mt-4 divide-y divide-[var(--color-line)]">
            {members.map((member) => (
              <li key={member.id} className="flex items-center gap-3 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-500/12 text-xs font-bold text-brand-700 ring-1 ring-inset ring-brand-500/15">
                  {member.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {member.name}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold',
                    member.role === 'member'
                      ? 'bg-ink/5 text-muted'
                      : 'bg-brand-500/12 text-brand-700',
                  )}
                >
                  {member.role === 'owner' && <Crown className="size-3" />}
                  {ROLE_LABELS[member.role]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">Nenhum membro ainda.</p>
        )}
      </Card>

      <Button
        block
        variant="ghost"
        loading={leave.isPending}
        onClick={() => leave.mutate(organization.id)}
        className="text-muted hover:bg-danger/10 hover:text-danger"
      >
        <LogOut className="size-4" />
        Sair da organização
      </Button>
    </div>
  )
}

/** Código de convite com confirmação visual ao copiar. */
function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
      title="Copiar código de convite"
      className="group flex items-center gap-2.5 rounded-xl border border-(--glass-border) bg-white/70 px-3.5 py-2.5 shadow-[var(--shadow-e1),var(--glass-highlight)] backdrop-blur-md transition-all duration-200 hover:border-brand-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
    >
      <span className="text-left">
        <span className="block text-[0.625rem] font-semibold uppercase tracking-wide text-muted">
          Código de convite
        </span>
        <span className="block font-bold tracking-[0.12em] text-ink">{code}</span>
      </span>
      {copied ? (
        <Check className="size-4 text-brand-600" />
      ) : (
        <Copy className="size-4 text-muted transition-colors group-hover:text-brand-600" />
      )}
    </button>
  )
}

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-lg bg-brand-500/12 text-brand-600 ring-1 ring-inset ring-brand-500/15">
        {icon}
      </span>
      <h2 className="font-bold tracking-tight text-ink">{children}</h2>
    </div>
  )
}
