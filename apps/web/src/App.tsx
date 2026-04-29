import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { LandscapePage } from '@/pages/landscape/LandscapePage'
import { TodayPage } from '@/pages/today/TodayPage'
import { MountainPage } from '@/pages/mountain/MountainPage'
import { CoachPage } from '@/pages/coach/CoachPage'
import { CheckinPage } from '@/pages/checkin/CheckinPage'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <AppShell>{children}</AppShell>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to="/landscape" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Protected */}
        <Route path="/landscape" element={<ProtectedRoute><LandscapePage /></ProtectedRoute>} />
        <Route path="/today" element={<ProtectedRoute><TodayPage /></ProtectedRoute>} />
        <Route path="/mountain/:id" element={<ProtectedRoute><MountainPage /></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute><CoachPage /></ProtectedRoute>} />
        <Route path="/checkin" element={<ProtectedRoute><CheckinPage /></ProtectedRoute>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/landscape" replace />} />
        <Route path="*" element={<Navigate to="/landscape" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
