import { useState } from 'react'
import { useCreateHill } from '@/hooks/useHills'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface AddHillSheetProps {
  mountainId: string
  onClose: () => void
}

export function AddHillSheet({ mountainId, onClose }: AddHillSheetProps) {
  const [name, setName] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [targetMetric, setTargetMetric] = useState('')
  const [prepWindowDays, setPrepWindowDays] = useState('42')
  const create = useCreateHill()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !targetDate) return
    await create.mutateAsync({
      mountainId,
      name: name.trim(),
      targetDate: new Date(targetDate).toISOString(),
      targetMetric: targetMetric.trim() || undefined,
      prepWindowDays: parseInt(prepWindowDays) || 42,
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
        <h2 className="text-lg font-semibold text-stone-900 mb-1">Add a hill</h2>
        <p className="text-sm text-stone-500 mb-5">A concrete, time-bound summit to aim for.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            placeholder="Berlin Marathon 2025"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Input
            label="Target date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          <Input
            label="Target metric (optional)"
            placeholder="Sub 3:00 · 83kg · Roof finished"
            value={targetMetric}
            onChange={(e) => setTargetMetric(e.target.value)}
          />

          <Input
            label="Preparation window (days)"
            type="number"
            min="1"
            max="365"
            value={prepWindowDays}
            onChange={(e) => setPrepWindowDays(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={create.isPending}
              disabled={!name.trim() || !targetDate}
              className="flex-1"
            >
              Add hill
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
