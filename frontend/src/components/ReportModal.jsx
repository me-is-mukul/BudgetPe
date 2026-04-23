const CATEGORY_INSIGHTS = {
  food: [
    'Your food spend peaks on weekends — meal prepping on Sundays could cut costs by up to 30%.',
    'Delivery fees alone likely account for 15–20% of your food budget.',
    'You order food most frequently between 7–9 PM.',
  ],
  travel: [
    'Most of your travel expenses happen on weekdays — consistent with a commute pattern.',
    'Ride-hailing makes up the majority of your travel spend.',
    'A monthly transit pass could save you up to ₹800 compared to per-ride pricing.',
  ],
  shopping: [
    'Your shopping spend this month is higher than your 3-month average.',
    'Most purchases happen in the evening (6–10 PM) — impulse buying window.',
    'Try the 24-hour rule before any purchase above ₹500.',
  ],
  others: [
    'Transactions here didn\'t match a known merchant pattern.',
    'Review these — some may be recurring subscriptions you\'ve forgotten about.',
    'Categorising these manually will improve your spending insights over time.',
  ],
}

const CATEGORY_COLORS = {
  food: '#f59e0b',
  travel: '#06b6d4',
  shopping: '#8b5cf6',
  others: '#6b7280',
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getInsights(category) {
  return CATEGORY_INSIGHTS[category?.toLowerCase()] ?? CATEGORY_INSIGHTS.others
}

function getCategoryColor(category) {
  return CATEGORY_COLORS[category?.toLowerCase()] ?? '#7c3aed'
}

function BarChart({ messages, color }) {
  const dayTotals = DAYS.map((label) => ({ label, value: 0 }))

  messages.forEach((m) => {
    const day = new Date(m.date).getDay()
    const idx = day === 0 ? 6 : day - 1
    dayTotals[idx].value += m.amount
  })

  const max = Math.max(...dayTotals.map((d) => d.value), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '0 4px' }}>
      {dayTotals.map((d) => (
        <div
          key={d.label}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <div
            style={{
              width: '100%',
              height: `${Math.max((d.value / max) * 60, d.value > 0 ? 4 : 0)}px`,
              background: color,
              borderRadius: '4px 4px 0 0',
              opacity: d.value === 0 ? 0.12 : 0.85,
              transition: 'height 0.5s ease',
              minHeight: d.value > 0 ? 4 : 0,
            }}
          />
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function ReportModal({ category, messages, onClose }) {
  const filtered = messages.filter(
    (m) => m.category?.toLowerCase() === category?.toLowerCase()
  )
  const total = filtered.reduce((s, m) => s + m.amount, 0)
  const insights = getInsights(category)
  const color = getCategoryColor(category)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)', borderRadius: 20, padding: 28,
          width: '100%', maxWidth: 460, border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 4 }}>
              Category Report
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', textTransform: 'capitalize', marginBottom: 2 }}>
              {category}
            </h2>
            <p style={{ fontSize: 24, fontWeight: 800, color }}>
              ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-hover)', border: '1px solid var(--border)',
              borderRadius: 10, width: 34, height: 34, cursor: 'pointer',
              fontSize: 18, color: 'var(--text-muted)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Chart */}
        <div
          style={{
            background: 'var(--surface-hover)', borderRadius: 14,
            padding: '16px 16px 14px', marginBottom: 22,
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>
            Spending by Day of Week
          </p>
          <BarChart messages={filtered} color={color} />
        </div>

        {/* AI Insights */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>AI Insights</p>
            <span
              style={{
                fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                background: 'rgba(124,58,237,0.15)', color: 'var(--primary-light)',
                textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(124,58,237,0.25)',
              }}
            >
              Gemini
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.map((text, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--surface-hover)', border: '1px solid var(--border)',
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
          Insights are AI-generated placeholders · Gemini integration coming soon
        </p>
      </div>
    </div>
  )
}
