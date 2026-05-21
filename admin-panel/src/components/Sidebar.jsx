import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const Logo = () => (
  <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/10">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent2 to-accent flex items-center justify-center flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    </div>
    <div>
      <span className="font-bold text-agtext text-sm">AGStudio</span>
      <span className="block text-xs text-muted leading-none">Admin</span>
    </div>
  </div>
)

const navItems = [
  {
    to: '/',
    end: true,
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/leads',
    end: false,
    label: 'Leads',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

export default function Sidebar({ session, isOpen, onClose }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const activeClass   = 'bg-accent/10 text-accent border border-accent/20'
  const inactiveClass = 'text-muted hover:text-agtext hover:bg-white/5 border border-transparent'

  return (
    <aside
      className={[
        // Base — sempre presente
        'fixed inset-y-0 left-0 z-50 w-56',
        'bg-surface border-r border-white/10 flex flex-col',
        'transition-transform duration-300 ease-in-out',
        // Mobile: abre/fecha via translate
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop (md+): sempre visível, posição sticky normal
        'md:relative md:translate-x-0 md:flex-shrink-0 md:sticky md:top-0 md:h-screen md:z-auto',
      ].join(' ')}
    >
      <Logo />

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, end, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? activeClass : inactiveClass}`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-3">
        {session?.user && (
          <div className="px-3 py-2 rounded-xl bg-white/5">
            <p className="text-xs text-muted truncate">{session.user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-red-400 hover:bg-red-400/10 border border-transparent transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  )
}
