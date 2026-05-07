import garminConnectPkg from 'garmin-connect'

const { GarminConnect } = garminConnectPkg as unknown as {
  GarminConnect: new (opts: { username: string; password: string }) => {
    login: (username: string, password: string) => Promise<void>
    getSleepData: (date: Date) => Promise<unknown>
  }
}

const API_URL = process.env.WM_API_URL ?? 'https://walking-mountains.onrender.com'
const WM_EMAIL = process.env.WM_EMAIL ?? ''
const WM_PASSWORD = process.env.WM_PASSWORD ?? ''
const GARMIN_USERNAME = process.env.GARMIN_USERNAME ?? ''
const GARMIN_PASSWORD = process.env.GARMIN_PASSWORD ?? ''
const DAYS = parseInt(process.env.SYNC_DAYS ?? '7')

async function wmLogin(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: WM_EMAIL, password: WM_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Walking Mountains login failed: ${res.status}`)
  const data = await res.json() as { accessToken: string }
  return data.accessToken
}

async function postBiometrics(token: string, date: Date, sleep: unknown): Promise<void> {
  const dateStr = date.toISOString().split('T')[0]
  const sleepScore = (sleep as any)?.dailySleepDTO?.sleepScores?.overall?.value ?? null
  const restingHr = (sleep as any)?.restingHeartRate ?? (sleep as any)?.dailySleepDTO?.restingHeartRate ?? null
  const hrv = (sleep as any)?.avgOvernightHrv ?? null
  const stressScore = (sleep as any)?.dailySleepDTO?.avgSleepStress ?? null

  if (sleepScore == null && hrv == null && stressScore == null && restingHr == null) {
    console.log(`  ${dateStr}: no data`)
    return
  }

  const body: Record<string, unknown> = { date: dateStr, source: 'garmin' }
  if (sleepScore != null) body.sleepScore = sleepScore
  if (restingHr != null) body.restingHr = restingHr
  if (hrv != null) body.hrv = hrv
  if (stressScore != null) body.stressScore = stressScore

  const res = await fetch(`${API_URL}/api/biometrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Failed to save ${dateStr}: ${await res.text()}`)
  console.log(`  ✓ ${dateStr}: sleep=${sleepScore ?? '-'} hrv=${hrv ?? '-'} rhr=${restingHr ?? '-'}`)
}

async function main() {
  if (!WM_EMAIL || !WM_PASSWORD || !GARMIN_USERNAME || !GARMIN_PASSWORD) {
    console.error('Missing env vars. Check scripts/.garmin-sync.env')
    process.exit(1)
  }

  console.log(`[${new Date().toISOString()}] Syncing last ${DAYS} days from Garmin → Walking Mountains...`)

  const token = await wmLogin()

  const garmin = new GarminConnect({ username: GARMIN_USERNAME, password: GARMIN_PASSWORD })
  await garmin.login(GARMIN_USERNAME, GARMIN_PASSWORD)

  let synced = 0
  const errors: string[] = []

  for (let i = 0; i < DAYS; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    try {
      const sleep = await garmin.getSleepData(date)
      await postBiometrics(token, date, sleep)
      synced++
    } catch (err) {
      errors.push(`${date.toISOString().split('T')[0]}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(`Done. ${synced} days synced.`)
  if (errors.length) errors.forEach(e => console.log(`  ✗ ${e}`))
}

main().catch(err => {
  console.error('Sync failed:', err)
  process.exit(1)
})
