import { prisma } from '@wm/db'
import type { TodayView, TodayViewItem } from '@wm/types'
import { Domain } from '@wm/types'

export async function assembleTodayView(userId: string): Promise<TodayView> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [snapshot, activePaths, upcomingHills] = await Promise.all([
    prisma.biometricSnapshot.findFirst({
      where: { userId, date: today },
      include: { weatherState: true },
    }),
    prisma.path.findMany({
      where: { status: 'ACTIVE', mountain: { userId } },
      include: {
        mountain: { select: { id: true, name: true, domain: true } },
        hill: { select: { id: true, name: true, targetDate: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.hill.findMany({
      where: {
        mountain: { userId },
        summitedAt: null,
        targetDate: { gte: today },
      },
      include: { mountain: { select: { id: true, name: true, domain: true, presence: true } } },
      orderBy: { targetDate: 'asc' },
      take: 3,
    }),
  ])

  const weatherState = snapshot?.weatherState ?? null
  const energyLevel = weatherState?.energyLevel ?? 'CLEAR'
  const energyNarrative = weatherState?.narrativeLine ?? 'No biometric data today — going by feel.'

  const items: TodayViewItem[] = []

  // Path steps — scale based on energy
  for (const path of activePaths.slice(0, 3)) {
    const domain = path.mountain.domain as unknown as Domain
    let subtitle: string | null = null
    let scaledNote: string | null = null

    if (energyLevel === 'FOGGY') {
      scaledNote = 'Scaled to your energy today'
      subtitle = `Easy version — protect recovery`
    } else if (energyLevel === 'HAZY') {
      scaledNote = 'Moderate energy — measured effort'
      subtitle = path.description ?? null
    } else {
      subtitle = path.description ?? null
    }

    items.push({
      id: `path-${path.id}`,
      domain,
      title: path.name,
      subtitle,
      type: 'path_step',
      sourceId: path.id,
      scaledNote,
    })
  }

  // Hill proximity prompts — surfaces when within prep window
  for (const hill of upcomingHills) {
    const daysOut = Math.round((new Date(hill.targetDate).getTime() - today.getTime()) / 86400000)
    const inPrepWindow = daysOut <= (hill as any).prepWindowDays

    if (inPrepWindow && daysOut <= 14) {
      const domain = hill.mountain.domain as unknown as Domain
      items.push({
        id: `hill-${hill.id}`,
        domain,
        title: `${hill.name} — ${daysOut} day${daysOut === 1 ? '' : 's'} out`,
        subtitle: (hill as any).targetMetric ?? null,
        type: 'hill_proximity',
        sourceId: hill.id,
        scaledNote: null,
      })
    }
  }

  // Cap at 5 items — today view is curated, not exhaustive
  return {
    date: today.toISOString().split('T')[0],
    weatherState,
    energyNarrative,
    items: items.slice(0, 5),
  }
}
