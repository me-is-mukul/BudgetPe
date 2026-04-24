import { Link } from 'react-router-dom'
import { useTheme } from '../context/useTheme'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { theme } = useTheme()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: theme === 'dark'
          ? 'rgba(9,9,15,0.8)'
          : 'rgba(248,250,252,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium rounded-lg hover-text-default hover-surface"
            style={{ color: 'var(--text-muted)' }}
          >
            Sign In
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
