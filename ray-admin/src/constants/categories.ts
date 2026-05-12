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
    label: 'Mobiles & Tablets',
    labelKin: 'Telefone',
    emoji: '📱',
    subcategories: ['Smartphones', 'Tablets', 'Feature Phones', 'Accessories', 'SIM Cards'],
  },
  {
    id: 'electronics',
    label: 'Electronics',
    labelKin: 'Ikoranabuhanga',
    emoji: '💻',
    subcategories: ['Laptops & Computers', 'TVs & Monitors', 'Cameras', 'Audio & Speakers', 'Gaming', 'Printers & Office', 'Other Electronics'],
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    labelKin: 'Imodoka',
    emoji: '🚗',
    subcategories: ['Cars', 'Motorcycles & Scooters', 'Trucks & Buses', 'Boats', 'Spare Parts & Accessories', 'Other Vehicles'],
  },
  {
    id: 'property',
    label: 'Property',
    labelKin: 'Inzu',
    emoji: '🏠',
    subcategories: ['Houses for Sale', 'Houses for Rent', 'Apartments for Sale', 'Apartments for Rent', 'Land for Sale', 'Commercial Space', 'Short Stay / Airbnb'],
  },
  {
    id: 'fashion',
    label: 'Fashion',
    labelKin: "Imyambaro",
    emoji: '👗',
    subcategories: ["Women's Clothing", "Men's Clothing", 'Kids Clothing', 'Shoes', 'Bags & Luggage', 'Jewelry & Watches', 'Accessories'],
  },
  {
    id: 'furniture',
    label: 'Furniture & Home',
    labelKin: 'Imbaho',
    emoji: '🛋️',
    subcategories: ['Sofas & Living Room', 'Beds & Bedrooms', 'Kitchen & Dining', 'Office Furniture', 'Appliances', 'Home Decor', 'Garden & Outdoor'],
  },
  {
    id: 'food',
    label: 'Food & Agriculture',
    labelKin: 'Amazi n\'ibinyobwa',
    emoji: '🌾',
    subcategories: ['Fresh Produce & Vegetables', 'Fruits', 'Dairy & Eggs', 'Meat & Poultry', 'Packaged & Processed Food', 'Beverages', 'Farm Inputs', 'Livestock & Poultry'],
  },
  {
    id: 'services',
    label: 'Services',
    labelKin: 'Serivisi',
    emoji: '🔧',
    subcategories: ['Repair & Maintenance', 'Cleaning & Laundry', 'Tutoring & Education', 'Events & Entertainment', 'Beauty & Salon', 'Photography', 'Transport & Delivery', 'IT & Tech Services', 'Other Services'],
  },
  {
    id: 'jobs',
    label: 'Jobs',
    labelKin: 'Akazi',
    emoji: '💼',
    subcategories: ['Full-time', 'Part-time', 'Freelance & Contract', 'Internship', 'Domestic & Household', 'Driving & Delivery', 'Healthcare', 'Other Jobs'],
  },
  {
    id: 'health',
    label: 'Health & Beauty',
    labelKin: 'Ubuzima n\'ubwiza',
    emoji: '💊',
    subcategories: ['Skincare & Beauty', 'Supplements & Vitamins', 'Medical Equipment', 'Fitness & Wellness', 'Pharmacy & Medicine', 'Other Health'],
  },
  {
    id: 'sports',
    label: 'Sports & Leisure',
    labelKin: 'Imikino',
    emoji: '⚽',
    subcategories: ['Football & Team Sports', 'Gym Equipment', 'Bicycles', 'Outdoor & Camping', 'Water Sports', 'Hobbies & Games', 'Other Sports'],
  },
  {
    id: 'kids',
    label: 'Kids & Baby',
    labelKin: 'Abana',
    emoji: '🧸',
    subcategories: ['Toys & Games', 'Baby Gear & Strollers', 'Baby Clothing', 'School Supplies', 'Kids Furniture', 'Other Kids'],
  },
]

export const CATEGORY_MAP: Record<ListingCategory, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<ListingCategory, CategoryMeta>