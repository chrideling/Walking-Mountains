import { prisma } from '@wm/db'
import { EnergyLevel } from '@wm/types'
import { config } from '../config.js'

interface WeatherInput {
  hrv?: number | null
  sleepScore?: number | null
  stressScore?: number | null
}

export async function computeWeatherState(userId: string, snapshot: WeatherInput & { id: string; date: Date }) {
  const { hrv, sleepScore, stressScore } = snapshot

  // Get rolling baseline: average HRV over past N days
  const windowStart = new Date(snapshot.date)
  windowStart.setDate(windowStart.getDate() - config.hrvBaselineWindow)

  const recentSnapshots = await prisma.biometricSnapshot.findMany({
    where: {
      userId,
      date: { gte: windowStart, lt: snapshot.date },
      hrv: { not: null },
    },
    select: { hrv: true },
  })

  const baselineHrv =
    recentSnapshots.length > 0
      ? recentSnapshots.reduce((sum, s) => sum + (s.hrv ?? 0), 0) / recentSnapshots.length
      : null

  const baselineDelta = hrv && baselineHrv ? (hrv - baselineHrv) / baselineHrv : null

  // Determine energy level
  let energyLevel: EnergyLevel
  let narrativeLine: string

  const hrvSuppressed = baselineDelta !== null && baselineDelta < -config.hrvSuppressionThreshold
  const lowSleep = sleepScore !== undefined && sleepScore !== null && sleepScore < 60
  const highStress = stressScore !== undefined && stressScore !== null && stressScore > 65

  const negativeSignals = [hrvSuppressed, lowSleep, highStress].filter(Boolean).length

  if (negativeSignals >= 2) {
    energyLevel = EnergyLevel.FOGGY
    narrativeLine = buildNarrative(EnergyLevel.FOGGY, hrv, sleepScore, stressScore, baselineDelta)
  } else if (negativeSignals === 1 || (baselineDelta !== null && baselineDelta < 0)) {
    energyLevel = EnergyLevel.HAZY
    narrativeLine = buildNarrative(EnergyLevel.HAZY, hrv, sleepScore, stressScore, baselineDelta)
  } else {
    energyLevel = EnergyLevel.CLEAR
    narrativeLine = buildNarrative(EnergyLevel.CLEAR, hrv, sleepScore, stressScore, baselineDelta)
  }

  return { energyLevel, narrativeLine, baselineDelta }
}

function buildNarrative(
  level: EnergyLevel,
  hrv?: number | null,
  sleepScore?: number | null,
  stressScore?: number | null,
  baselineDelta?: number | null
): string {
  const hrvStr = hrv ? `HRV ${Math.round(hrv)}` : null
  const sleepStr = sleepScore ? `sleep ${sleepScore}` : null
  const deltaStr = baselineDelta !== null && baselineDelta !== undefined
    ? baselineDelta > 0
      ? `above baseline`
      : `below baseline`
    : null

  const parts = [hrvStr, sleepStr].filter(Boolean).join(', ')

  if (level === EnergyLevel.CLEAR) {
    return `${parts ? `${parts} — ` : ''}clear skies. Good day to climb.`
  } else if (level === EnergyLevel.HAZY) {
    const note = deltaStr ? ` — ${deltaStr}` : ''
    return `${parts ? `${parts}${note}. ` : ''}Moderate energy. Take the measured path.`
  } else {
    return `${parts ? `${parts} — well below baseline. ` : ''}Fog today. Protect your energy, stay close to shelter.`
  }
}
