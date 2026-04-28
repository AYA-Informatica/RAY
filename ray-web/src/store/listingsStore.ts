import { create } from 'zustand'
import type { Listing, SearchFilters, SortOption } from '@/types'

interface ListingsState {
  // Search state
  filters: SearchFilters
  results: Listing[]
  total: number
  isSearching: boolean
  hasMore: boolean

  // Home sections
  freshListings: Listing[]
  popularListings: Listing[]
  bestDeals: Listing[]
  isLoadingHome: boolean

  // Saved / favourites
  savedIds: Set<string>

  // Actions
  setFilters: (filters: Partial<SearchFilters>) => void
  setResults: (listings: Listing[], total: number, append?: boolean) => void
  setSearching: (loading: boolean) => void
  setHomeListings: (data: {
    fresh: Listing[]
    popular: Listing[]
    bestDeals: Listing[]
  }) => void
  setLoadingHome: (loading: boolean) => void
  toggleSaved: (listingId: string) => void
  isSaved: (listingId: string) => boolean
  resetSearch: () => void
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  sortBy: 'newest' as SortOption,
  page: 1,
  limit: 20,
}

export const useListingsStore = create<ListingsState>()((set, get) => ({
  filters: DEFAULT_FILTERS,
  results: [],
  total: 0,
  isSearching: false,
  hasMore: false,

  freshListings: [],
  popularListings: [],
  bestDeals: [],
  isLoadingHome: false,

  savedIds: new Set(),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setResults: (listings, total, append = false) =>
    set((state) => ({
      results: append ? [...state.results, ...listings] : listings,
      total,
      hasMore: append
        ? state.results.length + listings.length < total
        : listings.length < total,
    })),

  setSearching: (loading) => set({ isSearching: loading }),

  setHomeListings: ({ fresh, popular, bestDeals }) =>
    set({
      freshListings: fresh,
      popularListings: popular,
      bestDeals,
      isLoadingHome: false,
    }),

  setLoadingHome: (loading) => set({ isLoadingHome: loading }),

  toggleSaved: (listingId) =>
    set((state) => {
      const next = new Set(state.savedIds)
      if (next.has(listingId)) {
        next.delete(listingId)
      } else {
        next.add(listingId)
      }
      return { savedIds: next }
    }),

  isSaved: (listingId) => get().savedIds.has(listingId),

  resetSearch: () =>
    set({
      filters: DEFAULT_FILTERS,
      results: [],
      total: 0,
      hasMore: false,
    }),
}))
