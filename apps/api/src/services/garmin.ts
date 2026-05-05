import { GarminConnect } from 'garmin-connect'
import { prisma } from '@wm/db'
import { computeWeatherState } from './weather.js'

interface GarminCredentials {
  username: string
  password: string
}

async function makeClient(credentials: GarminCredentials): Promise<GarminConnect> {
  const client = new GarminConnect({ username: credentials.username, password: credentials.password })
  await client.login(credentials.username, credentials.password)
  return client
}

function dateRange(days: number): Date[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    return d
  })
}

export async function verifyGarminCredentials(username: string, password: string): Promise<boolean> {
  try {
    await makeClient({ username, password })
    return true
  } catch {
    return false
  }
}

export async function syncGarminData(userId: string, days = 7): Promise<{ synced: number; errors: string[] }> {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: 'garmin' } },
  })

  if (!integration?.accessToken || !integration.metadata) {
    throw new Error('Garmin account not connected')
  }

  const credentials: GarminCredentials = {
    username: (integration.metadata as Record<string, string>).username,
    password: integration.accessToken, // accessToken field stores the password for this unofficial API
  }

  let client: GarminConnect
  try {
    client = await makeClient(credentials)
  } catch {
    throw new Error('Garmin login failed — check your credentials in Settings')
  }

  const dates = dateRange(days)
  let synced = 0
  const errors: string[] = []

  for (const date of dates) {
    try {
      const dateStr = date.toISOString().split('T')[0]

      // Fetch in parallel — individual failures are caught below
      const [sleepData, hrvData, stressData] = await Promise.allSettled([
        client.getSleep(date),
        client.getHrv(date),
        client.getDailyStress(date),
      ])

      const sleep = sleepData.status === 'fulfilled' ? sleepData.value : null
      const hrv = hrvData.status === 'fulfilled' ? hrvData.value : null
      const stress = stressData.status === 'fulfilled' ? stressData.value : null

      // Extract values — Garmin's response shape varies, guard carefully
      const sleepScore = (sleep as any)?.dailySleepDTO?.sleepScores?.overall?.value ?? null
      const restingHr = (sleep as any)?.dailySleepDTO?.restingHeartRate ?? null

      // HRV: last night 5-min high is the closest to standard HRV reading
      const hrvValue =
        (hrv as any)?.hrvSummary?.lastNight5MinHigh ??
        (hrv as any)?.hrvSummary?.weeklyAvg ??
        null

      const stressScore = (stress as any)?.avgStressLevel ?? null

      // Only upsert if we got at least one meaningful value
      if (sleepScore == null && hrvValue == null && stressScore == null && restingHr == null) {
        continue
      }

      const snapshot = await prisma.biometricSnapshot.upsert({
        where: { userId_date: { userId, date } },
        create: {
          userId,
          date,
          sleepScore,
          restingHr,
          hrv: hrvValue,
          stressScore,
          source: 'garmin',
        },
        update: {
          // Only overwrite nulls — don't clobber manually entered data
          ...(sleepScore != null ? { sleepScore } : {}),
          ...(restingHr != null ? { restingHr } : {}),
          ...(hrvValue != null ? { hrv: hrvValue } : {}),
          ...(stressScore != null ? { stressScore } : {}),
          source: 'garmin',
        },
      })

      const weather = await computeWeatherState(userId, snapshot)
      if (weather) {
        await prisma.weatherState.upsert({
          where: { biometricSnapshotId: snapshot.id },
          create: { biometricSnapshotId: snapshot.id, ...weather },
          update: weather,
        })
      }

      synced++
    } catch (err) {
      errors.push(`${date.toISOString().split('T')[0]}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Update last synced timestamp
  await prisma.integration.update({
    where: { userId_provider: { userId, provider: 'garmin' } },
    data: { updatedAt: new Date() },
  })

  return { synced, errors }
}
