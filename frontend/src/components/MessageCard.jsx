export default function MessageCard({ sender, amount, date, additionalMessage }) {
  const isCredit = amount >= 0
  const formatted = new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
  const absAmt = Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all cursor-default group"
      style={{ border: '1px solid transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface-hover)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
        style={{
          background: isCredit ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
          color: isCredit ? 'var(--success)' : 'var(--danger)',
        }}
      >
        {sender?.[0]?.toUpperCase() || '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
          {sender}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {additionalMessage || formatted}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p
          className="text-sm font-bold tabular-nums"
          style={{ color: isCredit ? 'var(--success)' : 'var(--danger)' }}
        >
          {isCredit ? '+' : '−'}₹{absAmt}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatted}
        </p>
      </div>
    </div>
  )
}
