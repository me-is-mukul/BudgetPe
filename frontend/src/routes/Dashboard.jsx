import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import MessageCard from '../components/MessageCard'
import ReportModal from '../components/ReportModal'
import { api } from '../utils/api'
import { getUser } from '../utils/auth'

const CATEGORY_COLORS = {
  food: '#f59e0b',
  travel: '#06b6d4',
  shopping: '#8b5cf6',
  others: '#6b7280',
}

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat?.toLowerCase()] ?? '#7c3aed'
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function SpendingBar({ byCategory, total }) {
  const top = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (top.length === 0) return null

  return (
    <div className="card p-6 mb-6">
      <h3 className="text-sm font-bold mb-5" style={{ color: 'var(--text)' }}>
        Spending Breakdown
      </h3>
      <div className="flex h-3 rounded-full overflow-hidden mb-5" style={{ background: 'var(--surface-hover)' }}>
        {top.map(([cat, val]) => (
          <div
            key={cat}
            style={{
              width: `${(val / total) * 100}%`,
              background: getCategoryColor(cat),
              transition: 'width 0.6s ease',
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {top.map(([cat, val]) => (
          <div key={cat} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: getCategoryColor(cat) }}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate capitalize" style={{ color: 'var(--text)' }}>{cat}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ₹{val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ category, amount, count, total, onReport }) {
  const color = getCategoryColor(category)
  const pct = total > 0 ? (amount / total) * 100 : 0

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: `${color}18`, color }}
          >
            {category[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold capitalize" style={{ color: 'var(--text)' }}>{category}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{count} transaction{count !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <p className="text-base font-bold tabular-nums" style={{ color: 'var(--text)' }}>
          ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>

      <button
        onClick={onReport}
        className="text-xs font-semibold py-1.5 px-3 rounded-lg self-start transition-all"
        style={{
          background: `${color}15`,
          color,
          border: `1px solid ${color}30`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${color}25` }}
        onMouseLeave={(e) => { e.currentTarget.style.background = `${color}15` }}
      >
        Generate Report ✦
      </button>
    </div>
  )
}

export default function Dashboard() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [reportCategory, setReportCategory] = useState(null)
  const user = getUser()

  useEffect(() => {
    api
      .get('/messages')
      .then((data) => setMessages(data.messages ?? []))
      .finally(() => setLoading(false))
  }, [])

  // All messages are debits — amounts are always positive
  const totalSpent = messages.reduce((s, m) => s + m.amount, 0)
  const fmt = (n) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  // Group by category
  const byCategory = {}
  messages.forEach((m) => {
    const key = m.category?.toLowerCase() ?? 'others'
    byCategory[key] = (byCategory[key] ?? 0) + m.amount
  })

  const categoryCounts = {}
  messages.forEach((m) => {
    const key = m.category?.toLowerCase() ?? 'others'
    categoryCounts[key] = (categoryCounts[key] ?? 0) + 1
  })

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Sidebar />

      <main className="md:ml-60 p-6 md:p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.02em', color: 'var(--text)' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
            </h1>
          </div>
          <span
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Spent"    value={fmt(totalSpent)}        sub={`${messages.length} transactions`} color="#ef4444" />
          <StatCard label="Categories"     value={sortedCategories.length} sub="Spending categories"              color="#7c3aed" />
          <StatCard label="Top Category"   value={topCategory}             sub="Highest spend category"           color="#f59e0b" />
        </div>

        {/* Spending breakdown bar */}
        {!loading && (
          <SpendingBar byCategory={byCategory} total={totalSpent} />
        )}

        {/* Category cards */}
        {!loading && sortedCategories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>By Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedCategories.map(([cat, amount]) => (
                <CategoryCard
                  key={cat}
                  category={cat}
                  amount={amount}
                  count={categoryCounts[cat]}
                  total={totalSpent}
                  onReport={() => setReportCategory(cat)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Transactions list */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Recent Transactions</h2>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--primary-light)' }}
            >
              {messages.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--primary)' }}
              />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading transactions…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ background: 'var(--surface-hover)' }}
              >
                📭
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>No transactions yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Open the mobile app — messages will appear here once synced.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {messages.map((m) => (
                <MessageCard key={m._id} {...m} />
              ))}
            </div>
          )}
        </div>
      </main>

      {reportCategory && (
        <ReportModal
          category={reportCategory}
          messages={messages}
          onClose={() => setReportCategory(null)}
        />
      )}
    </div>
  )
}
