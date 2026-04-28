import { Helmet } from 'react-helmet-async'
import { Check, Zap, TrendingUp, Award } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/atoms'

interface PlanCardProps {
  name: string
  price: number
  duration: string
  benefits: string[]
  icon: React.ReactNode
  isPopular?: boolean
  onSelect: () => void
}

const PlanCard = ({ name, price, duration, benefits, icon, isPopular, onSelect }: PlanCardProps) => (
  <div
    className={clsx(
      'relative flex flex-col gap-6 p-6 rounded-3xl border transition-all',
      isPopular
        ? 'bg-primary/5 border-primary shadow-primary'
        : 'bg-surface-card border-border hover:border-primary/50'
    )}
  >
    {isPopular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full">
        <span className="text-xs font-bold text-white font-sans uppercase tracking-wide">Most Popular</span>
      </div>
    )}
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-2xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <h3 className="font-display font-bold text-text-primary text-xl">{name}</h3>
        <p className="text-sm text-text-secondary font-sans">{duration}</p>
      </div>
    </div>
    <div>
      <span className="text-4xl font-display font-bold text-primary">Rwf {price.toLocaleString()}</span>
    </div>
    <ul className="flex flex-col gap-3">
      {benefits.map((benefit, i) => (
        <li key={i} className="flex items-start gap-2">
          <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <span className="text-sm text-text-primary font-sans">{benefit}</span>
        </li>
      ))}
    </ul>
    <Button fullWidth size="lg" variant={isPopular ? 'primary' : 'secondary'} onClick={onSelect}>
      Select Plan
    </Button>
  </div>
)

export const PremiumPage = () => {
  const handleSelectPlan = (planName: string) => {
    alert(`${planName} selected - Payment integration coming soon`)
  }

  return (
    <>
      <Helmet>
        <title>Go Premium | RAY</title>
      </Helmet>

      <main className="min-h-screen flex flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy px-6 py-16 flex flex-col items-center justify-center text-center gap-6">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <h1 className="font-display font-bold text-white text-5xl sm:text-6xl tracking-tight">RAY</h1>
            <p className="text-2xl sm:text-3xl font-display font-bold text-white">Sell 3x Faster</p>
            <p className="text-lg text-white/80 font-sans max-w-2xl">
              Get more visibility, reach more buyers, and close deals faster with RAY Premium
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlanCard
              name="Featured Listing"
              price={499}
              duration="7 days"
              icon={<Zap className="w-6 h-6" />}
              benefits={[
                'Appear at the top of search results',
                'Get 3x more views',
                'Featured badge on your listing',
                'Priority in category pages',
              ]}
              onSelect={() => handleSelectPlan('Featured Listing')}
            />
            <PlanCard
              name="Top Ad"
              price={999}
              duration="14 days"
              icon={<TrendingUp className="w-6 h-6" />}
              isPopular
              benefits={[
                'Everything in Featured Listing',
                'Highlighted with orange border',
                'Shown in homepage carousel',
                'Double the visibility duration',
                'Priority customer support',
              ]}
              onSelect={() => handleSelectPlan('Top Ad')}
            />
            <PlanCard
              name="Elite Seller"
              price={9900}
              duration="30 days"
              icon={<Award className="w-6 h-6" />}
              benefits={[
                'All listings featured automatically',
                'Elite Seller badge on profile',
                'Unlimited listing posts',
                'Priority in all searches',
                'Dedicated account manager',
                'Advanced analytics dashboard',
              ]}
              onSelect={() => handleSelectPlan('Elite Seller')}
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-surface-card border-t border-border px-4 sm:px-6 py-12">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <h2 className="font-display font-bold text-text-primary text-2xl text-center">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  q: 'How does payment work?',
                  a: 'You can pay via Mobile Money (MTN, Airtel) or bank card. Payment is secure and instant.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes, you can cancel your subscription at any time. Your benefits will remain active until the end of the billing period.',
                },
                {
                  q: 'What happens after my plan expires?',
                  a: 'Your listing will return to normal visibility. You can renew anytime to regain premium benefits.',
                },
                {
                  q: 'Do I get a refund if my item sells early?',
                  a: 'Premium plans are non-refundable, but you can use the remaining time for other listings.',
                },
              ].map((faq, i) => (
                <div key={i} className="p-5 bg-surface-modal rounded-2xl">
                  <p className="font-semibold text-text-primary font-sans mb-2">{faq.q}</p>
                  <p className="text-sm text-text-secondary font-sans">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
