import { clsx } from 'clsx'
import type { WeatherState } from '@wm/types'
import { EnergyLevel } from '@wm/types'
import { ENERGY_COLORS, ENERGY_LABELS } from '@/lib/domain'

interface WeatherBannerProps {
  weatherState: WeatherState | null
  narrative: string
}

const WEATHER_ICONS: Record<EnergyLevel, string> = {
  [EnergyLevel.CLEAR]: '☀️',
  [EnergyLevel.HAZY]: '🌤',
  [EnergyLevel.FOGGY]: '🌫',
}

export function WeatherBanner({ weatherState, narrative }: WeatherBannerProps) {
  const level = weatherState?.energyLevel ?? EnergyLevel.CLEAR
  const colors = ENERGY_COLORS[level]

  return (
    <div className={clsx('rounded-2xl px-4 py-4', colors.bg)}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{WEATHER_ICONS[level]}</span>
        <span className={clsx('text-sm font-medium', colors.text)}>
          {ENERGY_LABELS[level]}
        </span>
      </div>
      <p className={clsx('text-sm leading-relaxed', colors.text)}>{narrative}</p>
    </div>
  )
}
