import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      style={{
        background: isDark ? 'rgba(124,58,237,0.25)' : '#e2e8f0',
        border: '1px solid var(--border-strong)',
        focusRingColor: 'var(--primary)',
      }}
    >
      {/* Track icons */}
      <span
        className="absolute inset-y-0 left-2 flex items-center text-xs pointer-events-none"
        style={{ opacity: isDark ? 1 : 0, transition: 'opacity 0.2s' }}
      >
        🌙
      </span>
      <span
        className="absolute inset-y-0 right-1.5 flex items-center text-xs pointer-events-none"
        style={{ opacity: isDark ? 0 : 1, transition: 'opacity 0.2s' }}
      >
        ☀️
      </span>

      {/* Thumb */}
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-all duration-300"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
            : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          left: isDark ? '2px' : 'calc(100% - 26px)',
        }}
      />
    </button>
  )
}
