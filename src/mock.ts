/**
 * Mock da API do Saúde Gamificada — arquivo único, enquanto o back-end não existe.
 *
 * Intercepta `window.fetch` e responde a todas as rotas consumidas pelos
 * repositórios em `src/domains/<dominio>/infrastructure/Http*Repository.ts`.
 * Nada mais no app precisa saber que o mock existe: o `apiClient`, os schemas
 * zod e os mappers continuam rodando exatamente como rodariam contra a API real
 * — inclusive validando os DTOs, já que as respostas aqui saem em snake_case.
 *
 * Como ligar/desligar:
 *   - Ativo por padrão em desenvolvimento.
 *   - `VITE_USE_MOCK=false` desliga (para apontar ao back-end de verdade).
 *   - `VITE_USE_MOCK=true` força ligado (inclusive em build de produção/demo).
 *
 * O estado vive em memória: check-ins criados durante a sessão alteram XP,
 * streak, avatar e score de verdade, mas tudo volta ao seed ao recarregar.
 */

import { env } from '@/shared/config/env'
import { estimateScore, type CheckinAnswers } from '@/domains/checkin/domain/Checkin'

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const flag = import.meta.env.VITE_USE_MOCK as string | undefined

export const isMockEnabled =
  flag === 'true' || (flag !== 'false' && import.meta.env.DEV)

/** Latência simulada (ms) para os estados de loading aparecerem de verdade. */
const LATENCY = [120, 340] as const

/** Quantos dias de histórico o seed gera (excluindo hoje). */
const HISTORY_DAYS = 89

/** Últimos N dias sempre preenchidos, para o streak atual ficar bonito na demo. */
const GUARANTEED_STREAK = 12

// ---------------------------------------------------------------------------
// Utilidades: aleatoriedade determinística e datas
// ---------------------------------------------------------------------------

/** PRNG com semente fixa: o mesmo histórico a cada reload, gráficos estáveis. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260718)

const pick = <T>(list: readonly T[]): T => list[Math.floor(rand() * list.length)]!
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** ISO `YYYY-MM-DD` no fuso local (evita o off-by-one do toISOString). */
function isoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysAgo(offset: number): Date {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - offset)
  return date
}

const today = () => isoDate(daysAgo(0))

function delay(): Promise<void> {
  const [min, max] = LATENCY
  return new Promise((resolve) => setTimeout(resolve, min + rand() * (max - min)))
}

let sequence = 1
const nextId = (prefix: string) => `${prefix}_${String(sequence++).padStart(4, '0')}`

// ---------------------------------------------------------------------------
// Regras espelhadas da API (níveis de avatar)
// ---------------------------------------------------------------------------

const LEVEL_THRESHOLDS = [0, 500, 1500, 3500, 7000] as const

function levelFromXp(xp: number): number {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]!) level = i + 1
  }
  return level
}

/** XP concedido por um check-in: metade do score do dia + bônus de treino. */
function xpFor(score: number, treino: boolean): number {
  return Math.round(score / 2) + (treino ? 10 : 0)
}

// ---------------------------------------------------------------------------
// "Banco de dados" em memória
// ---------------------------------------------------------------------------

interface MockCheckin extends CheckinAnswers {
  id: string
  date: string
  scoreDia: number
  xpGanho: number
  createdAt: string
}

interface MockOrg {
  id: string
  name: string
  code: string
  tipo: string
  ownerId: string
  createdAt: string
  members: {
    id: string
    userId: string
    name: string
    role: 'owner' | 'admin' | 'member'
    joinedAt: string
    /** Total de score acumulado no período — base do ranking. */
    total: number
    dias: number
  }[]
}

const db = {
  user: {
    id: 'usr_0001',
    name: 'Gustavo Cristovam',
    email: 'jhonatas.goncalves@gmail.com',
    createdAt: `${isoDate(daysAgo(HISTORY_DAYS + 4))}T09:12:00.000Z`,
  },
  checkins: [] as MockCheckin[],
  orgs: new Map<string, MockOrg>(),
}

/**
 * Gera as respostas do questionário coerentes com o score do dia:
 * dia bom → respostas boas. Mantém a tela de detalhe do check-in verossímil.
 */
function answersForScore(score: number): CheckinAnswers {
  if (score >= 80) {
    return {
      sono: pick(['Excelente', 'Boa'] as const),
      agua: 'Meta atingida',
      treino: rand() > 0.15,
      humor: pick(['Muito bom', 'Bom'] as const),
      alimentacao: pick(['Excelente', 'Boa'] as const),
      energia: pick([4, 5] as const),
    }
  }
  if (score >= 60) {
    return {
      sono: pick(['Boa', 'Regular'] as const),
      agua: pick(['Meta atingida', 'Quase'] as const),
      treino: rand() > 0.45,
      humor: pick(['Bom', 'Regular'] as const),
      alimentacao: pick(['Boa', 'Regular'] as const),
      energia: pick([3, 4] as const),
    }
  }
  if (score >= 40) {
    return {
      sono: pick(['Regular', 'Ruim'] as const),
      agua: pick(['Quase', 'Não'] as const),
      treino: rand() > 0.75,
      humor: 'Regular',
      alimentacao: pick(['Regular', 'Ruim'] as const),
      energia: pick([2, 3] as const),
    }
  }
  return {
    sono: 'Ruim',
    agua: 'Não',
    treino: false,
    humor: 'Ruim',
    alimentacao: 'Ruim',
    energia: pick([1, 2] as const),
  }
}

/** Histórico dos últimos ~90 dias, com tendência de melhora e algumas falhas. */
function seedCheckins() {
  for (let offset = HISTORY_DAYS; offset >= 1; offset--) {
    // Dias mais recentes têm presença garantida; antes disso, ~15% de falhas.
    const skipped = offset > GUARANTEED_STREAK && rand() < 0.15
    if (skipped) continue

    // Evolução: começa perto de 55 e sobe até ~82, com ruído.
    const progress = (HISTORY_DAYS - offset) / HISTORY_DAYS
    const base = 55 + progress * 27
    const noise = (rand() - 0.5) * 22
    const score = Math.round(clamp(base + noise, 32, 98))

    const answers = answersForScore(score)
    const date = daysAgo(offset)

    db.checkins.push({
      id: nextId('chk'),
      date: isoDate(date),
      ...answers,
      scoreDia: score,
      xpGanho: xpFor(score, answers.treino),
      createdAt: new Date(date.getTime() + 8 * 3600_000).toISOString(),
    })
  }
}

const MEMBER_NAMES = [
  'Ana Beatriz Lima',
  'Rafael Nogueira',
  'Camila Duarte',
  'Pedro Henrique Alves',
  'Juliana Marques',
  'Thiago Ribeiro',
  'Marina Castro',
  'Lucas Ferreira',
  'Beatriz Antunes',
  'Diego Sampaio',
  'Larissa Moreira',
]

function seedOrganization() {
  const org: MockOrg = {
    id: 'org_0001',
    name: 'Equipe Vitalis',
    code: 'VITA26',
    tipo: 'empresa',
    ownerId: db.user.id,
    createdAt: `${isoDate(daysAgo(HISTORY_DAYS))}T14:00:00.000Z`,
    members: [
      {
        id: 'mem_0001',
        userId: db.user.id,
        name: db.user.name,
        role: 'owner',
        joinedAt: `${isoDate(daysAgo(HISTORY_DAYS))}T14:00:00.000Z`,
        total: 0, // recalculado a partir dos check-ins reais do usuário
        dias: 0,
      },
      ...MEMBER_NAMES.map((name, index) => {
        const dias = Math.round(18 + rand() * 12)
        const media = 48 + rand() * 40
        return {
          id: `mem_${String(index + 2).padStart(4, '0')}`,
          userId: `usr_${String(index + 2).padStart(4, '0')}`,
          name,
          role: (index === 0 ? 'admin' : 'member') as 'admin' | 'member',
          joinedAt: `${isoDate(daysAgo(HISTORY_DAYS - 3 - index))}T10:30:00.000Z`,
          total: Math.round(media * dias),
          dias,
        }
      }),
    ],
  }
  db.orgs.set(org.id, org)

  // Segunda organização: o usuário participa como membro comum.
  // Existe para a listagem de "minhas organizações" ter mais de um item.
  const gym: MockOrg = {
    id: 'org_0002',
    name: 'Studio Movimento',
    code: 'MOVE26',
    tipo: 'academia',
    ownerId: 'usr_0003',
    createdAt: `${isoDate(daysAgo(52))}T08:30:00.000Z`,
    members: [
      {
        id: 'mem_0101',
        userId: 'usr_0003',
        name: 'Rafael Nogueira',
        role: 'owner',
        joinedAt: `${isoDate(daysAgo(52))}T08:30:00.000Z`,
        total: Math.round(74 * 26),
        dias: 26,
      },
      {
        id: 'mem_0102',
        userId: db.user.id,
        name: db.user.name,
        role: 'member',
        joinedAt: `${isoDate(daysAgo(40))}T19:15:00.000Z`,
        total: 0,
        dias: 0,
      },
      ...MEMBER_NAMES.slice(4, 9).map((name, index) => {
        const dias = Math.round(14 + rand() * 14)
        const media = 52 + rand() * 34
        return {
          id: `mem_${String(index + 110).padStart(4, '0')}`,
          userId: `usr_${String(index + 20).padStart(4, '0')}`,
          name,
          role: 'member' as const,
          joinedAt: `${isoDate(daysAgo(38 - index))}T11:00:00.000Z`,
          total: Math.round(media * dias),
          dias,
        }
      }),
    ],
  }
  db.orgs.set(gym.id, gym)
}

seedCheckins()
seedOrganization()

// ---------------------------------------------------------------------------
// Projeções derivadas do estado (o que a API calcularia no servidor)
// ---------------------------------------------------------------------------

const sortedCheckins = () =>
  [...db.checkins].sort((a, b) => a.date.localeCompare(b.date))

const checkinOn = (date: string) => db.checkins.find((c) => c.date === date) ?? null

const xpTotal = () => db.checkins.reduce((sum, c) => sum + c.xpGanho, 0)

/** Streak atual: dias consecutivos até hoje (ou até ontem, se hoje ainda não fez). */
function currentStreak(): number {
  const done = new Set(db.checkins.map((c) => c.date))
  let streak = 0
  let offset = done.has(today()) ? 0 : 1
  while (done.has(isoDate(daysAgo(offset)))) {
    streak++
    offset++
  }
  return streak
}

function recordStreak(): number {
  const dates = sortedCheckins().map((c) => c.date)
  let best = 0
  let run = 0
  let previous: string | null = null
  for (const date of dates) {
    const isNextDay =
      previous !== null &&
      new Date(`${date}T12:00:00`).getTime() -
        new Date(`${previous}T12:00:00`).getTime() ===
        86400_000
    run = isNextDay ? run + 1 : 1
    best = Math.max(best, run)
    previous = date
  }
  return Math.max(best, currentStreak())
}

/** Atributos do avatar a partir da média dos últimos 14 check-ins. */
function avatarAttributes(upTo: MockCheckin[] = sortedCheckins()) {
  const recent = upTo.slice(-14)
  if (recent.length === 0) return { energia: 20, forca: 20, vitalidade: 20 }

  const avg = (fn: (c: MockCheckin) => number) =>
    recent.reduce((sum, c) => sum + fn(c), 0) / recent.length

  const sonoPoints = { Excelente: 100, Boa: 78, Regular: 45, Ruim: 15 }
  const aguaPoints = { 'Meta atingida': 100, Quase: 62, 'Não': 20 }
  const comidaPoints = { Excelente: 100, Boa: 76, Regular: 46, Ruim: 16 }

  return {
    energia: Math.round(
      clamp(avg((c) => sonoPoints[c.sono] * 0.6 + (c.energia ?? 3) * 8), 0, 100),
    ),
    forca: Math.round(clamp(avg((c) => (c.treino ? 92 : 34)), 0, 100)),
    vitalidade: Math.round(
      clamp(avg((c) => aguaPoints[c.agua] * 0.5 + comidaPoints[c.alimentacao] * 0.5), 0, 100),
    ),
  }
}

function avatarState() {
  const xp = xpTotal()
  return { id: 'avt_0001', level: levelFromXp(xp), xp, ...avatarAttributes() }
}

/** Média dos check-ins dentro de uma janela de N dias a partir de hoje. */
function averageOverDays(days: number, endOffset = 0): number {
  const from = isoDate(daysAgo(endOffset + days - 1))
  const to = isoDate(daysAgo(endOffset))
  const window = db.checkins.filter((c) => c.date >= from && c.date <= to)
  if (window.length === 0) return 0
  return Math.round(window.reduce((sum, c) => sum + c.scoreDia, 0) / window.length)
}

function inRange(date: string, from?: string, to?: string): boolean {
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

// ---------------------------------------------------------------------------
// Roteador
// ---------------------------------------------------------------------------

interface Ctx {
  params: Record<string, string>
  query: URLSearchParams
  body: Record<string, unknown>
}

/** `undefined` → 204 No Content. */
type Handler = (ctx: Ctx) => unknown

class HttpFailure extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message)
  }
}

const routes: { method: string; pattern: string; handler: Handler }[] = []

const route = (method: string, pattern: string, handler: Handler) =>
  routes.push({ method, pattern, handler })

/**
 * Casa o path com um padrão tipo `/organizations/:id/members/:userId`.
 * Retorna os params ou null. A escolha entre rotas concorrentes
 * (`/checkins/today` vs `/checkins/:id`) é feita por especificidade em `match`.
 */
function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null

  const params: Record<string, string> = {}
  for (let i = 0; i < patternParts.length; i++) {
    const expected = patternParts[i]!
    const actual = pathParts[i]!
    if (expected.startsWith(':')) params[expected.slice(1)] = decodeURIComponent(actual)
    else if (expected !== actual) return null
  }
  return params
}

/** Rota vencedora = a que casa com menos segmentos dinâmicos (mais literal). */
function match(method: string, path: string) {
  let best: { handler: Handler; params: Record<string, string>; score: number } | null =
    null

  for (const candidate of routes) {
    if (candidate.method !== method) continue
    const params = matchPattern(candidate.pattern, path)
    if (!params) continue
    const score = Object.keys(params).length
    if (!best || score < best.score) best = { handler: candidate.handler, params, score }
  }
  return best
}

// ---------------------------------------------------------------------------
// Rotas: autenticação
// ---------------------------------------------------------------------------

const tokens = (label: string) => ({
  access_token: `mock.${label}.${Date.now().toString(36)}`,
  refresh_token: `mock.refresh.${Date.now().toString(36)}`,
  expires_in: 3600,
})

route('POST', '/auth/login', ({ body }) => {
  const email = String(body.email ?? '').trim()
  const password = String(body.password ?? '')
  // No mock qualquer senha com 6+ caracteres entra — só o formato é validado.
  if (!email || password.length < 6) {
    throw new HttpFailure(401, 'E-mail ou senha inválidos', 'INVALID_CREDENTIALS')
  }
  db.user.email = email
  return tokens('access')
})

route('POST', '/auth/register', ({ body }) => {
  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  if (!name || !email) throw new HttpFailure(422, 'Dados de cadastro incompletos')
  db.user.name = name
  db.user.email = email
  return tokens('access')
})

route('POST', '/auth/refresh', ({ body }) => {
  if (!body.refresh_token) throw new HttpFailure(401, 'Refresh token ausente')
  return tokens('renewed')
})

route('POST', '/auth/logout', () => undefined)

// ---------------------------------------------------------------------------
// Rotas: usuário
// ---------------------------------------------------------------------------

route('GET', '/users/me', () => ({
  id: db.user.id,
  name: db.user.name,
  email: db.user.email,
  xp_total: xpTotal(),
  streak_atual: currentStreak(),
  streak_recorde: recordStreak(),
  created_at: db.user.createdAt,
}))

route('GET', '/users/me/stats', () => ({
  xp_total: xpTotal(),
  streak_atual: currentStreak(),
  streak_recorde: recordStreak(),
  avatar_level: levelFromXp(xpTotal()),
}))

// ---------------------------------------------------------------------------
// Rotas: avatar
// ---------------------------------------------------------------------------

route('GET', '/avatar', () => {
  const avatar = avatarState()
  return {
    id: avatar.id,
    nivel: avatar.level,
    xp: avatar.xp,
    energia: avatar.energia,
    'força': avatar.forca,
    vitalidade: avatar.vitalidade,
  }
})

route('GET', '/avatar/history', ({ query }) => {
  const from = query.get('from') ?? undefined
  const to = query.get('to') ?? undefined
  const ordered = sortedCheckins()

  // Snapshot do avatar ao fim de cada dia com check-in (XP acumulado até ali).
  let accumulated = 0
  const entries = ordered.map((checkin, index) => {
    accumulated += checkin.xpGanho
    const attributes = avatarAttributes(ordered.slice(0, index + 1))
    return {
      date: checkin.date,
      nivel: levelFromXp(accumulated),
      xp: accumulated,
      energia: attributes.energia,
      'força': attributes.forca,
      vitalidade: attributes.vitalidade,
    }
  })

  return { data: entries.filter((e) => inRange(e.date, from, to)) }
})

// ---------------------------------------------------------------------------
// Rotas: check-ins
// ---------------------------------------------------------------------------

/** Serializa em snake_case, como o back-end faria. */
function checkinPayload(checkin: MockCheckin) {
  return {
    id: checkin.id,
    date: checkin.date,
    sono: checkin.sono,
    agua: checkin.agua,
    treino: checkin.treino,
    humor: checkin.humor,
    alimentacao: checkin.alimentacao,
    energia: checkin.energia ?? null,
    score_dia: checkin.scoreDia,
    xp_ganho: checkin.xpGanho,
    created_at: checkin.createdAt,
  }
}

route('POST', '/checkins', ({ body }) => {
  if (checkinOn(today())) {
    throw new HttpFailure(409, 'Você já fez o check-in de hoje', 'CHECKIN_ALREADY_DONE')
  }

  const answers = body as unknown as CheckinAnswers
  const score = estimateScore(answers)
  const checkin: MockCheckin = {
    id: nextId('chk'),
    date: today(),
    sono: answers.sono,
    agua: answers.agua,
    treino: !!answers.treino,
    humor: answers.humor,
    alimentacao: answers.alimentacao,
    energia: answers.energia,
    scoreDia: score,
    xpGanho: xpFor(score, !!answers.treino),
    createdAt: new Date().toISOString(),
  }
  db.checkins.push(checkin)
  return checkinPayload(checkin)
})

// 404 aqui é o contrato: o repositório converte em `null` (ainda não fez hoje).
route('GET', '/checkins/today', () => {
  const checkin = checkinOn(today())
  if (!checkin) throw new HttpFailure(404, 'Nenhum check-in hoje', 'CHECKIN_NOT_FOUND')
  return checkinPayload(checkin)
})

route('GET', '/checkins', ({ query }) => {
  const from = query.get('from') ?? undefined
  const to = query.get('to') ?? undefined
  const page = Number(query.get('page') ?? 1) || 1
  const limit = Number(query.get('limit') ?? 20) || 20

  // Mais recentes primeiro, como uma listagem de histórico.
  const filtered = sortedCheckins()
    .reverse()
    .filter((c) => inRange(c.date, from, to))

  const start = (page - 1) * limit
  return {
    data: filtered.slice(start, start + limit).map(checkinPayload),
    meta: { page, limit, total: filtered.length },
  }
})

route('GET', '/checkins/:id', ({ params }) => {
  const checkin = db.checkins.find((c) => c.id === params.id)
  if (!checkin) throw new HttpFailure(404, 'Check-in não encontrado')
  return checkinPayload(checkin)
})

route('PATCH', '/checkins/:id', ({ params, body }) => {
  const checkin = db.checkins.find((c) => c.id === params.id)
  if (!checkin) throw new HttpFailure(404, 'Check-in não encontrado')

  const elapsedHours = (Date.now() - new Date(checkin.createdAt).getTime()) / 36e5
  if (elapsedHours > 24) {
    throw new HttpFailure(422, 'A janela de edição de 24h expirou', 'EDIT_WINDOW_CLOSED')
  }

  Object.assign(checkin, body as Partial<CheckinAnswers>)
  checkin.scoreDia = estimateScore(checkin)
  checkin.xpGanho = xpFor(checkin.scoreDia, checkin.treino)
  return checkinPayload(checkin)
})

// ---------------------------------------------------------------------------
// Rotas: score e feedback
// ---------------------------------------------------------------------------

route('GET', '/score/daily', () => {
  const checkin = checkinOn(today())
  return { score: checkin?.scoreDia ?? 0, date: today() }
})

route('GET', '/score/weekly', () => {
  const current = averageOverDays(7)
  const previous = averageOverDays(7, 7)
  return { media: current, variacao: previous ? current - previous : null }
})

route('GET', '/score/history', ({ query }) => {
  const from = query.get('from') ?? undefined
  const to = query.get('to') ?? undefined
  return {
    data: sortedCheckins()
      .filter((c) => inRange(c.date, from, to))
      .map((c) => ({ date: c.date, score: c.scoreDia })),
  }
})

route('GET', '/feedback/weekly', () => {
  const week = db.checkins.filter((c) => c.date >= isoDate(daysAgo(6)))
  const media = averageOverDays(7)
  const treinos = week.filter((c) => c.treino).length
  const hidratado = week.filter((c) => c.agua === 'Meta atingida').length
  const sonoRuim = week.filter((c) => c.sono === 'Ruim' || c.sono === 'Regular').length

  const destaques: string[] = []
  if (treinos >= 3) destaques.push(`${treinos} treinos registrados nos últimos 7 dias`)
  if (hidratado >= 4) destaques.push(`Meta de água batida em ${hidratado} dias`)
  if (currentStreak() >= 5) destaques.push(`Sequência ativa de ${currentStreak()} dias`)
  if (destaques.length === 0) destaques.push('Você manteve o hábito de registrar o dia')

  const pontos: string[] = []
  if (sonoRuim >= 3) pontos.push(`Sono irregular em ${sonoRuim} dias — tente um horário fixo`)
  if (treinos < 3) pontos.push('Menos de 3 treinos na semana; que tal caminhadas curtas?')
  if (hidratado < 4) pontos.push('Hidratação abaixo da meta na maior parte da semana')
  if (pontos.length === 0) pontos.push('Nada crítico por aqui: siga nesse ritmo')

  return {
    resumo:
      media >= 75
        ? 'Semana muito consistente. Seu avatar evoluiu junto com seus hábitos — continue assim.'
        : media >= 55
          ? 'Semana equilibrada, com espaço para ganhar constância em sono e treino.'
          : 'Semana difícil, e tudo bem. Escolha um único hábito para retomar nos próximos dias.',
    score_medio: media,
    dias_treinados: treinos,
    destaques,
    pontos_de_atencao: pontos,
  }
})

// ---------------------------------------------------------------------------
// Rotas: gamificação
// ---------------------------------------------------------------------------

const BADGE_CATALOG = [
  { id: 'bdg_01', nome: 'Primeiro Passo', descricao: 'Você registrou seu primeiro check-in.', criterio: '1 check-in' },
  { id: 'bdg_02', nome: 'Semana Cheia', descricao: '7 dias seguidos de registro.', criterio: 'Streak de 7 dias' },
  { id: 'bdg_03', nome: 'Hidratado', descricao: 'Meta de água batida 10 vezes.', criterio: '10 dias com meta de água' },
  { id: 'bdg_04', nome: 'Sono de Ouro', descricao: 'Sono excelente por 5 dias.', criterio: '5 dias com sono excelente' },
  { id: 'bdg_05', nome: 'Em Movimento', descricao: '15 treinos registrados.', criterio: '15 treinos' },
  { id: 'bdg_06', nome: 'Mês Completo', descricao: '30 dias seguidos de check-in.', criterio: 'Streak de 30 dias' },
  { id: 'bdg_07', nome: 'Equilíbrio', descricao: 'Score acima de 80 por uma semana.', criterio: 'Média semanal ≥ 80' },
  { id: 'bdg_08', nome: 'Time Unido', descricao: 'Entrou em uma organização.', criterio: 'Participar de uma organização' },
  { id: 'bdg_09', nome: 'Evolução', descricao: 'Avatar alcançou o nível 3.', criterio: 'Avatar nível 3' },
  { id: 'bdg_10', nome: 'Imparável', descricao: 'Avatar alcançou o nível 5.', criterio: 'Avatar nível 5' },
  { id: 'bdg_11', nome: 'Nutrição Nota 10', descricao: 'Alimentação excelente por 10 dias.', criterio: '10 dias de alimentação excelente' },
  { id: 'bdg_12', nome: 'Bom Humor', descricao: 'Humor muito bom por 7 dias.', criterio: '7 dias de humor muito bom' },
]

/** Medalhas conquistadas são derivadas do estado real — ficam coerentes com a demo. */
function earnedBadgeIds(): Map<string, string> {
  const earned = new Map<string, string>()
  const ordered = sortedCheckins()
  const stamp = (offset: number) => `${isoDate(daysAgo(offset))}T20:00:00.000Z`

  if (ordered.length >= 1) earned.set('bdg_01', `${ordered[0]!.date}T20:00:00.000Z`)
  if (recordStreak() >= 7) earned.set('bdg_02', stamp(46))
  if (db.checkins.filter((c) => c.agua === 'Meta atingida').length >= 10)
    earned.set('bdg_03', stamp(38))
  if (db.checkins.filter((c) => c.sono === 'Excelente').length >= 5)
    earned.set('bdg_04', stamp(31))
  if (db.checkins.filter((c) => c.treino).length >= 15) earned.set('bdg_05', stamp(24))
  if (recordStreak() >= 30) earned.set('bdg_06', stamp(17))
  if (averageOverDays(7) >= 80) earned.set('bdg_07', stamp(2))
  if (db.orgs.size > 0) earned.set('bdg_08', stamp(60))
  if (levelFromXp(xpTotal()) >= 3) earned.set('bdg_09', stamp(12))
  if (levelFromXp(xpTotal()) >= 5) earned.set('bdg_10', stamp(1))
  if (db.checkins.filter((c) => c.alimentacao === 'Excelente').length >= 10)
    earned.set('bdg_11', stamp(9))
  if (db.checkins.filter((c) => c.humor === 'Muito bom').length >= 7)
    earned.set('bdg_12', stamp(5))

  return earned
}

route('GET', '/badges', () => ({ data: BADGE_CATALOG }))

route('GET', '/badges/me', () => {
  const earned = earnedBadgeIds()
  return {
    data: BADGE_CATALOG.filter((b) => earned.has(b.id)).map((badge) => ({
      badge,
      earned_at: earned.get(badge.id),
    })),
  }
})

// ---------------------------------------------------------------------------
// Rotas: organizações
// ---------------------------------------------------------------------------

function orgPayload(org: MockOrg) {
  return {
    id: org.id,
    nome: org.name,
    codigo: org.code,
    tipo: org.tipo,
    owner_id: org.ownerId,
    created_at: org.createdAt,
  }
}

/**
 * Numa demo é melhor não deixar o usuário preso num 404 por causa de um id
 * antigo guardado no `currentOrgStore` — cai na organização semente.
 */
function requireOrg(id: string): MockOrg {
  return db.orgs.get(id) ?? db.orgs.get('org_0001')!
}

route('POST', '/organizations', ({ body }) => {
  const org: MockOrg = {
    id: nextId('org'),
    name: String(body.name ?? 'Nova organização'),
    code: `MOCK${String(db.orgs.size + 1).padStart(2, '0')}`,
    tipo: String(body.tipo ?? 'empresa'),
    ownerId: db.user.id,
    createdAt: new Date().toISOString(),
    members: [
      {
        id: nextId('mem'),
        userId: db.user.id,
        name: db.user.name,
        role: 'owner',
        joinedAt: new Date().toISOString(),
        total: 0,
        dias: 0,
      },
    ],
  }
  db.orgs.set(org.id, org)
  return { organization: orgPayload(org) }
})

route('POST', '/organizations/join', ({ body }) => {
  const code = String(body.code ?? '').trim().toUpperCase()
  if (code.length < 4) throw new HttpFailure(422, 'Código de convite inválido')

  const found = [...db.orgs.values()].find((o) => o.code === code)
  // Qualquer código válido entra na organização semente — facilita a demo.
  const org = found ?? db.orgs.get('org_0001')!

  if (!org.members.some((m) => m.userId === db.user.id)) {
    org.members.push({
      id: nextId('mem'),
      userId: db.user.id,
      name: db.user.name,
      role: 'member',
      joinedAt: new Date().toISOString(),
      total: 0,
      dias: 0,
    })
  }
  return { organization: orgPayload(org) }
})

/**
 * Organizações das quais o usuário participa. Rota literal, então vence
 * `/organizations/:id` no matcher (menos segmentos dinâmicos).
 */
route('GET', '/organizations/me', () => ({
  data: [...db.orgs.values()]
    .filter((org) => org.members.some((m) => m.userId === db.user.id))
    .map(orgPayload),
}))

route('GET', '/organizations/:id', ({ params }) => orgPayload(requireOrg(params.id!)))

route('PATCH', '/organizations/:id', ({ params, body }) => {
  const org = requireOrg(params.id!)
  if (typeof body.name === 'string') org.name = body.name
  if (typeof body.tipo === 'string') org.tipo = body.tipo
  return { organization: orgPayload(org) }
})

route('POST', '/organizations/:id/leave', ({ params }) => {
  const org = requireOrg(params.id!)
  org.members = org.members.filter((m) => m.userId !== db.user.id)
  return undefined
})

route('GET', '/organizations/:id/members', ({ params }) => ({
  members: requireOrg(params.id!).members.map((member) => ({
    id: member.id,
    user_id: member.userId,
    nome: member.name,
    papel: member.role,
    joined_at: member.joinedAt,
  })),
}))

route('DELETE', '/organizations/:id/members/:userId', ({ params }) => {
  const org = requireOrg(params.id!)
  const target = org.members.find((m) => m.userId === params.userId)
  if (!target) throw new HttpFailure(404, 'Membro não encontrado')
  if (target.role === 'owner') throw new HttpFailure(403, 'O dono não pode ser removido')
  org.members = org.members.filter((m) => m.userId !== params.userId)
  return undefined
})

route('GET', '/organizations/:id/ranking', ({ params, query }) => {
  const org = requireOrg(params.id!)
  const orderBy = query.get('orderBy') === 'media' ? 'media' : 'total'
  const from = query.get('from') ?? undefined
  const to = query.get('to') ?? undefined

  const entries = org.members.map((member) => {
    // O usuário logado entra no ranking com os check-ins reais do período.
    if (member.userId === db.user.id) {
      const own = db.checkins.filter((c) => inRange(c.date, from, to))
      const total = own.reduce((sum, c) => sum + c.scoreDia, 0)
      return {
        user_id: member.userId,
        nome: member.name,
        total,
        media: own.length ? Math.round(total / own.length) : 0,
      }
    }
    return {
      user_id: member.userId,
      nome: member.name,
      total: member.total,
      media: member.dias ? Math.round(member.total / member.dias) : 0,
    }
  })

  entries.sort((a, b) => b[orderBy] - a[orderBy])
  return { ranking: entries }
})

// ---------------------------------------------------------------------------
// Interceptador de fetch
// ---------------------------------------------------------------------------

function jsonResponse(data: unknown, status: number): Response {
  if (status === 204 || data === undefined) {
    return new Response(null, { status: 204 })
  }
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function parseBody(init?: RequestInit): Record<string, unknown> {
  if (typeof init?.body !== 'string') return {}
  try {
    const parsed: unknown = JSON.parse(init.body)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()
  return input.url
}

/**
 * Instala o mock. Chame uma única vez, o mais cedo possível (antes de o React
 * montar), para que nenhuma requisição escape para a rede.
 */
export function installMockApi(): void {
  if (!isMockEnabled) return

  const originalFetch = globalThis.fetch.bind(globalThis)
  const base = env.apiBaseUrl

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = resolveUrl(input)

    // Só intercepta a API do app; qualquer outra coisa segue para a rede real.
    if (!url.startsWith(base)) return originalFetch(input, init)

    const parsed = new URL(url)
    const method = (
      init?.method ??
      (input instanceof Request ? input.method : 'GET')
    ).toUpperCase()

    await delay()

    const found = match(method, parsed.pathname)
    if (!found) {
      console.warn(`[mock] rota não implementada: ${method} ${parsed.pathname}`)
      return jsonResponse({ message: 'Rota não encontrada no mock' }, 404)
    }

    try {
      const data = found.handler({
        params: found.params,
        query: parsed.searchParams,
        body: parseBody(init),
      })
      return jsonResponse(data, data === undefined ? 204 : 200)
    } catch (error) {
      if (error instanceof HttpFailure) {
        return jsonResponse({ message: error.message, code: error.code }, error.status)
      }
      console.error('[mock] erro inesperado no handler', error)
      return jsonResponse({ message: 'Erro interno do mock' }, 500)
    }
  }

  console.info(
    `[mock] API simulada ativa em ${base} — ${db.checkins.length} check-ins, ` +
      `${xpTotal()} XP, nível ${levelFromXp(xpTotal())}, streak ${currentStreak()}d`,
  )
}
