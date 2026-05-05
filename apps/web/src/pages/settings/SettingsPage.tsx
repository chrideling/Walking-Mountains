import { useState } from 'react'
import { Activity, RefreshCw, Unlink, CheckCircle, AlertCircle } from 'lucide-react'
import { useGarminStatus, useConnectGarmin, useDisconnectGarmin, useSyncGarmin } from '@/hooks/useGarmin'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const { data: garminStatus, isLoading: statusLoading } = useGarminStatus()
  const connect = useConnectGarmin()
  const disconnect = useDisconnectGarmin()
  const sync = useSyncGarmin()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [connectError, setConnectError] = useState('')
  const [syncResult, setSyncResult] = useState<{ synced: number; errors: string[] } | null>(null)

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setConnectError('')
    try {
      await connect.mutateAsync({ username, password })
      setUsername('')
      setPassword('')
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Could not connect to Garmin')
    }
  }

  async function handleSync(days: number) {
    setSyncResult(null)
    try {
      const result = await sync.mutateAsync(days)
      setSyncResult(result)
    } catch {
      setSyncResult({ synced: 0, errors: ['Sync failed — check your connection'] })
    }
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect your Garmin account? Existing biometric data will be kept.')) return
    await disconnect.mutateAsync()
    setSyncResult(null)
  }

  const lastSynced = garminStatus?.lastSynced
    ? new Date(garminStatus.lastSynced).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Settings</h1>
        <p className="text-sm text-stone-500 mt-0.5">{user?.name} · {user?.email}</p>
      </div>

      {/* Garmin */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-body-500" />
          <h2 className="text-sm font-semibold text-stone-700">Garmin Connect</h2>
        </div>

        {statusLoading ? (
          <div className="h-24 bg-stone-100 rounded-2xl animate-pulse" />
        ) : garminStatus?.connected ? (
          <Card className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-world-500" />
                  <span className="text-sm font-medium text-stone-900">Connected</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">{garminStatus.username}</p>
                {lastSynced && (
                  <p className="text-xs text-stone-400 mt-0.5">Last synced {lastSynced}</p>
                )}
              </div>
              <button
                onClick={handleDisconnect}
                className="text-stone-400 hover:text-red-500 transition-colors p-1"
                title="Disconnect"
              >
                <Unlink className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSync(7)}
                loading={sync.isPending}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Sync last 7 days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSync(30)}
                loading={sync.isPending}
              >
                Sync last 30 days
              </Button>
            </div>

            {syncResult && (
              <div className={`rounded-xl px-4 py-3 text-sm ${
                syncResult.errors.length > 0 ? 'bg-amber-50 text-amber-800' : 'bg-world-50 text-world-700'
              }`}>
                {syncResult.synced > 0 && (
                  <p>{syncResult.synced} day{syncResult.synced !== 1 ? 's' : ''} synced successfully.</p>
                )}
                {syncResult.errors.length > 0 && (
                  <p className="mt-1 text-xs opacity-70">
                    {syncResult.errors.length} error{syncResult.errors.length !== 1 ? 's' : ''} — some days may be incomplete.
                  </p>
                )}
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-5">
            <p className="text-sm text-stone-600 mb-4 leading-relaxed">
              Connect your Garmin account to pull HRV, sleep, and stress data automatically.
              Your biometric state will shape the Today View each morning.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  This uses your Garmin Connect login credentials directly.
                  They are stored on the server and used only to sync your health data.
                </p>
              </div>
            </div>
            <form onSubmit={handleConnect} className="space-y-3">
              <Input
                label="Garmin Connect email"
                type="email"
                placeholder="you@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {connectError && (
                <p className="text-sm text-red-600">{connectError}</p>
              )}
              <Button
                type="submit"
                loading={connect.isPending}
                disabled={!username || !password}
                className="w-full"
              >
                Connect Garmin
              </Button>
            </form>
          </Card>
        )}
      </section>

      {/* Account */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-700">Account</h2>
        <Button variant="ghost" onClick={logout} className="text-stone-500">
          Sign out
        </Button>
      </section>
    </div>
  )
}
