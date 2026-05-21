import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
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

// Conteúdo compartilhado entre mobile e desktop
function SidebarContent({ session, onClose, onLogout }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 24px', borderBottom: '1px solid rgba(100,160,255,0.1)', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1a6fd4,#4d9fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <span style={{ fontWeight: 700, color: '#e8f0ff', fontSize: 14 }}>AGStudio</span>
          <span style={{ display: 'block', fontSize: 11, color: '#7a9ac0', lineHeight: 1 }}>Admin</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
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

      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(100,160,255,0.1)', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
        {session?.user && (
          <div style={{ padding: '8px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: 12, color: '#7a9ac0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.user.email}
            </p>
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

const DESKTOP_BREAKPOINT = 768

export default function Sidebar({ session, isOpen, onClose }) {
  const navigate = useNavigate()
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= DESKTOP_BREAKPOINT)

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // ── DESKTOP: sidebar estático no fluxo do flex ──────────────────
  if (isDesktop) {
    return (
      <aside style={{
        width: 224,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: '#0e1e36',
        borderRight: '1px solid rgba(100,160,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <SidebarContent session={session} onClose={onClose} onLogout={handleLogout} />
      </aside>
    )
  }

  // ── MOBILE: overlay deslizante ──────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: isOpen ? 'auto' : 'none' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      {/* Painel */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 224,
        display: 'flex',
        flexDirection: 'column',
        background: '#0e1e36',
        borderRight: '1px solid rgba(100,160,255,0.1)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }}>
        <SidebarContent session={session} onClose={onClose} onLogout={handleLogout} />
      </div>
    </div>
  )
}
