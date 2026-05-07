import { Play } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { Step } from '@wm/types'

function formatScheduledDate(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d >= today && d < tomorrow) return 'Today'
  if (d >= tomorrow && d < new Date(tomorrow.getTime() + 86400000)) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

interface PlannedStepCardProps {
  step: Step
  onStart: (step: Step) => void
}

export function PlannedStepCard({ step, onStart }: PlannedStepCardProps) {
  const isOverdue = step.scheduledFor && new Date(step.scheduledFor) < new Date(new Date().setHours(0, 0, 0, 0))
  const actionCount = step.actions?.length ?? 0

  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-stone-900 truncate">{step.name ?? step.content}</p>
            {isOverdue && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title="Overdue" />}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            {step.scheduledFor ? formatScheduledDate(step.scheduledFor) : 'Unscheduled'}
            {actionCount > 0 && ` · ${actionCount} action${actionCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => onStart(step)}
          className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl transition-colors shrink-0"
        >
          <Play className="h-3 w-3" />
          Start
        </button>
      </div>
    </Card>
  )
}
