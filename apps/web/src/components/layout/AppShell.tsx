import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { Mountain, Sun, MessageCircle, CheckSquare, User } from 'lucide-react'

interface AppShellProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { to: '/landscape', icon: Mountain, label: 'Mountains' },
  { to: '/today', icon: Sun, label: 'Today' },
  { to: '/coach', icon: MessageCircle, label: 'Coach' },
  { to: '/checkin', icon: CheckSquare, label: 'Check-in' },
]

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-stone-50/90 backdrop-blur-sm border-b border-stone-100 px-5 py-4 flex items-center justify-between">
        <Link to="/landscape" className="flex items-center gap-2">
          <span className="text-stone-900 font-medium tracking-tight">Walking Mountains</span>
        </Link>
        <Link to="/profile" className="p-1.5 rounded-full hover:bg-stone-100 transition-colors">
          <User className="h-4 w-4 text-stone-500" />
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 px-5 py-6 animate-fade-in">{children}</main>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 bg-stone-50/90 backdrop-blur-sm border-t border-stone-100 px-2 py-2">
        <ul className="flex items-center justify-around">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to)
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={clsx(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                    active
                      ? 'text-stone-900'
                      : 'text-stone-400 hover:text-stone-600'
                  )}
                >
                  <Icon className={clsx('h-5 w-5', active && 'stroke-[2.5]')} />
                  <span className="text-2xs font-medium">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
