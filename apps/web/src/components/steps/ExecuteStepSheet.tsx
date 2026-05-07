import { useState } from 'react'
import { clsx } from 'clsx'
import { useCompleteStep, useCheckAction } from '@/hooks/useSteps'
import { Button } from '@/components/ui/Button'
import { ActionRow } from './ActionRow'
import type { Step, StepAction } from '@wm/types'

const EFFORT_LABELS = ['', 'Very light', 'Light', 'Moderate', 'Hard', 'Max effort']
const QUALITY_LABELS = ['', 'Poor', 'Okay', 'Good', 'Great', 'Excellent']

interface ActionState {
  completed: boolean
  doneVolume: string
  doneEffort: string
}

interface ExecuteStepSheetProps {
  step: Step
  onClose: () => void
}

export function ExecuteStepSheet({ step, onClose }: ExecuteStepSheetProps) {
  const [phase, setPhase] = useState<'executing' | 'rating'>('executing')
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>(() => {
    const init: Record<string, ActionState> = {}
    for (const a of step.actions ?? []) {
      init[a.id] = {
        completed: !!a.completedAt,
        doneVolume: a.doneVolume ?? '',
        doneEffort: a.doneEffort ?? '',
      }
    }
    return init
  })
  const [effortRating, setEffortRating] = useState(3)
  const [qualityRating, setQualityRating] = useState(3)

  const complete = useCompleteStep(step.id)
  const checkAction = useCheckAction(step.id)

  const actions = step.actions ?? []
  const completedCount = Object.values(actionStates).filter((s) => s.completed).length
  const totalCount = actions.length

  function handleActionCheck(action: StepAction, completed: boolean, doneVolume: string, doneEffort: string) {
    setActionStates((prev) => ({ ...prev, [action.id]: { completed, doneVolume, doneEffort } }))
    // Fire-and-forget real-time check-off
    checkAction.mutate({ actionId: action.id, completed, doneVolume: doneVolume || undefined, doneEffort: doneEffort || undefined })
  }

  async function handleComplete() {
    await complete.mutateAsync({
      effortRating,
      qualityRating,
      actions: actions.map((a) => ({
        actionId: a.id,
        completed: actionStates[a.id]?.completed ?? false,
        doneVolume: actionStates[a.id]?.doneVolume || undefined,
        doneEffort: actionStates[a.id]?.doneEffort || undefined,
      })),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
      <div
        className="relative bg-stone-50 rounded-t-3xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4">
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-6" />
          <h2 className="text-lg font-semibold text-stone-900">{step.name ?? step.content}</h2>
          {totalCount > 0 && (
            <p className="text-sm text-stone-400 mt-1">
              {completedCount} / {totalCount} done
            </p>
          )}
        </div>

        {phase === 'executing' ? (
          <>
            <div className="px-6 space-y-2 overflow-y-auto flex-1">
              {actions.length === 0 ? (
                <p className="text-sm text-stone-400 py-4 text-center">No actions — tap "I'm done" to complete.</p>
              ) : (
                actions.map((action) => {
                  const state = actionStates[action.id] ?? { completed: false, doneVolume: '', doneEffort: '' }
                  return (
                    <ActionRow
                      key={action.id}
                      mode="execute"
                      action={action}
                      checked={state.completed}
                      doneVolume={state.doneVolume}
                      doneEffort={state.doneEffort}
                      onCheck={(completed, doneVolume, doneEffort) =>
                        handleActionCheck(action, completed, doneVolume, doneEffort)
                      }
                    />
                  )
                })
              )}
            </div>

            <div className="flex gap-3 p-6 pt-4 border-t border-stone-100">
              <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
                Pause
              </Button>
              <Button
                type="button"
                onClick={() => setPhase('rating')}
                className="flex-1"
              >
                I'm done
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 space-y-6 overflow-y-auto flex-1">
              {totalCount > 0 && (
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-stone-900">
                    {Math.round((completedCount / totalCount) * 100)}%
                  </div>
                  <p className="text-sm text-stone-400 mt-1">
                    {completedCount} of {totalCount} actions completed
                  </p>
                </div>
              )}

              <RatingScale
                label="How heavy was it?"
                value={effortRating}
                onChange={setEffortRating}
                labels={EFFORT_LABELS}
              />

              <RatingScale
                label="How was it?"
                value={qualityRating}
                onChange={setQualityRating}
                labels={QUALITY_LABELS}
              />
            </div>

            <div className="flex gap-3 p-6 pt-4 border-t border-stone-100">
              <Button variant="secondary" type="button" onClick={() => setPhase('executing')} className="flex-1">
                Back
              </Button>
              <Button
                type="button"
                loading={complete.isPending}
                onClick={handleComplete}
                className="flex-1"
              >
                Complete step
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function RatingScale({
  label,
  value,
  onChange,
  labels,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  labels: string[]
}) {
  return (
    <div>
      <p className="text-sm font-medium text-stone-700 mb-3">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={clsx(
              'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
              value === n
                ? 'bg-stone-900 border-stone-900 text-white'
                : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-400 mt-1.5 text-center">{labels[value]}</p>
    </div>
  )
}
