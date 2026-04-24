import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import OrbBlob from '../components/OrbBlob'
import VantaFogBackground from '../components/VantaFogBackground'

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Smart Tracking',
    desc: 'Automatically parse and categorize every transaction from your bank messages in real-time.',
    color: '#7c3aed',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'AI Insights',
    desc: 'Discover spending patterns you never noticed. Our AI surfaces what matters most.',
    color: '#06b6d4',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Savings Goals',
    desc: 'Set targets and watch your money grow with personalised milestone tracking.',
    color: '#10b981',
  },
]

const stats = [
  { value: '10K+', label: 'Active users' },
  { value: '₹2Cr+', label: 'Tracked monthly' },
  { value: '99.9%', label: 'Uptime' },
]

export default function Landing() {
  return (
    <div className="relative z-10" style={{ background: 'transparent', minHeight: '100vh', color: 'var(--text)', overflowX: 'hidden', isolation: 'isolate' }}>
      <VantaFogBackground />
      <div className="landing-vanta-veil" />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center px-6 md:px-12 pt-16">
        <div className="hero-contrast-layer" />
        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: '10%', left: '-5%', width: '50%', height: '60%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '-5%', width: '40%', height: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div className="z-10 order-2 md:order-1 animate-fade-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{
                background: 'rgba(124,58,237,0.1)',
                color: 'var(--primary-light)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--primary-light)', animation: 'pulse-dot 2s ease-in-out infinite' }}
              />
              AI-Powered Finance Intelligence
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6"
              style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
            >
              Your money has{' '}
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                patterns.
              </span>
              <br />
              We reveal them.
            </h1>

            <p className="text-base md:text-lg leading-relaxed mb-10 max-w-md" style={{ color: 'var(--text-muted)' }}>
              BudgetPe reads your bank messages and transforms raw transaction data into crystal-clear financial intelligence.
            </p>

            <div className="flex items-center gap-3 flex-wrap mb-14">
              <Link to="/register" className="btn-primary px-7 py-3 text-sm">
                Get started free →
              </Link>
              <Link
                to="/login"
                className="px-7 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-strong)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Sign in
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3D Orb */}
          <div className="flex justify-center items-center order-1 md:order-2 animate-float">
            <div className="orb-glass-wrap">
            <OrbBlob className="w-64 h-64 md:w-80 md:h-80 lg:w-105 lg:h-105" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--primary)' }}>
              Why BudgetPe
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Everything you need,<br />nothing you don't
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="card p-7 transition-all hover:-translate-y-1 group"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110"
                  style={{ background: `${f.color}18`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-16 mb-10">
        <div
          className="max-w-3xl mx-auto text-center px-8 py-16 rounded-3xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
            border: '1px solid rgba(124,58,237,0.2)',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--primary-light)' }}>
            Get started today
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Experience the future<br />of personal finance
          </h2>
          <p className="text-sm mb-10 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Join thousands who trust BudgetPe to manage and understand their money every day.
          </p>
          <Link
            to="/register"
            className="btn-primary px-9 py-3 text-sm inline-block"
            style={{ boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}
          >
            Start for free
          </Link>
        </div>
      </section>
    </div>
  )
}
