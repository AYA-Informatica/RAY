/** Display metadata for the launch categories (mirrors prisma/seed.ts). */
export const LAUNCH_CATEGORIES = [
  { slug: "phones", name: "Phones", icon: "📱" },
  { slug: "electronics", name: "Electronics", icon: "💻" },
  { slug: "cars", name: "Cars", icon: "🚗" },
  { slug: "bikes", name: "Bikes", icon: "🚲" },
  { slug: "rentals", name: "Rentals", icon: "🏠" },
  { slug: "furniture", name: "Furniture", icon: "🛋️" },
  { slug: "fashion", name: "Fashion", icon: "👕" },
  { slug: "jobs", name: "Jobs", icon: "💼" },
  { slug: "services", name: "Services", icon: "🛠️" },
  { slug: "kids", name: "Kids", icon: "👶" },
] as const;
