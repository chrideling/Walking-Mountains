import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@wm/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  refresh: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null })
      },

      refresh: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false

        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })

          if (!response.ok) {
            set({ user: null, accessToken: null, refreshToken: null })
            return false
          }

          const data = await response.json()
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken })
          return true
        } catch {
          set({ user: null, accessToken: null, refreshToken: null })
          return false
        }
      },
    }),
    {
      name: 'wm-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
