import { useState, useCallback } from 'react'
import { listingsApi } from '@/services/api'
import type { Listing } from '@/types'

export function useHomeListings() {
  const [fresh, setFresh]     = useState<Listing[]>([])
  const [popular, setPopular] = useState<Listing[]>([])
  const [bestDeals, setBestDeals] = useState<Listing[]>([])
  const [isLoading, setLoading]   = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [f, p, b] = await Promise.all([
        listingsApi.getFresh(),
        listingsApi.getPopular(),
        listingsApi.getBestDeals(),
      ])
      setFresh(f)
      setPopular(p)
      setBestDeals(b)
    } finally {
      setLoading(false)
    }
  }, [])

  return { fresh, popular, bestDeals, isLoading, fetchAll }
}
