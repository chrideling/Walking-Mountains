import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Mountain } from '@wm/types'
import { Presence } from '@wm/types'
import { DOMAIN_COLORS, PRESENCE_ICONS, PRESENCE_LABELS } from '@/lib/domain'
import { DomainBadge } from '@/components/ui/DomainBadge'

interface MountainCardProps {
  mountain: Mountain
}

export function MountainCard({ mountain }: MountainCardProps) {
  const navigate = useNavigate()
  const colors = DOMAIN_COLORS[mountain.domain]

  const nextHill = mountain.hills
    ?.filter((h) => !h.summitedAt)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0]

  const activePaths = mountain.paths?.filter((p) => p.status === 'ACTIVE') ?? []

  return (
    <div
      onClick={() => navigate(`/mountain/${mountain.id}`)}
      className={clsx(
        'p-5 rounded-2xl border cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        colors.bg,
        colors.border,
        mountain.presence === Presence.IN_SIGHT && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-900 leading-snug">{mountain.name}</h3>
          {mountain.description && (
            <p className="text-sm text-stone-500 mt-0.5 line-clamp-1">{mountain.description}</p>
          )}
        </div>
        <span className="text-lg shrink-0" title={PRESENCE_LABELS[mountain.presence]}>
          {PRESENCE_ICONS[mountain.presence]}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <DomainBadge domain={mountain.domain} size="sm" />

        {nextHill && (
          <span className="text-2xs text-stone-500 bg-white/60 border border-stone-200 rounded-full px-2 py-0.5">
            {nextHill.name}
          </span>
        )}

        {activePaths.length > 0 && (
          <span className="text-2xs text-stone-400">
            {activePaths.length} active path{activePaths.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
