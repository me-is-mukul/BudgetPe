import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import MessageCard from '../components/MessageCard'
import { api } from '../utils/api'
import { getUser } from '../utils/auth'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function SpendingBar({ messages }) {
  const categories = {}
  messages.forEach((m) => {
    if (m.amount < 0) {
      const key = m.sender || 'Other'
      categories[key] = (categories[key] || 0) + Math.abs(m.amount)
    }
  })
  const total = Object.values(categories).reduce((a, b) => a + b, 0)
  const top = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

  if (top.length === 0) return null

  return (
    <div className="card p-6 mb-6">
      <h3 className="text-sm font-bold mb-5" style={{ color: 'var(--text)' }}>Spending Breakdown</h3>
      <div className="flex h-3 rounded-full overflow-hidden mb-5" style={{ background: 'var(--surface-hover)' }}>
        {top.map(([key, val], i) => (
          <div
            key={key}
            style={{
              width: `${(val / total) * 100}%`,
              background: colors[i],
              transition: 'width 0.6s ease',
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {top.map(([key, val], i) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: colors[i] }}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{key}</p>
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

export default function Dashboard() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getUser()

  useEffect(() => {
    api
      .get('/messages')
      .then((data) => setMessages(data.messages || []))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  const totalAmount   = messages.reduce((s, m) => s + m.amount, 0)
  const totalReceived = messages.filter((m) => m.amount > 0).reduce((s, m) => s + m.amount, 0)
  const totalSpent    = messages.filter((m) => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0)

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
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
          </div>
          <span
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulse-dot 2s infinite' }} />
            Live
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Net Balance"     value={fmt(totalAmount)}   sub={`${messages.length} transactions`} color="#7c3aed" />
          <StatCard label="Total Received"  value={fmt(totalReceived)} sub="Income this period"               color="#10b981" trend={12} />
          <StatCard label="Total Spent"     value={fmt(totalSpent)}    sub="Expenses this period"             color="#ef4444" trend={-5} />
        </div>

        {/* Spending breakdown bar */}
        {!loading && <SpendingBar messages={messages} />}

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
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Messages will appear here once synced.</p>
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
    </div>
  )
}
