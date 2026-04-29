import { useState } from 'react'
import { Domain, Presence } from '@wm/types'
import { useCreateMountain } from '@/hooks/useMountains'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { DOMAIN_LABELS, DOMAIN_COLORS, PRESENCE_ICONS, PRESENCE_LABELS } from '@/lib/domain'
import { clsx } from 'clsx'

interface AddMountainSheetProps {
  onClose: () => void
}

export function AddMountainSheet({ onClose }: AddMountainSheetProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [domain, setDomain] = useState<Domain>(Domain.BODY)
  const [presence, setPresence] = useState<Presence>(Presence.WALKING)

  const create = useCreateMountain()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await create.mutateAsync({ name: name.trim(), description: description.trim() || undefined, domain, presence })
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
        <h2 className="text-lg font-semibold text-stone-900 mb-5">New mountain</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Name"
            placeholder="Maintain running speed as I age"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Textarea
            label="Description"
            placeholder="What does this mountain mean to you?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          {/* Domain picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Domain</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(Domain).map((d) => {
                const colors = DOMAIN_COLORS[d]
                const active = domain === d
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDomain(d)}
                    className={clsx(
                      'py-2.5 rounded-xl border text-sm font-medium transition-all',
                      active ? [colors.bg, colors.border, colors.text] : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                    )}
                  >
                    {DOMAIN_LABELS[d]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Presence picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Where are you with this?</label>
            <div className="space-y-2">
              {Object.values(Presence).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPresence(p)}
                  className={clsx(
                    'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                    presence === p
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                  )}
                >
                  <span className="mr-2">{PRESENCE_ICONS[p]}</span>
                  <span className="font-medium">{PRESENCE_LABELS[p]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending} disabled={!name.trim()} className="flex-1">
              Add mountain
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
