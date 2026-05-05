import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react'
import { useMountain, useUpdateMountain } from '@/hooks/useMountains'
import { DomainBadge } from '@/components/ui/DomainBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AddHillSheet } from '@/components/mountains/AddHillSheet'
import { AddPathSheet } from '@/components/mountains/AddPathSheet'
import { LogStepSheet } from '@/components/steps/LogStepSheet'
import { DOMAIN_COLORS, PRESENCE_ICONS, PRESENCE_LABELS, daysUntil, formatDate } from '@/lib/domain'
import type { Presence } from '@wm/types'
import { clsx } from 'clsx'

export function MountainPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: mountain, isLoading } = useMountain(id!)
  const update = useUpdateMountain(id!)

  const [showAddHill, setShowAddHill] = useState(false)
  const [showAddPath, setShowAddPath] = useState(false)
  const [showLogStep, setShowLogStep] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-stone-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-stone-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!mountain) return null

  const colors = DOMAIN_COLORS[mountain.domain]
  const upcomingHills = mountain.hills?.filter((h) => !h.summitedAt) ?? []
  const summitedHills = mountain.hills?.filter((h) => h.summitedAt) ?? []
  const activePaths = mountain.paths?.filter((p) => p.status === 'ACTIVE') ?? []
  const allHills = mountain.hills ?? []

  function setPresence(presence: Presence) {
    update.mutate({ presence })
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-4 -ml-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className={clsx('rounded-2xl p-5 border', colors.bg, colors.border)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-stone-900 leading-snug">{mountain.name}</h1>
              {mountain.description && (
                <p className="text-sm text-stone-500 mt-1">{mountain.description}</p>
              )}
            </div>
            <DomainBadge domain={mountain.domain} />
          </div>

          {/* Presence switcher */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {(['CLIMBING', 'WALKING', 'IN_SIGHT'] as Presence[]).map((p) => (
              <button
                key={p}
                onClick={() => setPresence(p)}
                title={PRESENCE_LABELS[p]}
                className={clsx(
                  'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                  mountain.presence === p
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white/60 text-stone-500 border-stone-200 hover:border-stone-300'
                )}
              >
                {PRESENCE_ICONS[p]} {PRESENCE_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active paths */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Active paths</h2>
          <button
            onClick={() => setShowAddPath(true)}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add path
          </button>
        </div>

        {activePaths.length === 0 ? (
          <p className="text-sm text-stone-400 py-2">
            No active paths.{' '}
            <button onClick={() => setShowAddPath(true)} className="underline underline-offset-2 hover:text-stone-600">
              Add one
            </button>
          </p>
        ) : (
          activePaths.map((path) => (
            <Card key={path.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-900">{path.name}</p>
                  {path.description && <p className="text-xs text-stone-500 mt-0.5">{path.description}</p>}
                </div>
                <span className="text-2xs text-stone-400 border border-stone-200 rounded-full px-2 py-0.5 shrink-0 ml-2">
                  {path.type === 'HILL_DIRECTED' ? 'Hill-directed' : 'Open'}
                </span>
              </div>
              <button
                onClick={() => setShowLogStep(true)}
                className="mt-3 w-full text-left text-xs text-stone-400 hover:text-stone-600 border-t border-stone-100 pt-3"
              >
                + Log a step on this path
              </button>
            </Card>
          ))
        )}
      </section>

      {/* Upcoming hills */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">On the horizon</h2>
          <button
            onClick={() => setShowAddHill(true)}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add hill
          </button>
        </div>

        {upcomingHills.length === 0 ? (
          <p className="text-sm text-stone-400 py-2">
            No hills set.{' '}
            <button onClick={() => setShowAddHill(true)} className="underline underline-offset-2 hover:text-stone-600">
              Add one
            </button>{' '}
            to make this mountain measurable.
          </p>
        ) : (
          upcomingHills.map((hill) => {
            const days = daysUntil(hill.targetDate)
            return (
              <Card key={hill.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{hill.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {formatDate(hill.targetDate)} · {days > 0 ? `${days} days out` : 'Today'}
                    </p>
                    {hill.targetMetric && (
                      <p className="text-xs text-stone-400 mt-0.5">Target: {hill.targetMetric}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-300 shrink-0" />
                </div>
              </Card>
            )
          })
        )}
      </section>

      {/* Summit history */}
      {summitedHills.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Summited</h2>
          {summitedHills.map((hill) => (
            <Card key={hill.id} className="p-4 opacity-70">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-700">{hill.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{formatDate(hill.targetDate)}</p>
                  {hill.result && <p className="text-xs text-stone-500 mt-1">{hill.result}</p>}
                </div>
                <span className="text-base">✓</span>
              </div>
            </Card>
          ))}
        </section>
      )}

      {/* Quick step log */}
      <div className="pt-2 border-t border-stone-100">
        <Button variant="secondary" className="w-full" onClick={() => setShowLogStep(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log a free step
        </Button>
      </div>

      {showAddHill && (
        <AddHillSheet mountainId={mountain.id} onClose={() => setShowAddHill(false)} />
      )}
      {showAddPath && (
        <AddPathSheet
          mountainId={mountain.id}
          hills={allHills}
          onClose={() => setShowAddPath(false)}
        />
      )}
      {showLogStep && <LogStepSheet onClose={() => setShowLogStep(false)} />}
    </div>
  )
}
