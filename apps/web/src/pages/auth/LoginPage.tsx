import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { AuthResponse } from '@wm/types'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post<AuthResponse>('/auth/login', { email, password })
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate('/landscape')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-stone-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Walking Mountains</h1>
          <p className="text-stone-500 mt-2 text-sm">Finding your way through a life that keeps moving.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Continue
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
