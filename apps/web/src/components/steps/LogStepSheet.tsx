import { useState } from 'react'
import { StepType } from '@wm/types'
import { useLogStep } from '@/hooks/useSteps'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'

const EMOJI_OPTIONS = ['💪', '🏃', '🧘', '📚', '🌿', '❤️', '⚡', '🎯']

interface LogStepSheetProps {
  onClose: () => void
  pathId?: string
}

export function LogStepSheet({ onClose, pathId }: LogStepSheetProps) {
  const [content, setContent] = useState('')
  const [emoji, setEmoji] = useState<string | null>(null)
  const logStep = useLogStep()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    await logStep.mutateAsync({
      content: content.trim(),
      type: pathId ? StepType.PATH : StepType.FREE,
      pathId,
      emojiRating: emoji ?? undefined,
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
        <h2 className="text-lg font-semibold text-stone-900 mb-1">Log a step</h2>
        <p className="text-sm text-stone-500 mb-5">Something good just happened — note it.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Twenty push-ups on a whim. Called a friend I'd been meaning to call..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            autoFocus
          />

          <div className="space-y-2">
            <label className="text-sm text-stone-500">How did it feel?</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(emoji === e ? null : e)}
                  className={`text-xl p-2 rounded-xl border transition-all ${
                    emoji === e
                      ? 'bg-stone-900 border-stone-900'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={logStep.isPending} disabled={!content.trim()} className="flex-1">
              Log it
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
