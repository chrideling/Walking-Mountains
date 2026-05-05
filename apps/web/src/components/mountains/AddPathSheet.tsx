import { useState } from 'react'
import { PathType } from '@wm/types'
import type { Hill } from '@wm/types'
import { useCreatePath } from '@/hooks/usePaths'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { clsx } from 'clsx'

interface AddPathSheetProps {
  mountainId: string
  hills: Hill[]
  onClose: () => void
}

export function AddPathSheet({ mountainId, hills, onClose }: AddPathSheetProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<PathType>(PathType.OPEN)
  const [hillId, setHillId] = useState<string>('')
  const create = useCreatePath()

  const upcomingHills = hills.filter((h) => !h.summitedAt)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await create.mutateAsync({
      mountainId,
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      hillId: hillId || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
      <div
        className="relative bg-stone-50 rounded-t-3xl w-full max-w-2xl p-6 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-6" />
        <h2 className="text-lg font-semibold text-stone-900 mb-1">Add a path</h2>
        <p className="text-sm text-stone-500 mb-5">How you climb — a practice or a bounded plan.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            placeholder="22-week marathon training · Daily box breathing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Textarea
            label="Description (optional)"
            placeholder="What does this path involve?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          {/* Type picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: PathType.OPEN, label: 'Open', sub: 'Ongoing practice, no end date' },
                { value: PathType.HILL_DIRECTED, label: 'Hill-directed', sub: 'Ends when the hill is summited' },
              ].map(({ value, label, sub }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={clsx(
                    'text-left p-3 rounded-xl border transition-all',
                    type === value
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                  )}
                >
                  <p className="text-sm font-medium">{label}</p>
                  <p className={clsx('text-xs mt-0.5', type === value ? 'text-stone-300' : 'text-stone-400')}>{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Hill link — only shown for hill-directed paths that have hills to link */}
          {type === PathType.HILL_DIRECTED && upcomingHills.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Link to hill (optional)</label>
              <select
                value={hillId}
                onChange={(e) => setHillId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                <option value="">No hill linked</option>
                {upcomingHills.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={create.isPending}
              disabled={!name.trim()}
              className="flex-1"
            >
              Add path
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
