import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Domain, Presence } from '@wm/types'
import { useMountains } from '@/hooks/useMountains'
import { MountainCard } from '@/components/mountains/MountainCard'
import { AddMountainSheet } from '@/components/mountains/AddMountainSheet'
import { Button } from '@/components/ui/Button'
import { DOMAIN_LABELS, PRESENCE_ICONS, PRESENCE_LABELS } from '@/lib/domain'

export function LandscapePage() {
  const { data: mountains, isLoading } = useMountains()
  const [showAdd, setShowAdd] = useState(false)

  const climbing = mountains?.filter((m) => m.presence === Presence.CLIMBING) ?? []
  const walking = mountains?.filter((m) => m.presence === Presence.WALKING) ?? []
  const inSight = mountains?.filter((m) => m.presence === Presence.IN_SIGHT) ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Your landscape</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {mountains?.length ?? 0} mountain{mountains?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && mountains?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-stone-400 text-sm mb-4">
            Your landscape is empty.
            <br />
            What mountains are on your horizon?
          </p>
          <Button onClick={() => setShowAdd(true)}>Add your first mountain</Button>
        </div>
      )}

      {climbing.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
            {PRESENCE_ICONS[Presence.CLIMBING]} {PRESENCE_LABELS[Presence.CLIMBING]}
          </h2>
          {climbing.map((m) => (
            <MountainCard key={m.id} mountain={m} />
          ))}
        </section>
      )}

      {walking.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
            {PRESENCE_ICONS[Presence.WALKING]} {PRESENCE_LABELS[Presence.WALKING]}
          </h2>
          {walking.map((m) => (
            <MountainCard key={m.id} mountain={m} />
          ))}
        </section>
      )}

      {inSight.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
            {PRESENCE_ICONS[Presence.IN_SIGHT]} {PRESENCE_LABELS[Presence.IN_SIGHT]}
          </h2>
          {inSight.map((m) => (
            <MountainCard key={m.id} mountain={m} />
          ))}
        </section>
      )}

      {/* Domain legend */}
      {mountains && mountains.length > 0 && (
        <div className="flex gap-3 pt-2 border-t border-stone-100">
          {Object.values(Domain).map((d) => {
            const count = mountains.filter((m) => m.domain === d).length
            if (count === 0) return null
            return (
              <span key={d} className="text-xs text-stone-400">
                {DOMAIN_LABELS[d]} {count}
              </span>
            )
          })}
        </div>
      )}

      {showAdd && <AddMountainSheet onClose={() => setShowAdd(false)} />}
    </div>
  )
}
