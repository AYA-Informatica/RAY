import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as ExpoLocation from 'expo-location'
import { getCoordsForNeighborhood } from '../constants/neighborhoodCoords'

export type LocationPermission = 'granted' | 'denied' | 'prompt' | 'unknown'

export interface UserLocation {
  lat: number
  lng: number
  displayLabel: string
  source: 'gps' | 'manual'
  obtainedAt: string    // ISO timestamp
}

interface LocationState {
  userLocation: UserLocation | null
  permission: LocationPermission
  isRequesting: boolean
  promptDismissed: boolean       // user dismissed the soft prompt
  promptShownAt: string | null   // ISO timestamp of last prompt

  // Actions
  requestGpsLocation: () => Promise<UserLocation | null>
  setManualLocation: (displayLabel: string) => UserLocation | null
  setLocation: (location: UserLocation) => void
  clearLocation: () => void
  setPermission: (permission: LocationPermission) => void
  dismissPrompt: () => void
  resetPromptDismissal: () => void
  shouldShowPrompt: () => boolean
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      userLocation:    null,
      permission:      'unknown',
      isRequesting:    false,
      promptDismissed: false,
      promptShownAt:   null,

      requestGpsLocation: async () => {
        set({ isRequesting: true })
        try {
          const { status } = await ExpoLocation.requestForegroundPermissionsAsync()
          if (status !== 'granted') {
            set({ permission: 'denied', isRequesting: false })
            return null
          }
          const pos = await ExpoLocation.getCurrentPositionAsync({
            accuracy: ExpoLocation.Accuracy.Balanced,
          })
          const location: UserLocation = {
            lat:          pos.coords.latitude,
            lng:          pos.coords.longitude,
            displayLabel: 'Your current location',
            source:       'gps',
            obtainedAt:   new Date().toISOString(),
          }
          set({ userLocation: location, permission: 'granted', isRequesting: false })
          return location
        } catch {
          set({ permission: 'denied', isRequesting: false })
          return null
        }
      },

      setManualLocation: (displayLabel: string) => {
        const coords = getCoordsForNeighborhood(displayLabel)
        if (!coords) return null
        const location: UserLocation = {
          ...coords,
          displayLabel,
          source:     'manual',
          obtainedAt: new Date().toISOString(),
        }
        set({ userLocation: location })
        return location
      },

      setLocation: (location) => set({ userLocation: location }),
      clearLocation: () => set({ userLocation: null }),
      setPermission: (permission) => set({ permission }),

      dismissPrompt: () =>
        set({ promptDismissed: true, promptShownAt: new Date().toISOString() }),

      resetPromptDismissal: () =>
        set({ promptDismissed: false, promptShownAt: null }),

      shouldShowPrompt: () => {
        const { promptDismissed, promptShownAt, userLocation, permission } = get()
        if (userLocation) return false            // already have location
        if (permission === 'denied') return false // user denied — don't pester
        if (!promptDismissed) return true         // never dismissed — show it

        // Show again after 24 hours
        if (promptShownAt) {
          const hoursSince =
            (Date.now() - new Date(promptShownAt).getTime()) / 3600000
          return hoursSince >= 24
        }
        return false
      },
    }),
    {
      name: 'ray-location',
      partialize: (state) => ({
        userLocation:    state.userLocation,
        permission:      state.permission,
        promptDismissed: state.promptDismissed,
        promptShownAt:   state.promptShownAt,
      }),
    }
  )
)