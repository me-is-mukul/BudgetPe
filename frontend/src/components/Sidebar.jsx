import { Link, useLocation, useNavigate } from 'react-router-dom'
import { removeToken, removeUser, getUser } from '../utils/auth'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard?tab=dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { key: 'transactions', label: 'Transactions', path: '/dashboard?tab=transactions', icon: 'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4' },
  { key: 'analytics', label: 'Analytics', path: '/dashboard?tab=analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
]

function NavIcon({ d }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d.includes('M15 12') ? (
        <>
          <path d={d.split(' M15')[0]} />
          <path d={'M15' + d.split(' M15')[1]} />
        </>
      ) : (
        <path d={d} />
      )}
    </svg>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()
  const activeTab = new URLSearchParams(location.search).get('tab') || 'dashboard'

  const handleLogout = () => {
    removeToken()
    removeUser()
    navigate('/')
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-40"
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 px-5 h-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
        >
          B
        </div>
        <span className="text-base font-bold" style={{ color: 'var(--text)' }}>
          Budget<span style={{ color: 'var(--primary)' }}>Pe</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>
          Menu
        </p>
        {navItems.map((item) => {
          const active = location.pathname === '/dashboard' && activeTab === item.key
          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                color: active ? 'var(--primary-light)' : 'var(--text-muted)',
                borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
            >
              <NavIcon d={item.icon} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Theme toggle */}
      <div className="px-5 pb-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Theme</span>
        <ThemeToggle />
      </div>

      {/* User */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.name || 'User'}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="shrink-0 p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--danger)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
