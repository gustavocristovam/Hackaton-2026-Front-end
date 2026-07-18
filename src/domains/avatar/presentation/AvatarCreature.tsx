import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import type { AvatarLevel } from '../domain/Avatar'

/**
 * Representação visual do avatar. A aparência muda com o nível:
 * postura, cor e aura ficam mais fortes conforme o usuário evolui.
 */

const LEVEL_STYLE: Record<
  AvatarLevel,
  { body: string; glow: string; aura: number; posture: number }
> = {
  1: { body: '#bbf7d0', glow: '#dcfce7', aura: 0, posture: 6 },
  2: { body: '#86efac', glow: '#bbf7d0', aura: 0.25, posture: 4 },
  3: { body: '#4ade80', glow: '#86efac', aura: 0.45, posture: 2 },
  4: { body: '#22c55e', glow: '#4ade80', aura: 0.7, posture: 0 },
  5: { body: '#16a34a', glow: '#22c55e', aura: 1, posture: -2 },
}

export function AvatarCreature({
  level,
  className,
}: {
  level: AvatarLevel
  className?: string
}) {
  const style = LEVEL_STYLE[level]

  return (
    <motion.svg
      viewBox="0 0 200 220"
      className={cn('size-56', className)}
      role="img"
      aria-label={`Avatar nível ${level}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 14 }}
    >
      {/* Aura — cresce com o nível */}
      {style.aura > 0 && (
        <motion.circle
          cx="100"
          cy="110"
          r="86"
          fill={style.glow}
          opacity={style.aura * 0.35}
          animate={{ r: [86, 92, 86], opacity: [style.aura * 0.3, style.aura * 0.15, style.aura * 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Sombra no chão */}
      <ellipse cx="100" cy="200" rx="42" ry="8" fill="#0f1f17" opacity="0.08" />

      {/* Corpo — respiração contínua */}
      <motion.g
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center' }}
      >
        {/* Pernas */}
        <rect x="82" y="150" width="14" height="42" rx="7" fill={style.body} />
        <rect x="104" y="150" width="14" height="42" rx="7" fill={style.body} />

        {/* Tronco — encolhe/endireita conforme postura */}
        <rect
          x={68 + style.posture / 2}
          y={92 + style.posture}
          width={64 - style.posture}
          height={66 - style.posture}
          rx="26"
          fill={style.body}
        />

        {/* Braços */}
        <rect x={54 + style.posture} y="100" width="14" height="46" rx="7" fill={style.body} />
        <rect x={132 - style.posture} y="100" width="14" height="46" rx="7" fill={style.body} />

        {/* Cabeça */}
        <circle cx="100" cy={62 + style.posture} r="32" fill={style.body} />

        {/* Olhos */}
        <circle cx="90" cy={58 + style.posture} r="4.5" fill="#0f1f17" />
        <circle cx="110" cy={58 + style.posture} r="4.5" fill="#0f1f17" />

        {/* Boca — sorriso cresce com o nível */}
        <path
          d={
            level >= 3
              ? `M88 ${72 + style.posture} q12 ${8 + level} 24 0`
              : `M90 ${73 + style.posture} q10 ${level === 1 ? -2 : 3} 20 0`
          }
          stroke="#0f1f17"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Coroa no nível máximo */}
        {level === 5 && (
          <motion.path
            d="M78 30 L86 14 L100 26 L114 14 L122 30 Z"
            fill="#f59e0b"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.g>
    </motion.svg>
  )
}
