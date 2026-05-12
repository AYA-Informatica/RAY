import { useEffect, useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { SlidersHorizontal, X, Navigation } from 'lucide-react'
import { clsx } from 'clsx'
import { ListingGrid } from '@/components/organisms/ListingGrid'
import { FilterChip } from '@/components/molecules/FilterChip'
import { Button } from '@/components/atoms/Button'
import { useSearch } from '@/hooks/useListings'
import { useListingsStore } from '@/store/listingsStore'
import { useLocationStore } from '@/store/locationStore'
import { STRINGS } from '@/constants/strings'
import { CATEGORIES } from '@/constants/categories'
import { CATEGORY_FIELDS } from '@/constants/categoryFields'
import type { SortOption, ListingCondition } from '@/types'
import { LocationPrompt } from '@/components/molecules/LocationPrompt'

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: STRINGS.search.sort.newest, value: 'newest' },
  { label: STRINGS.search.sort.price_asc, value: 'price_asc' },
  { label: STRINGS.search.sort.price_desc, value: 'price_desc' },
  { label: STRINGS.search.sort.nearest, value: 'nearest' },
]

const CONDITIONS: { label: string; value: ListingCondition }[] = [
  { label: 'New', value: 'new' },
  { label: 'Like New', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
]

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { filters, setFilters, results, total, isSearching } = useListingsStore()
  const { search } = useSearch()
  const { userLocation, requestGpsLocation, shouldShowPrompt } = useLocationStore()
  const [metaFilters, setMetaFilters] = useState<Record<string, string>>({})
  const [showMetaPanel, setShowMetaPanel] = useState(false)

  const q = searchParams.get('q') ?? ''
  const cat = searchParams.get('cat') ?? ''
  const sort = (searchParams.get('sort') as SortOption) ?? 'newest'

  // Sync URL params → store
  useEffect(() => {
    setFilters({
      query: q,
      category: cat as never || undefined,
      sortBy: sort,
      page: 1,
    })
  }, [q, cat, sort, setFilters])

  // Trigger search when filters change
  useEffect(() => {
    console.log('[SearchResults] 🔍 Triggering search with filters', filters)
    search({ ...filters, meta: metaFilters })
  }, [filters, metaFilters, search])

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams)
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      next.set('page', '1')
      setSearchParams(next)
    },
    [searchParams, setSearchParams]
  )

  const toggleCondition = (condition: ListingCondition) => {
    const current = filters.condition ?? []
    const next = current.includes(condition)
      ? current.filter((c) => c !== condition)
      : [...current, condition]
    setFilters({ condition: next.length > 0 ? next : undefined })
    search({ ...filters, condition: next.length > 0 ? next : undefined })
  }

  return (
    <>
      <Helmet>
        <title>
          {q ? `"${q}" — Search Results | RAY` : 'Browse Listings | RAY'}
        </title>
      </Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* ── Sidebar filters (desktop) ── */}
          <aside className="hidden lg:flex flex-col gap-5 w-64 flex-shrink-0">
            <div className="bg-surface-card rounded-3xl p-5 flex flex-col gap-5 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-text-primary">
                  {STRINGS.search.filters}
                </h3>
                <button
                  onClick={() => {
                    setFilters({ category: undefined, condition: undefined, minPrice: undefined, maxPrice: undefined })
                    setMetaFilters({})
                    setSearchParams(new URLSearchParams(q ? { q } : {}))
                  }}
                  className="text-xs text-primary hover:text-primary-dark font-sans font-semibold"
                >
                  Clear all
                </button>
              </div>

              {/* Distance filter */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary font-sans uppercase tracking-wider">
                  Distance
                </p>

                {!userLocation ? (
                  // No location — offer a soft prompt inline
                  <button
                    onClick={requestGpsLocation}
                    className="flex items-center gap-2 px-3 py-2.5 bg-surface-modal border border-dashed border-border rounded-xl text-sm font-sans text-text-secondary hover:border-primary hover:text-primary transition-colors w-full"
                  >
                    <Navigation className="w-4 h-4 flex-shrink-0" />
                    Enable location for distance filter
                  </button>
                ) : (
                  <div className="flex flex-col gap-1">
                    {([
                      { label: 'Any distance', value: undefined },
                      { label: 'Within 10 km', value: 10 },
                      { label: 'Within 20 km', value: 20 },
                      { label: 'Within 30 km', value: 30 },
                      { label: 'Within 50 km', value: 50 },
                    ] as { label: string; value: number | undefined }[]).map(({ label, value }) => (
                      <label
                        key={label}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-surface-modal transition-colors"
                      >
                        <input
                          type="radio"
                          name="distance"
                          checked={filters.distanceKm === value}
                          onChange={() => {
                            setFilters({
                              distanceKm: value as SearchFilters['distanceKm'],
                              userLat:    value !== undefined ? userLocation.lat : undefined,
                              userLng:    value !== undefined ? userLocation.lng : undefined,
                              sortBy:     value !== undefined ? 'nearest' : filters.sortBy,
                            })
                          }}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm font-sans text-text-secondary">{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary font-sans uppercase tracking-wider">
                  Category
                </p>
                <div className="flex flex-col gap-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateParam('cat', c.id === cat ? null : c.id)}
                      className={clsx(
                        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-sans text-left',
                        'transition-colors duration-150',
                        cat === c.id
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-modal'
                      )}
                    >
                      <span className="text-base">{c.emoji}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary font-sans uppercase tracking-wider">
                  Price (Rwf)
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice ?? ''}
                    onChange={(e) =>
                      setFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="flex-1 h-9 px-3 bg-surface-modal border border-border rounded-xl text-sm font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-text-muted font-sans text-sm">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice ?? ''}
                    onChange={(e) =>
                      setFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="flex-1 h-9 px-3 bg-surface-modal border border-border rounded-xl text-sm font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary font-sans uppercase tracking-wider">
                  Condition
                </p>
                <div className="flex flex-col gap-1">
                  {CONDITIONS.map(({ label, value }) => {
                    const checked = filters.condition?.includes(value) ?? false
                    return (
                      <label
                        key={value}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-surface-modal transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCondition(value)}
                          className="w-4 h-4 accent-primary rounded"
                        />
                        <span className="text-sm font-sans text-text-secondary">{label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Category-specific meta filters */}
              {cat && CATEGORY_FIELDS[cat]?.filter((f) => f.type === 'select').length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="w-full h-px bg-border" />
                  <p className="text-xs font-semibold text-text-secondary font-sans uppercase tracking-wider">
                    More Filters
                  </p>
                  {CATEGORY_FIELDS[cat]
                    .filter((f) => f.type === 'select')
                    .map((field) => (
                      <div key={field.key} className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-text-secondary font-sans capitalize">
                          {field.label}
                        </p>
                        <div className="flex flex-col gap-1">
                          {field.options?.map((opt) => (
                            <label
                              key={opt}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-surface-modal transition-colors"
                            >
                              <input
                                type="radio"
                                name={field.key}
                                value={opt}
                                checked={metaFilters[field.key] === opt}
                                onChange={() =>
                                  setMetaFilters((prev) => ({
                                    ...prev,
                                    [field.key]: prev[field.key] === opt ? '' : opt,
                                  }))
                                }
                                className="accent-primary w-4 h-4"
                              />
                              <span className="text-sm font-sans text-text-secondary">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <Button
                fullWidth
                onClick={() => search({ ...filters, meta: metaFilters })}
                loading={isSearching}
              >
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* ── Main results area ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Mobile filter bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide lg:hidden">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface-modal text-sm font-sans text-text-secondary flex-shrink-0 hover:border-primary">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
              {CATEGORIES.filter((c) => cat === c.id).map((c) => (
                <FilterChip
                  key={c.id}
                  label={c.label}
                  active
                  removable
                  onRemove={() => updateParam('cat', null)}
                />
              ))}
              {SORT_OPTIONS.filter((s) => s.value !== 'newest' && s.value === sort).map((s) => (
                <FilterChip
                  key={s.value}
                  label={s.label}
                  active
                  removable
                  onRemove={() => updateParam('sort', null)}
                />
              ))}
              {/* Mobile: More Filters chip */}
              {cat && CATEGORY_FIELDS[cat]?.filter((f) => f.type === 'select').length > 0 && (
                <FilterChip
                  label="More Filters"
                  active={Object.values(metaFilters).some(Boolean)}
                  onClick={() => setShowMetaPanel(true)}
                />
              )}
              {!userLocation && (
                <button
                  onClick={requestGpsLocation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-border bg-surface-modal text-xs font-sans text-text-muted hover:border-primary hover:text-primary transition-colors flex-shrink-0"
                >
                  <Navigation className="w-3 h-3" />
                  Near me
                </button>
              )}
              {userLocation && (
                <>
                  {([10, 20, 30, 50] as const).map((km) => (
                    <FilterChip
                      key={km}
                      label={`${km} km`}
                      active={filters.distanceKm === km}
                      removable={filters.distanceKm === km}
                      onClick={() =>
                        setFilters({
                          distanceKm: filters.distanceKm === km ? undefined : km,
                          userLat:    filters.distanceKm === km ? undefined : userLocation.lat,
                          userLng:    filters.distanceKm === km ? undefined : userLocation.lng,
                          sortBy:     filters.distanceKm === km ? 'newest' : 'nearest',
                        })
                      }
                      onRemove={() =>
                        setFilters({ distanceKm: undefined, userLat: undefined, userLng: undefined, sortBy: 'newest' })
                      }
                    />
                  ))}
                </>
              )}
            </div>

            {/* Mobile meta filters panel */}
            {showMetaPanel && (
              <>
                <div
                  className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                  onClick={() => setShowMetaPanel(false)}
                />
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card rounded-t-3xl border-t border-border p-6 flex flex-col gap-4 lg:hidden animate-slide-up">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-text-primary">More Filters</h3>
                    <button
                      onClick={() => setShowMetaPanel(false)}
                      className="text-text-muted hover:text-text-primary transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  {CATEGORY_FIELDS[cat]
                    .filter((f) => f.type === 'select')
                    .map((field) => (
                      <div key={field.key} className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-text-primary font-sans">{field.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {field.options?.map((opt) => (
                            <FilterChip
                              key={opt}
                              label={opt}
                              active={metaFilters[field.key] === opt}
                              onClick={() =>
                                setMetaFilters((prev) => ({
                                  ...prev,
                                  [field.key]: prev[field.key] === opt ? '' : opt,
                                }))
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  <Button
                    fullWidth
                    onClick={() => {
                      search({ ...filters, meta: metaFilters })
                      setShowMetaPanel(false)
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </>
            )}

            {/* Results header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                {q && (
                  <h1 className="text-lg font-display font-bold text-text-primary">
                    Results for{' '}
                    <span className="text-primary">&ldquo;{q}&rdquo;</span>
                  </h1>
                )}
                {!isSearching && (
                  <p className="text-sm text-text-secondary font-sans">
                    {STRINGS.search.resultsCount(total)}
                  </p>
                )}
              </div>

              {/* Sort dropdown */}
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="h-9 px-3 pr-8 bg-surface-modal border border-border rounded-xl text-sm font-sans text-text-primary focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Prompt */}
            <LocationPrompt context="search" className="mb-4" />

            {/* Active filter chips */}
            {(filters.condition?.length || filters.minPrice || filters.maxPrice || Object.values(metaFilters).some(Boolean)) && (
              <div className="flex flex-wrap gap-2">
                {filters.condition?.map((c) => (
                  <FilterChip
                    key={c}
                    label={STRINGS.listing.condition[c]}
                    active
                    removable
                    onRemove={() => toggleCondition(c)}
                  />
                ))}
                {(filters.minPrice || filters.maxPrice) && (
                  <FilterChip
                    label={`Rwf ${filters.minPrice ?? 0} – ${filters.maxPrice ?? '∞'}`}
                    active
                    removable
                    onRemove={() => setFilters({ minPrice: undefined, maxPrice: undefined })}
                  />
                )}
                {Object.entries(metaFilters)
                  .filter(([, v]) => v)
                  .map(([key, value]) => (
                    <FilterChip
                      key={key}
                      label={value}
                      active
                      removable
                      onRemove={() => setMetaFilters((prev) => ({ ...prev, [key]: '' }))}
                    />
                  ))}
                <button
                  onClick={() => {
                    setFilters({ condition: undefined, minPrice: undefined, maxPrice: undefined })
                    setMetaFilters({})
                  }}
                  className="flex items-center gap-1 text-xs text-text-secondary hover:text-danger font-sans transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              </div>
            )}

            {/* Grid */}
            <ListingGrid
              listings={results}
              loading={isSearching}
              layout="grid"
              columns={3}
              skeletonCount={9}
              emptyMessage={
                q
                  ? `No results for "${q}". Try different keywords.`
                  : 'No listings match your filters.'
              }
            />

            {/* Load more */}
            {results.length > 0 && results.length < total && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({ page: filters.page + 1 })
                    search({ ...filters, page: filters.page + 1 }, true)
                  }}
                  loading={isSearching}
                >
                  Load more listings
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
