import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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

function personaTone(persona) {
  const tones = {
    'Impulse Eater': { color: '#f59e0b', glow: 'rgba(245,158,11,0.22)' },
    'Big Spender': { color: '#ec4899', glow: 'rgba(236,72,153,0.22)' },
    'Daily Commuter': { color: '#06b6d4', glow: 'rgba(6,182,212,0.22)' },
    'Weekend Spender': { color: '#8b5cf6', glow: 'rgba(139,92,246,0.22)' },
    'Irregular Spender': { color: '#ef4444', glow: 'rgba(239,68,68,0.22)' },
    'Balanced User': { color: '#10b981', glow: 'rgba(16,185,129,0.22)' },
  }
  return tones[persona] ?? tones['Balanced User']
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
        className="text-xs font-semibold py-1.5 px-3 rounded-lg self-start transition-all report-click hover-surface"
        style={{
          background: `${color}15`,
          color,
          border: `1px solid ${color}30`,
        }}
      >
        Generate Report ✦
      </button>
    </div>
  )
}

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [reportCategory, setReportCategory] = useState(null)
  const [insightDays, setInsightDays] = useState(30)
  const [insightLoading, setInsightLoading] = useState(false)
  const [insightError, setInsightError] = useState('')
  const [insightData, setInsightData] = useState(null)
  const [messagesError, setMessagesError] = useState('')
  const user = getUser()

  useEffect(() => {
    api
      .get('/messages')
      .then((data) => setMessages(data.messages ?? []))
      .catch((error) => {
        if (error?.status === 401) {
          navigate('/login')
          return
        }
        setMessagesError(error?.message || 'Unable to load your transactions right now.')
      })
      .finally(() => setLoading(false))
  }, [navigate])

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
  const activeTab = new URLSearchParams(location.search).get('tab') || 'dashboard'
  const tabTitle = activeTab[0].toUpperCase() + activeTab.slice(1)
  const tabSubtitle = {
    dashboard: 'High-level overview of your latest spending activity.',
    transactions: 'A complete timeline of your synced expense messages.',
    analytics: 'Category trends and AI-powered report generation.',
  }[activeTab]

  useEffect(() => {
    const validTabs = new Set(['dashboard', 'transactions', 'analytics'])
    if (!validTabs.has(activeTab)) {
      navigate('/dashboard?tab=dashboard', { replace: true })
    }
  }, [activeTab, navigate])

  const loadInsights = async () => {
    const days = Math.min(Math.max(Number(insightDays) || 1, 1), 365)
    setInsightLoading(true)
    setInsightError('')

    try {
      const data = await api.get(`/messages/insights?days=${days}`)
      if (!data?.hasData) {
        setInsightData(null)
        setInsightError(data?.message ?? 'No transaction data available for this period.')
      } else {
        setInsightData(data)
      }
    } catch {
      setInsightError('Could not fetch insights right now. Please try again.')
      setInsightData(null)
    } finally {
      setInsightLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'analytics' && !insightData && !insightLoading) {
      const timer = setTimeout(() => {
        loadInsights()
      }, 0)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', color: 'var(--text)' }}>
      <Sidebar />

      <main className="md:ml-60 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.02em', color: 'var(--text)' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'}
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              {tabTitle} · {tabSubtitle}
            </p>
          </div>
          <span
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        <div className="md:hidden mb-5">
          <div className="card p-1.5 flex gap-1">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'transactions', label: 'Transactions' },
              { key: 'analytics', label: 'Analytics' },
            ].map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => navigate(`/dashboard?tab=${tab.key}`)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg font-semibold transition-all"
                  style={{
                    background: isActive ? 'rgba(124,58,237,0.14)' : 'transparent',
                    color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                    border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <section className="max-w-6xl">
            {messagesError && (
              <div className="card p-4 mb-4" style={{ borderColor: 'rgba(239,68,68,0.35)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
                  {messagesError}
                </p>
              </div>
            )}
            <div className="card p-4 mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Dashboard Overview
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total Spent" value={fmt(totalSpent)} sub={`${messages.length} transactions`} color="#ef4444" />
                <StatCard label="Categories" value={sortedCategories.length} sub="Spending categories" color="#7c3aed" />
                <StatCard label="Top Category" value={topCategory} sub="Highest spend category" color="#f59e0b" />
              </div>
            </div>

            {!loading && (
              <SpendingBar byCategory={byCategory} total={totalSpent} />
            )}
          </section>
        )}

        {activeTab === 'analytics' && (
          <section className="mb-6 max-w-6xl">
            <div className="card p-4 mb-4">
              <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>Analytics</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Category-wise performance and report generation.
              </p>
            </div>
            <div className="card p-5 mb-5">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Insight window (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={insightDays}
                    onChange={(e) => setInsightDays(e.target.value)}
                    className="input mt-2"
                    placeholder="Enter number of days"
                  />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Personal clustering-based persona + smart narrative for your selected period.
                  </p>
                </div>
                <button
                  onClick={loadInsights}
                  disabled={insightLoading}
                  className="btn-primary px-5 py-2.5 disabled:opacity-50"
                >
                  {insightLoading ? 'Generating insights...' : 'Generate Insights'}
                </button>
              </div>
            </div>

            {insightError && (
              <div className="card p-4 mb-5" style={{ borderColor: 'rgba(239,68,68,0.35)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{insightError}</p>
              </div>
            )}

            {insightData && (() => {
              const tone = personaTone(insightData.ml?.persona)
              return (
                <div className="card p-5 mb-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        AI Behavior Persona
                      </p>
                      <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--text)' }}>
                        {insightData.narrative?.emoji} {insightData.ml?.persona}
                      </h3>
                    </div>
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-full self-start lg:self-auto"
                      style={{
                        color: tone.color,
                        background: tone.glow,
                        border: `1px solid ${tone.color}55`,
                      }}
                    >
                      {insightData.days} days window · {insightData.ml?.clusteredUsers ?? 1} users compared
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <StatCard label="Total Spent" value={fmt(insightData.summary?.totalSpent ?? 0)} sub="In selected window" color={tone.color} />
                    <StatCard label="Avg Transaction" value={fmt(insightData.summary?.avgTxnAmount ?? 0)} sub={`${insightData.summary?.transactionCount ?? 0} txns`} color={tone.color} />
                    <StatCard label="Top Category" value={insightData.summary?.topCategory ?? 'others'} sub={`${(insightData.summary?.topCategoryShare ?? 0).toFixed(1)}% share`} color={tone.color} />
                    <StatCard label="Timing Pattern" value={`${(insightData.summary?.nightRatio ?? 0).toFixed(0)}%`} sub="Night transactions" color={tone.color} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                        What this says
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                        {insightData.narrative?.vibe}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                        Next best move
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                        {insightData.narrative?.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {!loading && sortedCategories.length > 0 && (
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
            )}
          </section>
        )}

        {activeTab === 'transactions' && (
          <section className="max-w-6xl">
            <div className="card p-4 mb-4">
              <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>Transactions</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Complete list of synced expenses and merchant activity.
              </p>
            </div>
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
          </section>
        )}
      </main>

      {reportCategory && (
        <ReportModal
          key={reportCategory}
          category={reportCategory}
          messages={messages}
          onClose={() => setReportCategory(null)}
        />
      )}
    </div>
  )
}
