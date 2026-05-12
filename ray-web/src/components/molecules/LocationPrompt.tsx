import { useState } from 'react'
import { MapPin, X, Navigation } from 'lucide-react'
import { clsx } from 'clsx'
import { useLocationStore } from '@/store/locationStore'
import { KIGALI_NEIGHBORHOODS } from '@/constants/locations'

interface LocationPromptProps {
  context: 'home' | 'search'
  className?: string
}

/**
 * LocationPrompt — soft, dismissible banner asking the user to share location.
 * Never blocks content. Shows two options: GPS or manual neighborhood select.
 * Automatically hidden once location is set or after dismissal.
 */
export const LocationPrompt = ({ context, className }: LocationPromptProps) => {
  const {
    shouldShowPrompt,
    requestGpsLocation,
    setManualLocation,
    dismissPrompt,
    isRequesting,
  } = useLocationStore()

  const [showManualSelect, setShowManualSelect] = useState(false)

  if (!shouldShowPrompt()) return null

  const contextMessage =
    context === 'search'
      ? 'Share your location to sort results by distance'
      : 'See listings near you first'

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 bg-surface-card border border-border rounded-2xl',
        'animate-slide-up',
        className
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5 p-2 bg-primary/10 rounded-xl">
        <MapPin className="w-4 h-4 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary font-sans">
          {contextMessage}
        </p>

        {!showManualSelect ? (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* GPS option */}
            <button
              onClick={async () => {
                const loc = await requestGpsLocation()
                if (!loc) setShowManualSelect(true)  // GPS failed — offer manual
              }}
              disabled={isRequesting}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl',
                'text-xs font-semibold font-sans transition-opacity',
                isRequesting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary-dark'
              )}
            >
              <Navigation className="w-3 h-3" />
              {isRequesting ? 'Getting location...' : 'Use my location'}
            </button>

            {/* Manual option */}
            <button
              onClick={() => setShowManualSelect(true)}
              className="px-3 py-1.5 text-xs font-semibold font-sans text-text-secondary hover:text-text-primary transition-colors"
            >
              Choose neighborhood
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <select
              autoFocus
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  setManualLocation(e.target.value)
                }
              }}
              className="flex-1 bg-surface-modal border border-border rounded-xl px-3 py-1.5 text-sm font-sans text-text-primary focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="" disabled>Select your neighborhood</option>
              {KIGALI_NEIGHBORHOODS.map((n) => (
                <option key={n.name} value={n.displayLabel}>
                  {n.displayLabel}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowManualSelect(false)}
              className="text-xs text-text-muted hover:text-text-secondary font-sans transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={dismissPrompt}
        className="flex-shrink-0 p-1 text-text-muted hover:text-text-secondary transition-colors rounded-lg hover:bg-surface-modal"
        aria-label="Dismiss location prompt"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}