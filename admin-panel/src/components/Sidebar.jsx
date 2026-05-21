import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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

const activeClass   = 'bg-accent/10 text-accent border border-accent/20'
const inactiveClass = 'text-muted hover:text-agtext hover:bg-white/5 border border-transparent'

function SidebarContent({ session, onClose, onLogout }) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/10 flex-shrink-0">
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

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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

      <div className="px-3 py-4 border-t border-white/10 space-y-3 flex-shrink-0">
        {session?.user && (
          <div className="px-3 py-2 rounded-xl bg-white/5">
            <p className="text-xs text-muted truncate">{session.user.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
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
    </>
  )
}

export default function Sidebar({ session, isOpen, onClose }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <>
      {/* ── MOBILE (< 768px) ───────────────────────────────────────────
          Overlay fixed que cobre tudo. Painel desliza da esquerda.
          Usa style inline para o transform — sem risco de purge Tailwind. */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        {/* Backdrop escuro */}
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Painel lateral */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '14rem',
            display: 'flex',
            flexDirection: 'column',
            background: '#0e1e36',
            borderRight: '1px solid rgba(100,160,255,0.1)',
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
          }}
        >
          <SidebarContent session={session} onClose={onClose} onLogout={handleLogout} />
        </div>
      </div>

      {/* ── DESKTOP (≥ 768px) ──────────────────────────────────────────
          Sidebar estático no fluxo normal do flex. Nunca aparece no mobile. */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-0 h-screen bg-surface border-r border-white/10">
        <SidebarContent session={session} onClose={onClose} onLogout={handleLogout} />
      </aside>
    </>
  )
}
