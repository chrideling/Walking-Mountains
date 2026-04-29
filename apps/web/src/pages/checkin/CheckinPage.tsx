import { useState } from 'react'
import { useWeeklyCheckin, useRespondToCheckin } from '@/hooks/useCheckin'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'

export function CheckinPage() {
  const { data: checkin, isLoading } = useWeeklyCheckin()
  const respond = useRespondToCheckin()
  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const weekLabel = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!response.trim()) return
    await respond.mutateAsync(response.trim())
    setSubmitted(true)
  }

  const alreadyResponded = !!(checkin?.userResponse) || submitted

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-stone-400">Week of {weekLabel}</p>
        <h1 className="text-xl font-semibold text-stone-900 tracking-tight mt-0.5">Weekly check-in</h1>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-24 bg-stone-100 rounded-2xl animate-pulse" />
          <div className="h-12 bg-stone-100 rounded-2xl animate-pulse" />
        </div>
      )}

      {checkin && (
        <>
          {/* AI summary */}
          <div className="bg-stone-100 rounded-2xl px-5 py-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">This week</p>
            <p className="text-sm text-stone-700 leading-relaxed">{checkin.aiSummary}</p>
          </div>

          {/* AI question */}
          {alreadyResponded ? (
            <div className="space-y-3">
              <p className="text-sm text-stone-500 italic">{checkin.aiQuestion}</p>
              <div className="bg-white border border-stone-200 rounded-2xl px-4 py-4">
                <p className="text-sm text-stone-800 leading-relaxed">
                  {checkin.userResponse}
                </p>
              </div>
              <p className="text-xs text-stone-400 text-center">
                Noted. See you next week.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-sm text-stone-700 leading-relaxed mb-4 italic">
                  {checkin.aiQuestion}
                </p>
                <Textarea
                  placeholder="A sentence or two is enough..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                loading={respond.isPending}
                disabled={!response.trim()}
                className="w-full"
              >
                Send
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  )
}
