// ─────────────────────────────────────────────
// NotFoundPage
// ─────────────────────────────────────────────
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Camera, MapPin } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Avatar } from '@/components/atoms/Avatar'
import { useAuthStore } from '@/store/authStore'
import { usersApi } from '@/services/api'
import { KIGALI_NEIGHBORHOODS } from '@/constants/locations'
import { STRINGS } from '@/constants/strings'

export const NotFoundPage = () => (
  <>
    <Helmet><title>404 Not Found | RAY</title></Helmet>
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <span className="font-display font-bold text-8xl text-primary opacity-30">404</span>
        <h1 className="font-display font-bold text-2xl text-text-primary">Page not found</h1>
        <p className="text-sm text-text-secondary font-sans max-w-xs">
          This page doesn't exist, or the listing may have been removed.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => window.history.back()} variant="outline">Go back</Button>
        <Button as={Link} onClick={() => {}}>
          <Link to="/" className="text-white font-sans font-semibold">Home</Link>
        </Button>
      </div>
    </main>
  </>
)

// ─────────────────────────────────────────────
// ProfileSetupPage — shown to new users after OTP
// ─────────────────────────────────────────────
export const ProfileSetupPage = () => {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [displayName, setDisplayName] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) { setError('Name is required'); return }
    setIsSubmitting(true)
    setError(null)
    try {
      let avatarUrl: string | undefined
      if (avatarFile) {
        const { url } = await usersApi.uploadAvatar(avatarFile)
        avatarUrl = url
      }

      const selectedNeighborhood = KIGALI_NEIGHBORHOODS.find((n) => n.name === neighborhood)
      await usersApi.updateProfile({
        displayName: displayName.trim(),
        avatar: avatarUrl,
        location: selectedNeighborhood
          ? {
              district: selectedNeighborhood.district,
              neighborhood: selectedNeighborhood.name,
              displayLabel: selectedNeighborhood.displayLabel,
            }
          : undefined,
      })
      updateUser({ displayName: displayName.trim(), avatar: avatarUrl })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : STRINGS.errors.generic)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Helmet><title>Set Up Your Profile | RAY</title></Helmet>
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm flex flex-col gap-8">
          <div className="text-center">
            <span className="font-display font-bold text-4xl text-primary">RAY</span>
            <h1 className="font-display font-bold text-xl text-text-primary mt-3">
              {STRINGS.auth.profileSetupTitle}
            </h1>
            <p className="text-sm font-sans text-text-secondary mt-1">
              {STRINGS.auth.profileSetupSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-surface-card rounded-3xl p-6 border border-border">

            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar
                  src={avatarPreview ?? user?.avatar}
                  alt="Your avatar"
                  size="xl"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors border-2 border-surface-card"
                >
                  <Camera className="w-4 h-4 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-xs text-text-muted font-sans">Tap to add a photo (optional)</p>
            </div>

            {/* Name */}
            <Input
              label={STRINGS.auth.displayNameLabel}
              placeholder={STRINGS.auth.displayNamePlaceholder}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={error ?? undefined}
              autoFocus
            />

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary font-sans">
                {STRINGS.auth.locationLabel}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-modal border border-border rounded-2xl appearance-none font-sans text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select your neighborhood</option>
                  {KIGALI_NEIGHBORHOODS.map((n) => (
                    <option key={n.name} value={n.name}>{n.displayLabel}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
              {STRINGS.auth.getStarted}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-text-muted font-sans text-center hover:text-text-secondary transition-colors"
            >
              {STRINGS.auth.skipForNow}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
