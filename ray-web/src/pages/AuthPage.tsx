import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Phone, ArrowRight, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { useAuthStore } from '@/store/authStore'
import { STRINGS } from '@/constants/strings'

type AuthStep = 'phone' | 'otp'

export const AuthPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'

  const { sendOtp, verifyOtp, isLoading, error, clearError } = useAuthStore()

  const [step, setStep] = useState<AuthStep>('phone')
  const [phone, setPhone] = useState('+250 ')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      clearError()
    }
  }, [clearError])

  const startCountdown = () => {
    setCountdown(60)
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s+/g, '').replace(/[^+\d]/g, '')
    if (cleaned.length < 10) return
    try {
      await sendOtp(cleaned)
      setStep('otp')
      startCountdown()
    } catch {
      // error shown via store
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    // Auto-verify when all filled
    if (next.every((d) => d !== '') && index === 5) {
      handleVerify(next.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (code?: string) => {
    const full = code ?? otp.join('')
    if (full.length < 6) return
    try {
      const result = await verifyOtp(full)
      if (result === 'new_user') {
        navigate('/setup-profile')
      } else {
        navigate(from, { replace: true })
      }
    } catch {
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setOtp(['', '', '', '', '', ''])
    await handleSendOtp()
  }

  return (
    <>
      <Helmet>
        <title>Login | RAY</title>
      </Helmet>

      {/* Recaptcha container (invisible) */}
      <div id="recaptcha-container" />

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm flex flex-col gap-8">

          {/* Brand mark */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-display font-bold text-4xl text-primary">RAY</span>
            <p className="text-sm font-sans text-text-secondary">{STRINGS.app.tagline}</p>
          </div>

          {step === 'phone' ? (
            <div className="flex flex-col gap-6 bg-surface-card rounded-3xl p-6 border border-border animate-slide-up">
              <div>
                <h1 className="font-display font-bold text-xl text-text-primary">
                  {STRINGS.auth.phoneTitle}
                </h1>
                <p className="text-sm font-sans text-text-secondary mt-1">
                  {STRINGS.auth.phoneSubtitle}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary font-sans">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    placeholder="+250 7xx xxx xxxx"
                    className={clsx(
                      'w-full pl-10 pr-4 py-3 bg-surface-modal border border-border rounded-2xl',
                      'font-sans text-sm text-text-primary placeholder:text-text-muted',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    )}
                  />
                </div>
                {error && <p className="text-sm text-danger font-sans">{error}</p>}
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={handleSendOtp}
                loading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {STRINGS.auth.sendCode}
              </Button>

              <div className="flex items-center gap-2 text-xs text-text-muted font-sans">
                <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                Your number is only used for verification. We never share it.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 bg-surface-card rounded-3xl p-6 border border-border animate-slide-up">
              <div>
                <h1 className="font-display font-bold text-xl text-text-primary">
                  {STRINGS.auth.otpTitle}
                </h1>
                <p className="text-sm font-sans text-text-secondary mt-1">
                  {STRINGS.auth.otpSubtitle(phone)}
                </p>
              </div>

              {/* OTP inputs */}
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={clsx(
                      'w-11 h-14 text-center text-xl font-bold font-sans rounded-2xl border-2 bg-surface-modal',
                      'text-text-primary transition-all duration-150',
                      'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                      digit ? 'border-primary' : 'border-border'
                    )}
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-danger font-sans text-center">{error}</p>
              )}

              <Button
                fullWidth
                size="lg"
                onClick={() => handleVerify()}
                loading={isLoading}
                disabled={otp.some((d) => d === '')}
              >
                Verify
              </Button>

              {/* Resend */}
              <div className="text-center">
                <button
                  onClick={handleResend}
                  disabled={countdown > 0 || isLoading}
                  className={clsx(
                    'text-sm font-semibold font-sans transition-colors',
                    countdown > 0 || isLoading
                      ? 'text-text-muted cursor-not-allowed'
                      : 'text-primary hover:text-primary-dark'
                  )}
                >
                  {countdown > 0
                    ? STRINGS.auth.resendIn(countdown)
                    : STRINGS.auth.resend}
                </button>
              </div>

              <button
                onClick={() => { setStep('phone'); clearError() }}
                className="text-xs text-text-muted font-sans text-center hover:text-text-secondary transition-colors"
              >
                ← Change phone number
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
