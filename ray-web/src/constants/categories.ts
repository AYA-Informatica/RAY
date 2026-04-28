import type { ListingCategory } from '@/types'

export interface CategoryMeta {
  id: ListingCategory
  label: string
  labelKin: string
  emoji: string
  subcategories: string[]
  listingCount?: number
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'mobiles',
    label: 'Mobiles',
    labelKin: 'Telefone',
    emoji: '📱',
    subcategories: ['Smartphones', 'Feature Phones', 'Tablets', 'Accessories', 'SIM Cards'],
  },
  {
    id: 'cars',
    label: 'Cars',
    labelKin: 'Imodoka',
    emoji: '🚗',
    subcategories: ['Sedans', 'SUVs', 'Trucks', 'Buses', 'Motorcycles', 'Parts & Accessories'],
  },
  {
    id: 'properties',
    label: 'Properties',
    labelKin: 'Inzu',
    emoji: '🏠',
    subcategories: ['Houses for Sale', 'Houses for Rent', 'Apartments', 'Land', 'Commercial'],
  },
  {
    id: 'electronics',
    label: 'Electronics',
    labelKin: 'Ikoranabuhanga',
    emoji: '💻',
    subcategories: ['Laptops', 'Desktops', 'TVs', 'Cameras', 'Audio', 'Gaming'],
  },
  {
    id: 'fashion',
    label: 'Fashion',
    labelKin: "Imyambaro",
    emoji: '👗',
    subcategories: ["Women's Clothing", "Men's Clothing", 'Kids', 'Shoes', 'Bags', 'Jewelry'],
  },
  {
    id: 'furniture',
    label: 'Furniture',
    labelKin: 'Imbaho',
    emoji: '🛋️',
    subcategories: ['Sofas', 'Beds', 'Wardrobes', 'Tables & Chairs', 'Kitchen', 'Office'],
  },
  {
    id: 'jobs',
    label: 'Jobs',
    labelKin: 'Akazi',
    emoji: '💼',
    subcategories: ['Full-time', 'Part-time', 'Freelance', 'Internship', 'Domestic'],
  },
  {
    id: 'services',
    label: 'Services',
    labelKin: 'Serivisi',
    emoji: '🔧',
    subcategories: ['Repair', 'Cleaning', 'Tutoring', 'Health & Beauty', 'Events', 'Transport'],
  },
]

export const CATEGORY_MAP: Record<ListingCategory, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<ListingCategory, CategoryMeta>
