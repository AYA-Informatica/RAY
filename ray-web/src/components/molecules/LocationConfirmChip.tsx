import { useState } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { useLocationStore } from '@/store/locationStore'
import { useAuthStore } from '@/store/authStore'
import { KIGALI_NEIGHBORHOODS } from '@/constants/locations'

/**
 * LocationConfirmChip — shown when user already has a saved location.
 * Confirms their current location and offers a quick update inline.
 * Never a modal. Never blocking. Just a chip.
 */
export const LocationConfirmChip = () => {
  const { user } = useAuthStore()
  const { userLocation, setManualLocation, requestGpsLocation } = useLocationStore()
  const [isEditing, setIsEditing] = useState(false)

  // Only show if we have a profile location but no active GPS/manual location in the store
  const profileLocation = user?.location
  if (!profileLocation || userLocation) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Location chip */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-modal border border-border rounded-full">
        <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
        <span className="text-xs font-semibold font-sans text-text-primary">
          {profileLocation.displayLabel}
        </span>
      </div>

      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-text-muted hover:text-primary font-sans transition-colors"
        >
          Not here?
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await requestGpsLocation()
              setIsEditing(false)
            }}
            className="text-xs font-semibold text-primary hover:text-primary-dark font-sans transition-colors"
          >
            Use GPS
          </button>
          <span className="text-text-muted text-xs">or</span>
          <select
            autoFocus
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                setManualLocation(e.target.value)
                setIsEditing(false)
              }
            }}
            className="bg-surface-modal border border-border rounded-xl px-2 py-1 text-xs font-sans text-text-primary focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
          >
            <option value="" disabled>Choose neighborhood</option>
            {KIGALI_NEIGHBORHOODS.map((n) => (
              <option key={n.name} value={n.displayLabel}>
                {n.displayLabel}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-text-muted font-sans"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}