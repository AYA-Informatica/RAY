import { useEffect } from 'react'
import { Zap } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { ListingGrid } from '@/components/organisms/ListingGrid'
import { CategoryNav } from '@/components/organisms/CategoryNav'
import { Button } from '@/components/atoms/Button'
import { useHomeListings } from '@/hooks/useListings'
import { STRINGS } from '@/constants/strings'
import { LocationPrompt } from '@/components/molecules/LocationPrompt'

/**
 * HomePage — main feed.
 * Sections: Hero search (in Navbar) → Categories → Promo banner → Fresh → Popular → Best Deals
 */
export const HomePage = () => {
  const { fresh, popular, bestDeals, isLoading, fetchAll } = useHomeListings()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return (
    <>
      <Helmet>
        <title>RAY — Buy &amp; Sell Anything Near You in Kigali</title>
        <meta
          name="description"
          content="The fastest way to buy and sell locally in Kigali, Rwanda. Browse mobiles, cars, furniture, properties and more near you."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="RAY — Buy & Sell Anything Near You in Kigali" />
        <meta property="og:description" content="The fastest way to buy and sell locally in Kigali, Rwanda." />
        <meta property="og:image" content="https://ray.rw/ray-icon.svg" />
        <meta property="og:url" content="https://ray.rw/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">

        {/* ── Location Prompt ── */}
        <LocationPrompt context="home" className="mb-2" />

        {/* ── Categories ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold text-text-primary tracking-tight">
            {STRINGS.home.browseCategories}
          </h2>
          <CategoryNav layout="grid" />
        </section>

        {/* ── Premium promo banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-5 flex items-center justify-between gap-4">
          {/* Decorative blobs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-warning" />
              <h3 className="font-display font-bold text-white text-base">
                {STRINGS.home.sellFasterWithPremium}
              </h3>
            </div>
            <p className="text-sm text-white/70 font-sans">{STRINGS.home.premiumBenefit}</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="relative z-10 flex-shrink-0"
            onClick={() => {}}
          >
            {STRINGS.home.upgradeNow}
          </Button>
        </div>

        {/* ── Fresh Near You ── */}
        <ListingGrid
          title={STRINGS.home.freshNearYou}
          seeAllHref="/search?sort=newest"
          listings={fresh}
          loading={isLoading}
          layout="scroll"
          skeletonCount={4}
        />

        {/* ── Popular in Kigali ── */}
        <ListingGrid
          title={STRINGS.home.popularInKigali}
          seeAllHref="/search?sort=popular"
          listings={popular}
          loading={isLoading}
          layout="grid"
          columns={2}
          skeletonCount={6}
        />

        {/* ── Best Deals Today ── */}
        <ListingGrid
          title={STRINGS.home.bestDealsToday}
          seeAllHref="/search?sort=price_asc"
          listings={bestDeals}
          loading={isLoading}
          layout="scroll"
          skeletonCount={4}
        />

        {/* Bottom spacer for mobile nav */}
        <div className="h-8" />
      </main>
    </>
  )
}
