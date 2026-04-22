export default function StatCard({ label, value, sub, trend, color = '#7c3aed' }) {
  const isUp = trend > 0

  return (
    <div
      className="card p-5 flex flex-col gap-3 transition-transform hover:-translate-y-0.5 cursor-default"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        {trend !== undefined && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
              color: isUp ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {isUp ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
        {value}
      </p>

      {sub && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </p>
      )}

      <div
        className="h-0.5 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  )
}
