import { useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { StepType, StepStatus, StepSource } from '@wm/types'
import { useLogStep, useProposeSteps } from '@/hooks/useSteps'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ActionRow, type ActionDraft } from './ActionRow'
import type { ProposedStep } from '@wm/types'

function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function makeDraft(partial?: Partial<ActionDraft>): ActionDraft {
  return {
    tempId: Math.random().toString(36).slice(2),
    actionName: '',
    ...partial,
  }
}

interface PlanStepSheetProps {
  onClose: () => void
  pathId: string
  suggestedStep?: ProposedStep
}

export function PlanStepSheet({ onClose, pathId, suggestedStep }: PlanStepSheetProps) {
  const [name, setName] = useState(suggestedStep?.name ?? '')
  const [scheduledFor, setScheduledFor] = useState(
    suggestedStep?.scheduledFor?.split('T')[0] ?? tomorrow()
  )
  const [actions, setActions] = useState<ActionDraft[]>(
    suggestedStep?.actions.map((a) => makeDraft(a)) ?? []
  )
  const [proposeContext, setProposeContext] = useState('')
  const [showProposeInput, setShowProposeInput] = useState(false)

  const logStep = useLogStep()
  const propose = useProposeSteps()

  function addAction() {
    setActions((prev) => [...prev, makeDraft()])
  }

  function updateAction(tempId: string, updated: ActionDraft) {
    setActions((prev) => prev.map((a) => (a.tempId === tempId ? updated : a)))
  }

  function deleteAction(tempId: string) {
    setActions((prev) => prev.filter((a) => a.tempId !== tempId))
  }

  async function handlePropose() {
    const result = await propose.mutateAsync({
      pathId,
      count: 1,
      context: proposeContext || undefined,
    })
    if (result.steps[0]) {
      const s = result.steps[0]
      setName(s.name)
      setScheduledFor(s.scheduledFor.split('T')[0])
      setActions(s.actions.map((a) => makeDraft(a)))
      setShowProposeInput(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    await logStep.mutateAsync({
      pathId,
      name: name.trim(),
      type: StepType.PATH,
      status: StepStatus.PLANNED,
      source: StepSource.MANUAL,
      scheduledFor: new Date(scheduledFor).toISOString(),
      actions: actions.filter((a) => a.actionName.trim()).map(({ tempId: _tempId, ...a }) => a),
    })
    onClose()
  }

  const canSubmit = name.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
      <div
        className="relative bg-stone-50 rounded-t-3xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4">
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-6" />
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Plan a step</h2>
          <p className="text-sm text-stone-500">Schedule a session for the coming days.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 space-y-4 overflow-y-auto flex-1">
            <Input
              placeholder="Session name (e.g. Full body workout)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <div>
              <label className="text-xs text-stone-500 font-medium uppercase tracking-wider block mb-1.5">
                Scheduled for
              </label>
              <input
                type="date"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Actions</p>
                {actions.map((action) => (
                  <ActionRow
                    key={action.tempId}
                    mode="plan"
                    action={action}
                    onChange={(updated) => updateAction(action.tempId, updated)}
                    onDelete={() => deleteAction(action.tempId)}
                  />
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={addAction}
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded-xl px-3 py-2 bg-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add action
              </button>

              {!showProposeInput ? (
                <button
                  type="button"
                  onClick={() => setShowProposeInput(true)}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 border border-stone-200 rounded-xl px-3 py-2 bg-white transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Ask Claude
                </button>
              ) : (
                <div className="flex flex-1 gap-2">
                  <input
                    type="text"
                    placeholder="Any context? (optional)"
                    value={proposeContext}
                    onChange={(e) => setProposeContext(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-stone-200 rounded-xl bg-white outline-none focus:border-stone-400"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    loading={propose.isPending}
                    onClick={handlePropose}
                    className="text-xs px-3 py-2"
                  >
                    Propose
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 p-6 pt-4 border-t border-stone-100">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={logStep.isPending} disabled={!canSubmit} className="flex-1">
              Plan it
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
