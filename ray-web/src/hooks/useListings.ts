import { useCallback } from 'react'
import { listingsApi } from '@/services/api'
import { useListingsStore } from '@/store/listingsStore'
import { useQuery } from '@tanstack/react-query'
import type { SearchFilters } from '@/types'

// ─────────────────────────────────────────────
// useHomeListings — fetches all 3 home sections
// ─────────────────────────────────────────────
export function useHomeListings() {
  const { freshListings, popularListings, bestDeals, isLoadingHome, setHomeListings, setLoadingHome } =
    useListingsStore()

  const fetchAll = useCallback(async () => {
    console.log('[web.useListings] Fetching home listings')
    setLoadingHome(true)
    try {
      const [fresh, popular, deals] = await Promise.all([
        listingsApi.getFresh(),
        listingsApi.getPopular(),
        listingsApi.getBestDeals(),
      ])
      console.log('[web.useListings] Home listings fetched', {
        fresh: fresh.length,
        popular: popular.length,
        deals: deals.length,
      })
      setHomeListings({ fresh, popular, bestDeals: deals })
    } catch (err) {
      console.error('[web.useListings] Failed to load home listings:', err)
      setLoadingHome(false)
    }
  }, [setHomeListings, setLoadingHome])

  return {
    fresh: freshListings,
    popular: popularListings,
    bestDeals,
    isLoading: isLoadingHome,
    fetchAll,
  }
}

// ─────────────────────────────────────────────
// useSearch — drives the search results page
// ─────────────────────────────────────────────
export function useSearch() {
  const { setResults, setSearching } = useListingsStore()

  const search = useCallback(
    async (filters: Partial<SearchFilters>, append = false) => {
      console.log('[web.useListings] Searching listings', { filters, append })
      setSearching(true)
      try {
        const result = await listingsApi.search(filters)
        console.log('[web.useListings] Search completed', {
          total: result.total,
          returned: result.listings.length,
        })
        setResults(result.listings, result.total, append)
      } catch (err) {
        console.error('[web.useListings] Search failed:', err)
      } finally {
        setSearching(false)
      }
    },
    [setResults, setSearching]
  )

  return { search }
}

// ─────────────────────────────────────────────
// useListing — single listing detail
// ─────────────────────────────────────────────
export function useListing(id: string) {
  console.log('[web.useListings] Fetching listing', { id })
  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 min
  })

  return { listing, isLoading }
}

// ─────────────────────────────────────────────
// useSimilarListings
// ─────────────────────────────────────────────
export function useSimilarListings(listingId: string) {
  console.log('[web.useListings] Fetching similar listings', { listingId })
  const { data: similar = [], isLoading } = useQuery({
    queryKey: ['similar', listingId],
    queryFn: () => listingsApi.getSimilar(listingId),
    enabled: !!listingId,
    staleTime: 1000 * 60 * 10,
  })

  return { similar, isLoading }
}
