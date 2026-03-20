import { NavLink } from 'react-router-dom'
import { Terminal, Activity, History, Users, BookOpen, Settings } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Activity', icon: Activity },
  { to: '/sessions', label: 'Sessions', icon: History },
  { to: '/agents', label: 'Agents', icon: Users },
  { to: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { to: '/system', label: 'System', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-[var(--glass-border)]" style={{ background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)' }}>
      {/* Logo / Title */}
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-[var(--border)]">
        <Terminal className="w-5 h-5 text-[var(--accent)]" />
        <span className="text-lg font-semibold tracking-tight">Claude Dashboard</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[var(--accent)] text-white shadow-md shadow-indigo-500/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Status indicator */}
      <div className="px-6 py-4 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]" />
        </span>
        Connected
      </div>
    </aside>
  )
}
