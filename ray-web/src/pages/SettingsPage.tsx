import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { clsx } from 'clsx'
import { Button, Input } from '@/components/atoms'
import { useAuthStore } from '@/store/authStore'
import { useLocationStore } from '@/store/locationStore'
import { usersApi } from '@/services/api'
import { Navigation, MapPin, Trash2 } from 'lucide-react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

const Toggle = ({ checked, onChange, label }: ToggleProps) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-sm font-sans text-text-primary">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-11 h-6 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-surface-modal border border-border'
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  </label>
)

export const SettingsPage = () => {
  const { user, updateUser, logout } = useAuthStore()
  const { userLocation, permission, requestGpsLocation, clearLocation, resetPromptDismissal } = useLocationStore()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [notifNewMessage, setNotifNewMessage] = useState(true)
  const [notifPriceDrop, setNotifPriceDrop] = useState(true)
  const [notifListingExpiring, setNotifListingExpiring] = useState(true)
  const [language, setLanguage] = useState<'en' | 'kin' | 'fr'>('en')
  const [hidePhone, setHidePhone] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await usersApi.updateProfile({ displayName })
      updateUser({ displayName })
      alert('Settings saved')
    } catch (err) {
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Type DELETE to confirm')
      return
    }
    if (!confirm('This will permanently delete your account and all your listings. Continue?')) return
    try {
      // TODO: Implement delete account API
      await logout()
      alert('Account deleted')
    } catch (err) {
      alert('Failed to delete account')
    }
  }

  return (
    <>
      <Helmet>
        <title>Settings | RAY</title>
      </Helmet>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
        <h1 className="font-display font-bold text-text-primary text-2xl">Settings</h1>

        {/* Account */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold text-text-primary">Account</h2>
          <div className="flex flex-col gap-4 p-5 bg-surface-card rounded-2xl border border-border">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-primary font-sans">Phone Number</label>
              <input
                type="tel"
                value={user?.phone ?? ''}
                disabled
                className="w-full px-4 py-3 bg-surface-modal border border-border rounded-2xl font-sans text-sm text-text-muted cursor-not-allowed"
              />
              <p className="text-xs text-text-muted font-sans">Phone number cannot be changed</p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold text-text-primary">Notifications</h2>
          <div className="flex flex-col gap-4 p-5 bg-surface-card rounded-2xl border border-border">
            <Toggle checked={notifNewMessage} onChange={setNotifNewMessage} label="New messages" />
            <Toggle checked={notifPriceDrop} onChange={setNotifPriceDrop} label="Price drops on saved items" />
            <Toggle
              checked={notifListingExpiring}
              onChange={setNotifListingExpiring}
              label="Listing expiring soon"
            />
          </div>
        </section>

        {/* Location */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display font-bold text-text-primary">Location</h2>
            <p className="text-sm text-text-secondary font-sans mt-0.5">
              Controls how distance filters and nearby listings work
            </p>
          </div>

          <div className="bg-surface-card rounded-3xl border border-border overflow-hidden">

            {/* Current permission status */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-text-primary font-sans">GPS Permission</p>
                <p className="text-xs text-text-muted font-sans mt-0.5">
                  {permission === 'granted'  && 'Location access is enabled'}
                  {permission === 'denied'   && 'Location access was denied — update in browser settings'}
                  {permission === 'prompt'   && 'Permission not yet requested'}
                  {permission === 'unknown'  && 'Permission status unknown'}
                </p>
              </div>
              <span className={clsx(
                'px-2.5 py-1 rounded-full text-xs font-bold font-sans',
                permission === 'granted'
                  ? 'bg-success/15 text-success'
                  : 'bg-danger/15 text-danger'
              )}>
                {permission === 'granted' ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Active location */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-text-primary font-sans">Active Search Location</p>
                <p className="text-xs text-text-muted font-sans mt-0.5">
                  {userLocation
                    ? `${userLocation.displayLabel} · ${userLocation.source === 'gps' ? 'GPS' : 'Manual'}`
                    : 'Not set — using default (all of Rwanda)'}
                </p>
              </div>
              {userLocation && (
                <button
                  onClick={clearLocation}
                  className="flex items-center gap-1.5 text-xs text-danger hover:text-red-400 font-sans font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            {/* Re-enable prompt */}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-text-primary font-sans">Location Prompt</p>
                <p className="text-xs text-text-muted font-sans mt-0.5">
                  Show the location prompt banner on the home page
                </p>
              </div>
              <button
                onClick={resetPromptDismissal}
                className="text-xs font-semibold text-primary hover:text-primary-dark font-sans transition-colors"
              >
                Re-enable
              </button>
            </div>
          </div>
        </section>

        {/* Language */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold text-text-primary">Language</h2>
          <div className="flex flex-col gap-3 p-5 bg-surface-card rounded-2xl border border-border">
            {[
              { value: 'en', label: 'English' },
              { value: 'kin', label: 'Kinyarwanda' },
              { value: 'fr', label: 'Français' },
            ].map((lang) => (
              <label key={lang.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value={lang.value}
                  checked={language === lang.value}
                  onChange={() => setLanguage(lang.value as 'en' | 'kin' | 'fr')}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-sans text-text-primary">{lang.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold text-text-primary">Privacy</h2>
          <div className="flex flex-col gap-4 p-5 bg-surface-card rounded-2xl border border-border">
            <Toggle checked={hidePhone} onChange={setHidePhone} label="Hide phone number in listings" />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold text-danger">Danger Zone</h2>
          <div className="flex flex-col gap-4 p-5 bg-surface-card rounded-2xl border border-danger">
            <p className="text-sm text-text-secondary font-sans">
              Deleting your account will permanently remove all your listings, messages, and data. This action cannot
              be undone.
            </p>
            <Input
              label="Type DELETE to confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
            />
            <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE'}>
              Delete Account
            </Button>
          </div>
        </section>

        {/* Save Button */}
        <Button size="lg" onClick={handleSave} loading={isSaving}>
          Save Changes
        </Button>
      </main>
    </>
  )
}
