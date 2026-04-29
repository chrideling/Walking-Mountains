import { Domain, Presence, EnergyLevel } from '@wm/types'

export const DOMAIN_LABELS: Record<Domain, string> = {
  [Domain.BODY]: 'Body',
  [Domain.MIND]: 'Mind',
  [Domain.WORLD]: 'World',
}

export const DOMAIN_COLORS: Record<Domain, { bg: string; border: string; text: string; icon: string; dot: string }> = {
  [Domain.BODY]: {
    bg: 'bg-body-50',
    border: 'border-body-200',
    text: 'text-body-700',
    icon: 'text-body-500',
    dot: 'bg-body-400',
  },
  [Domain.MIND]: {
    bg: 'bg-mind-50',
    border: 'border-mind-200',
    text: 'text-mind-700',
    icon: 'text-mind-500',
    dot: 'bg-mind-400',
  },
  [Domain.WORLD]: {
    bg: 'bg-world-50',
    border: 'border-world-200',
    text: 'text-world-700',
    icon: 'text-world-500',
    dot: 'bg-world-400',
  },
}

export const PRESENCE_LABELS: Record<Presence, string> = {
  [Presence.CLIMBING]: 'Climbing',
  [Presence.WALKING]: 'Walking',
  [Presence.IN_SIGHT]: 'In sight',
}

export const PRESENCE_ICONS: Record<Presence, string> = {
  [Presence.CLIMBING]: '⚡',
  [Presence.WALKING]: '🚶',
  [Presence.IN_SIGHT]: '💤',
}

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  [EnergyLevel.CLEAR]: 'Clear',
  [EnergyLevel.HAZY]: 'Hazy',
  [EnergyLevel.FOGGY]: 'Foggy',
}

export const ENERGY_COLORS: Record<EnergyLevel, { bg: string; text: string; accent: string }> = {
  [EnergyLevel.CLEAR]: {
    bg: 'bg-weather-clear',
    text: 'text-stone-800',
    accent: 'text-weather-clear-accent',
  },
  [EnergyLevel.HAZY]: {
    bg: 'bg-weather-hazy',
    text: 'text-stone-700',
    accent: 'text-weather-hazy-accent',
  },
  [EnergyLevel.FOGGY]: {
    bg: 'bg-weather-foggy',
    text: 'text-stone-600',
    accent: 'text-weather-foggy-accent',
  },
}

export function daysUntil(date: string | Date): number {
  const target = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
