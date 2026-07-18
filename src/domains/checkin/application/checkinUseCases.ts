import type { CheckinAnswers, DailyCheckin } from '../domain/Checkin'
import { canEditCheckin } from '../domain/Checkin'
import { checkinRepository } from '../infrastructure/HttpCheckinRepository'

/**
 * Casos de uso do check-in diário.
 * Concentram a orquestração para que os componentes não decidam regra de negócio.
 */

export class CheckinAlreadyDoneError extends Error {
  constructor() {
    super('O check-in de hoje já foi registrado.')
    this.name = 'CheckinAlreadyDoneError'
  }
}

export class CheckinEditExpiredError extends Error {
  constructor() {
    super('A janela de edição deste check-in já expirou.')
    this.name = 'CheckinEditExpiredError'
  }
}

/** Registra o check-in do dia, barrando uma segunda tentativa no mesmo dia. */
export async function submitDailyCheckin(
  answers: CheckinAnswers,
): Promise<DailyCheckin> {
  const existing = await checkinRepository.today()
  if (existing) throw new CheckinAlreadyDoneError()
  return checkinRepository.create(answers)
}

/** Corrige um check-in existente, respeitando a janela de 24h. */
export async function editCheckin(
  checkin: DailyCheckin,
  answers: Partial<CheckinAnswers>,
): Promise<DailyCheckin> {
  if (!canEditCheckin(checkin)) throw new CheckinEditExpiredError()
  return checkinRepository.update(checkin.id, answers)
}
