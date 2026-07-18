/**
 * Tokens de visualização de dados.
 * A paleta categórica foi validada (banda de luminosidade, croma, separação CVD
 * e contraste sobre superfície clara) — mantenha a ordem fixa, nunca cicle cores.
 */

/** Ordem fixa das séries categóricas. */
export const CATEGORICAL = ['#16a34a', '#2563eb', '#d97706'] as const

/** Série única (magnitude ao longo do tempo) usa o verde da marca. */
export const SERIES_PRIMARY = '#16a34a'

/** Eixos e grade recessivos — nunca competem com os dados. */
export const AXIS = {
  stroke: '#e3ede7',
  tick: { fill: '#5b6b62', fontSize: 12 },
}

export const GRID_STROKE = '#eef5f0'

/** Espessuras conforme spec: linha 2px, marcador >= 8px. */
export const LINE_WIDTH = 2
export const DOT_RADIUS = 4
