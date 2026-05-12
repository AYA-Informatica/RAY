import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { ListingGrid } from '@/components/organisms/ListingGrid'
import { FilterChip } from '@/components/molecules/FilterChip'
import { useSearch } from '@/hooks/useListings'
import { useListingsStore } from '@/store/listingsStore'
import { CATEGORY_MAP, CATEGORIES } from '@/constants/categories'
import { CATEGORY_FIELDS } from '@/constants/categoryFields'
import type { ListingCategory } from '@/types'

export const CategoryPage = () => {
  const { id } = useParams<{ id: string }>()
  const cat = CATEGORY_MAP[id as ListingCategory]
  const { results, isSearching, setFilters } = useListingsStore()
  const { search } = useSearch()
  const [metaFilters, setMetaFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    setFilters({ category: id as ListingCategory, page: 1 })
    search({ category: id as ListingCategory, sortBy: 'newest', page: 1, limit: 20, meta: metaFilters })
  }, [id, metaFilters, setFilters, search])

  if (!cat) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="font-display font-bold text-xl text-text-primary mb-2">Category not found</h1>
        <Link to="/" className="text-primary text-sm font-sans hover:underline">Back to home</Link>
      </main>
    )
  }

  return (
    <>
      <Helmet>
        <title>{`${cat.label} for Sale in Kigali | RAY`}</title>
        <meta
          name="description"
          content={`Browse ${cat.label.toLowerCase()} listings in Kigali and Rwanda. Buy and sell ${cat.label.toLowerCase()} fast on RAY.`}
        />
      </Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm font-sans text-text-secondary mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-text-primary font-semibold">{cat.label}</span>
        </nav>

        <div className="flex gap-6">
          {/* Sidebar — desktop only */}
          {CATEGORY_FIELDS[id as string]?.length > 0 && (
            <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
              <div className="bg-surface-card rounded-3xl p-5 flex flex-col gap-4 sticky top-24">
                {/* Subcategories */}
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-text-secondary font-sans uppercase tracking-wider mb-1">
                    Subcategory
                  </p>
                  <FilterChip
                    label="All"
                    active={true}
                    onClick={() => {}}
                  />
                  {cat.subcategories.map((sub) => (
                    <FilterChip
                      key={sub}
                      label={sub}
                      active={false}
                      onClick={() => {}}
                    />
                  ))}
                </div>

                {/* Meta filters */}
                {CATEGORY_FIELDS[id as string]
                  .filter((f) => f.type === 'select')
                  .map((field) => (
                    <div key={field.key} className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-text-secondary font-sans uppercase tracking-wider">
                        {field.label}
                      </p>
                      <div className="flex flex-col gap-1">
                        {field.options?.map((opt) => (
                          <label
                            key={opt}
                            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl cursor-pointer hover:bg-surface-modal transition-colors"
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
                              className="accent-primary w-3.5 h-3.5"
                            />
                            <span className="text-xs font-sans text-text-secondary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Category header */}
            <div className="flex items-center gap-4">
              <span className="text-5xl">{cat.emoji}</span>
              <div>
                <h1 className="font-display font-bold text-2xl text-text-primary">{cat.label}</h1>
                <p className="text-sm text-text-secondary font-sans mt-0.5">
                  Browse all {cat.label.toLowerCase()} listings in Rwanda
                </p>
              </div>
            </div>

            {/* Subcategory chips - mobile only */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <FilterChip
                label="All"
                active={true}
                onClick={() => {}}
              />
              {cat.subcategories.map((sub) => (
                <FilterChip
                  key={sub}
                  label={sub}
                  active={false}
                  onClick={() => {}}
                />
              ))}
            </div>

            {/* Other categories quick-jump */}
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.filter((c) => c.id !== id).map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.id}`}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border flex-shrink-0',
                    'text-xs font-sans text-text-secondary hover:border-primary hover:text-primary transition-colors'
                  )}
                >
                  <span>{c.emoji}</span>
                  {c.label}
                </Link>
              ))}
            </div>

            {/* Results */}
            <ListingGrid
              listings={results}
              loading={isSearching}
              layout="grid"
              columns={3}
              skeletonCount={9}
              emptyMessage={`No ${cat.label.toLowerCase()} listings yet. Be the first to post!`}
            />

            <div className="h-8" />
          </div>
        </div>
      </main>
    </>
  )
}
