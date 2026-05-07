import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '@/api/client'
import type { Step } from '@wm/types'

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function StepRow({ step }: { step: Step }) {
  const headline = step.name ?? step.content ?? ''
  const actionSummary = step.actions?.length
    ? step.actions
        .map((a) => `${a.actionName}${a.doneVolume ? ' ' + a.doneVolume : a.actionVolume ? ' ' + a.actionVolume : ''}`)
        .join(' · ')
    : null

  return (
    <li className="flex items-start gap-2">
      <span className="text-stone-300 text-xs mt-0.5 shrink-0 w-10">{formatTime(step.loggedAt)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm text-stone-700 leading-snug">
            {step.emojiRating && <span className="mr-1">{step.emojiRating}</span>}
            {headline}
          </p>
          {step.completionScore != null && (
            <span className="text-2xs text-stone-400 border border-stone-100 rounded-full px-1.5 py-0.5 shrink-0">
              {step.completionScore}%
            </span>
          )}
        </div>
        {actionSummary && <p className="text-xs text-stone-400 mt-0.5">{actionSummary}</p>}
        {step.aiResponse && <p className="text-xs text-stone-400 mt-0.5 italic">{step.aiResponse}</p>}
      </div>
    </li>
  )
}

export function StepList({ steps, emptyMessage = 'No steps logged yet.' }: { steps: Step[]; emptyMessage?: string }) {
  if (steps.length === 0) {
    return <p className="text-xs text-stone-400 py-1">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-2">
      {steps.map((step) => (
        <StepRow key={step.id} step={step} />
      ))}
    </ul>
  )
}

interface PathStepSummaryProps {
  pathId: string
  todaySteps: Step[]
  todayCount: number
  weekCount: number
}

export function PathStepSummary({ pathId, todaySteps, todayCount, weekCount }: PathStepSummaryProps) {
  const [expanded, setExpanded] = useState(false)

  const { data: allSteps, isLoading } = useQuery({
    queryKey: ['steps', { pathId, status: 'DONE' }],
    queryFn: () => api.get<Step[]>(`/steps?pathId=${pathId}&status=DONE&limit=50`),
    enabled: expanded,
  })

  return (
    <div className="border-t border-stone-100 pt-3 mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <span className="text-xs text-stone-500">
            <span className="font-semibold text-stone-800">{todayCount}</span> today
          </span>
          <span className="text-xs text-stone-500">
            <span className="font-semibold text-stone-800">{weekCount}</span> this week
          </span>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          {expanded ? 'Hide' : 'View all'}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {!expanded && todayCount > 0 && (
        <ul className="space-y-1.5">
          {todaySteps.map((step) => (
            <li key={step.id} className="flex items-start gap-2">
              <span className="text-stone-300 text-xs mt-0.5 shrink-0 w-10">{formatTime(step.loggedAt)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-600 leading-snug">
                  {step.emojiRating && <span className="mr-1">{step.emojiRating}</span>}
                  {step.name ?? step.content}
                </p>
                {step.completionScore != null && (
                  <span className="text-2xs text-stone-400">{step.completionScore}% complete</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {expanded && (
        isLoading
          ? <p className="text-xs text-stone-400">Loading...</p>
          : <StepList steps={allSteps ?? []} emptyMessage="No steps logged on this path yet." />
      )}
    </div>
  )
}
