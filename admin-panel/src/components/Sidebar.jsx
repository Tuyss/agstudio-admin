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

// Conteúdo interno do sidebar — reutilizado nos dois renders
function SidebarContent({ session, onClose, onLogout }) {
  return (
    <>
      {/* Logo */}
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

      {/* Nav */}
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

      {/* Footer */}
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
      {/*
        MOBILE — overlay drawer (fixed, fora do fluxo, não empurra nada)
        Visível apenas em telas < md. Controlado por isOpen.
      */}
      <div className={`md:hidden fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop escuro */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />
        {/* Painel deslizante */}
        <div
          className={`absolute inset-y-0 left-0 flex flex-col w-56 bg-surface border-r border-white/10 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <SidebarContent session={session} onClose={onClose} onLogout={handleLogout} />
        </div>
      </div>

      {/*
        DESKTOP — sidebar estático no fluxo normal (md+)
        Sempre visível, sticky na lateral. Nunca aparece no mobile.
      */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-0 h-screen bg-surface border-r border-white/10">
        <SidebarContent session={session} onClose={onClose} onLogout={handleLogout} />
      </aside>
    </>
  )
}
