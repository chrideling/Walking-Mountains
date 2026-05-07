import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import type { StepAction } from '@wm/types'
import type { StepActionInput } from '@wm/types'

// Used in plan mode: a draft action being edited
export interface ActionDraft extends StepActionInput {
  tempId: string
}

interface PlanModeProps {
  mode: 'plan'
  action: ActionDraft
  onChange: (updated: ActionDraft) => void
  onDelete: () => void
}

interface ExecuteModeProps {
  mode: 'execute'
  action: StepAction
  checked: boolean
  doneVolume: string
  doneEffort: string
  onCheck: (completed: boolean, doneVolume: string, doneEffort: string) => void
}

type ActionRowProps = PlanModeProps | ExecuteModeProps

export function ActionRow(props: ActionRowProps) {
  const [showInstruction, setShowInstruction] = useState(false)

  if (props.mode === 'plan') {
    const { action, onChange, onDelete } = props
    return (
      <div className="border border-stone-200 rounded-xl p-3 space-y-2 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Action name (e.g. Plank, Lunges each side)"
            value={action.actionName}
            onChange={(e) => onChange({ ...action, actionName: e.target.value })}
            className="flex-1 text-sm text-stone-900 placeholder-stone-400 bg-transparent border-none outline-none"
            autoFocus={action.actionName === ''}
          />
          <button
            type="button"
            onClick={onDelete}
            className="text-stone-300 hover:text-red-400 transition-colors shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Volume (60s, 10 reps, 5 km)"
            value={action.actionVolume ?? ''}
            onChange={(e) => onChange({ ...action, actionVolume: e.target.value || undefined })}
            className="flex-1 text-xs text-stone-600 placeholder-stone-300 bg-stone-50 border border-stone-100 rounded-lg px-2.5 py-1.5 outline-none focus:border-stone-300"
          />
          <input
            type="text"
            placeholder="Effort (10kg, z2, bodyweight)"
            value={action.actionEffort ?? ''}
            onChange={(e) => onChange({ ...action, actionEffort: e.target.value || undefined })}
            className="flex-1 text-xs text-stone-600 placeholder-stone-300 bg-stone-50 border border-stone-100 rounded-lg px-2.5 py-1.5 outline-none focus:border-stone-300"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowInstruction((v) => !v)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600"
          >
            {showInstruction ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showInstruction ? 'Hide coaching cue' : 'Add coaching cue'}
          </button>
          {showInstruction && (
            <input
              type="text"
              placeholder="Keep your core activated..."
              value={action.instruction ?? ''}
              onChange={(e) => onChange({ ...action, instruction: e.target.value || undefined })}
              className="mt-1.5 w-full text-xs text-stone-500 placeholder-stone-300 bg-stone-50 border border-stone-100 rounded-lg px-2.5 py-1.5 outline-none focus:border-stone-300"
            />
          )}
        </div>
      </div>
    )
  }

  // Execute mode
  const { action, checked, doneVolume, doneEffort, onCheck } = props
  return (
    <div
      className={clsx(
        'border rounded-xl p-3 transition-colors',
        checked ? 'border-stone-200 bg-stone-50 opacity-70' : 'border-stone-200 bg-white'
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onCheck(!checked, doneVolume, doneEffort)}
          className={clsx(
            'mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
            checked
              ? 'border-stone-800 bg-stone-800'
              : 'border-stone-300 hover:border-stone-500'
          )}
        >
          {checked && <span className="text-white text-xs">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <p className={clsx('text-sm font-medium', checked ? 'text-stone-400 line-through' : 'text-stone-900')}>
            {action.actionName}
          </p>

          {(action.actionVolume || action.actionEffort) && !checked && (
            <div className="flex gap-2 mt-1.5">
              {action.actionVolume && (
                <input
                  type="text"
                  defaultValue={doneVolume || action.actionVolume}
                  onBlur={(e) => onCheck(checked, e.target.value, doneEffort)}
                  className="flex-1 text-xs text-stone-600 bg-stone-50 border border-stone-100 rounded-lg px-2 py-1 outline-none focus:border-stone-300"
                  placeholder={action.actionVolume}
                />
              )}
              {action.actionEffort && (
                <input
                  type="text"
                  defaultValue={doneEffort || action.actionEffort}
                  onBlur={(e) => onCheck(checked, doneVolume, e.target.value)}
                  className="flex-1 text-xs text-stone-600 bg-stone-50 border border-stone-100 rounded-lg px-2 py-1 outline-none focus:border-stone-300"
                  placeholder={action.actionEffort}
                />
              )}
            </div>
          )}

          {action.instruction && !checked && (
            <p className="text-xs text-stone-400 mt-1 italic">{action.instruction}</p>
          )}
        </div>
      </div>
    </div>
  )
}
