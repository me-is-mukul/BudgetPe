const CATEGORY_COLORS = {
  food: '#f59e0b',
  travel: '#06b6d4',
  shopping: '#8b5cf6',
  others: '#6b7280',
}

function getCategoryColor(category) {
  return CATEGORY_COLORS[category?.toLowerCase()] ?? '#7c3aed'
}

export default function MessageCard({ category, amount, date }) {
  const color = getCategoryColor(category)
  const formatted = new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
  const absAmt = amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all cursor-default"
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
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
        style={{ background: `${color}18`, color }}
      >
        {category?.[0]?.toUpperCase() ?? '?'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate capitalize" style={{ color: 'var(--text)' }}>
          {category}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatted}
        </p>
      </div>

      <p className="text-sm font-bold tabular-nums shrink-0" style={{ color: '#ef4444' }}>
        −₹{absAmt}
      </p>
    </div>
  )
}
