/** Medalhas e troféus (domínio puro). */

export interface Badge {
  id: string
  name: string
  description: string
  criterio: string
}

export interface EarnedBadge extends Badge {
  earnedAt: string | null
}

export interface Trophy {
  id: string
  name: string
  description: string
  earnedAt: string | null
}

/** Catálogo cruzado com o que o usuário já conquistou. */
export interface BadgeProgress extends Badge {
  earned: boolean
  earnedAt: string | null
}

export function mergeBadgeProgress(
  catalog: Badge[],
  earned: EarnedBadge[],
): BadgeProgress[] {
  const earnedById = new Map(earned.map((badge) => [badge.id, badge]))
  return catalog.map((badge) => {
    const match = earnedById.get(badge.id)
    return {
      ...badge,
      earned: !!match,
      earnedAt: match?.earnedAt ?? null,
    }
  })
}
