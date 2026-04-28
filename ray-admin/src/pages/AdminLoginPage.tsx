import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { Button, Input } from '@/components/atoms'
import { useAdminAuthStore } from '@/store/adminAuthStore'

export const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, adminUser, clearError } = useAdminAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (adminUser) navigate('/admin/dashboard', { replace: true })
  }, [adminUser, navigate])

  useEffect(() => { clearError() }, [clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/admin/dashboard', { replace: true })
    } catch { /* error shown via store */ }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">

        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div className="text-center">
            <span className="font-display font-bold text-3xl text-primary">RAY</span>
            <span className="font-sans text-text-secondary text-base ml-2">Admin</span>
            <p className="text-sm text-text-muted font-sans mt-1">Internal operations portal</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-surface-card rounded-3xl p-6 border border-border"
        >
          <Input
            label="Email"
            type="email"
            placeholder="admin@ray.rw"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary font-sans">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={clsx(
                  'w-full bg-surface-modal border border-border rounded-xl px-3 py-2.5 pr-10',
                  'text-text-primary font-sans text-sm placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
              <p className="text-sm text-danger font-sans">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth loading={isLoading} size="lg">
            Sign In
          </Button>
        </form>

        <p className="text-xs text-text-muted font-sans text-center">
          Access restricted to authorised RAY team members only.
        </p>
      </div>
    </div>
  )
}
