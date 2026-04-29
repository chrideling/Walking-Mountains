import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTodayView, useMorningBrief } from '@/hooks/useToday'
import { WeatherBanner } from '@/components/today/WeatherBanner'
import { TodayItem } from '@/components/today/TodayItem'
import { LogStepSheet } from '@/components/steps/LogStepSheet'
import { Button } from '@/components/ui/Button'

export function TodayPage() {
  const { data: today, isLoading } = useTodayView()
  const { data: briefData } = useMorningBrief()
  const [showLogStep, setShowLogStep] = useState(false)

  const today_date = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-stone-400">{today_date}</p>
        <h1 className="text-xl font-semibold text-stone-900 tracking-tight mt-0.5">Today</h1>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
          <div className="h-16 bg-stone-100 rounded-2xl animate-pulse" />
          <div className="h-16 bg-stone-100 rounded-2xl animate-pulse" />
        </div>
      )}

      {today && (
        <>
          <WeatherBanner
            weatherState={today.weatherState}
            narrative={today.energyNarrative}
          />

          {briefData?.brief && (
            <div className="bg-stone-100 rounded-2xl px-4 py-4">
              <p className="text-sm text-stone-600 leading-relaxed">{briefData.brief}</p>
            </div>
          )}

          {today.items.length > 0 ? (
            <div className="space-y-3">
              {today.items.map((item) => (
                <TodayItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-stone-400 text-sm">
                No active paths yet.
                <br />
                Add mountains and paths to populate your day.
              </p>
            </div>
          )}
        </>
      )}

      <div className="pt-2">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setShowLogStep(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Log a step
        </Button>
      </div>

      {showLogStep && <LogStepSheet onClose={() => setShowLogStep(false)} />}
    </div>
  )
}
