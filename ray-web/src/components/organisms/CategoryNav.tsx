import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { CATEGORIES } from '@/constants/categories'

interface CategoryNavProps {
  activeCategory?: string
  className?: string
  /** Show as a full grid (home page) vs horizontal scroll row */
  layout?: 'grid' | 'scroll'
}

/**
 * CategoryNav organism — renders the category grid/scroll.
 * Matches wireframe: emoji icon + label + listing count.
 */
export const CategoryNav = ({
  activeCategory,
  className,
  layout = 'grid',
}: CategoryNavProps) => {
  if (layout === 'scroll') {
    return (
      <div className={clsx('flex gap-3 overflow-x-auto pb-1 scrollbar-hide', className)}>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className={clsx(
              'flex flex-col items-center gap-1.5 flex-shrink-0 px-3 py-2 rounded-2xl',
              'border transition-all duration-150 min-w-[72px]',
              activeCategory === cat.id
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-surface-modal border-border text-text-secondary hover:border-primary hover:text-primary'
            )}
          >
            <span className="text-2xl leading-none">{cat.emoji}</span>
            <span className="text-xs font-semibold font-sans whitespace-nowrap">{cat.label}</span>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3',
        className
      )}
    >
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.id}
          to={`/category/${cat.id}`}
          className={clsx(
            'flex flex-col items-center gap-2 p-3 rounded-2xl border',
            'transition-all duration-150 group',
            activeCategory === cat.id
              ? 'bg-primary/10 border-primary'
              : 'bg-surface-card border-border hover:border-primary hover:bg-primary/5'
          )}
        >
          <span className="text-3xl leading-none group-hover:scale-110 transition-transform duration-200">
            {cat.emoji}
          </span>
          <div className="text-center">
            <p
              className={clsx(
                'text-xs font-semibold font-sans leading-tight',
                activeCategory === cat.id ? 'text-primary' : 'text-text-primary'
              )}
            >
              {cat.label}
            </p>
            {cat.listingCount !== undefined && (
              <p className="text-[10px] text-text-muted font-sans mt-0.5">
                {cat.listingCount >= 1000
                  ? `${(cat.listingCount / 1000).toFixed(1)}k`
                  : cat.listingCount}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
