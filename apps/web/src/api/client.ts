import { useAuthStore } from '@/store/auth'

// In dev, Vite proxies /api → localhost:3001. In production, point to Render URL.
const BASE_URL = (import.meta.env.VITE_API_URL ?? '') + '/api'

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public error?: string
  ) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (response.status === 401) {
    // Try token refresh
    const refreshed = await useAuthStore.getState().refresh()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${useAuthStore.getState().accessToken}`
      const retried = await fetch(`${BASE_URL}${path}`, { ...options, headers })
      if (!retried.ok) {
        const err = await retried.json().catch(() => ({}))
        throw new ApiError(retried.status, err.message ?? 'Request failed', err.error)
      }
      if (retried.status === 204) return undefined as T
      return retried.json()
    } else {
      useAuthStore.getState().logout()
      throw new ApiError(401, 'Session expired')
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new ApiError(response.status, err.message ?? 'Request failed', err.error)
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export { ApiError }
