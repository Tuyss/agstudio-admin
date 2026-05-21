import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ session }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-black">

      {/* Overlay mobile — escurece o fundo e fecha o sidebar ao clicar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        session={session}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar mobile com botão hambúrguer */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-surface border-b border-white/10 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted hover:text-agtext transition-colors p-1"
            aria-label="Abrir menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent2 to-accent flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="font-bold text-sm text-agtext">AGStudio Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
