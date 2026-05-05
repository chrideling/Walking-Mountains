import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '@/api/client'
import type { Step } from '@wm/types'

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function StepList({ steps, emptyMessage = 'No steps logged yet.' }: { steps: Step[]; emptyMessage?: string }) {
  if (steps.length === 0) {
    return <p className="text-xs text-stone-400 py-1">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-2">
      {steps.map((step) => (
        <li key={step.id} className="flex items-start gap-2">
          <span className="text-stone-300 text-xs mt-0.5 shrink-0 w-10">{formatTime(step.loggedAt)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-stone-700 leading-snug">
              {step.emojiRating && <span className="mr-1">{step.emojiRating}</span>}
              {step.content}
            </p>
            {step.aiResponse && (
              <p className="text-xs text-stone-400 mt-0.5 italic">{step.aiResponse}</p>
            )}
          </div>
        </li>
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

  // Full history — only fetched when expanded
  const { data: allSteps, isLoading } = useQuery({
    queryKey: ['steps', { pathId }],
    queryFn: () => api.get<Step[]>(`/steps?pathId=${pathId}&limit=50`),
    enabled: expanded,
  })

  return (
    <div className="border-t border-stone-100 pt-3 mt-3 space-y-2">
      {/* Stats row */}
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

      {/* Today's steps — always visible when not expanded */}
      {!expanded && todayCount > 0 && (
        <ul className="space-y-1.5">
          {todaySteps.map((step) => (
            <li key={step.id} className="flex items-start gap-2">
              <span className="text-stone-300 text-xs mt-0.5 shrink-0 w-10">{formatTime(step.loggedAt)}</span>
              <p className="text-xs text-stone-600 leading-snug">
                {step.emojiRating && <span className="mr-1">{step.emojiRating}</span>}
                {step.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Expanded: full history */}
      {expanded && (
        isLoading
          ? <p className="text-xs text-stone-400">Loading...</p>
          : <StepList steps={allSteps ?? []} emptyMessage="No steps logged on this path yet." />
      )}
    </div>
  )
}
