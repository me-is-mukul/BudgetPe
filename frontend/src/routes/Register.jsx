import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { setToken, setUser } from '../utils/auth'
import ThemeToggle from '../components/ThemeToggle'

const fields = [
  { key: 'name',        label: 'Full Name',     type: 'text',     placeholder: 'Mukul Sharma' },
  { key: 'email',       label: 'Email address', type: 'email',    placeholder: 'you@example.com' },
  { key: 'phoneNumber', label: 'Phone number',  type: 'tel',      placeholder: '9876543210' },
  { key: 'password',    label: 'Password',      type: 'password', placeholder: 'Min. 6 characters' },
]

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/register', form)
      if (data.token) {
        setToken(data.token)
        setUser(data.user)
        navigate('/dashboard')
      } else {
        setError(data.errors?.[0]?.msg || data.message || 'Registration failed')
      }
    } catch {
      setError('Could not connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"
      style={{ background: 'transparent' }}
    >
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm z-10 animate-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
            >
              B
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Budget<span style={{ color: 'var(--primary)' }}>Pe</span>
            </span>
          </Link>
          <p className="text-2xl font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Create account
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Start tracking your finances today
          </p>
        </div>

        <div className="card p-6">
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: 'var(--danger)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </label>
                <input
                  name={key}
                  type={type}
                  required
                  value={form[key]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="input"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 pt-5 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--primary-light)' }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
