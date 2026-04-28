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
    setLoadingHome(true)
    try {
      const [fresh, popular, deals] = await Promise.all([
        listingsApi.getFresh(),
        listingsApi.getPopular(),
        listingsApi.getBestDeals(),
      ])
      setHomeListings({ fresh, popular, bestDeals: deals })
    } catch (err) {
      console.error('Failed to load home listings:', err)
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
      setSearching(true)
      try {
        const result = await listingsApi.search(filters)
        setResults(result.listings, result.total, append)
      } catch (err) {
        console.error('Search failed:', err)
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
  const { data: similar = [], isLoading } = useQuery({
    queryKey: ['similar', listingId],
    queryFn: () => listingsApi.getSimilar(listingId),
    enabled: !!listingId,
    staleTime: 1000 * 60 * 10,
  })

  return { similar, isLoading }
}
