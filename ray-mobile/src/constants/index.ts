// ─── User-facing strings ─────────────────────
export const STRINGS = {
  app:  { name: 'RAY', tagline: 'Buy & Sell Anything Near You' },
  nav:  { home: 'Home', search: 'Search', sell: 'Sell', chats: 'Chats', profile: 'Profile' },
  home: {
    searchPlaceholder: 'Search for items, brands, categories...',
    browseCategories:  'Browse Categories',
    freshNearYou:      'Fresh Near You',
    popularInKigali:   'Popular in Kigali',
    bestDealsToday:    'Best Deals Today',
    seeAll:            'See all',
    premiumBanner:     'Sell Faster with Premium',
    premiumBenefit:    'Get 3x more visibility for your listings',
    upgradeNow:        'Upgrade Now',
  },
  listing: {
    chatWithSeller: 'Chat with Seller',
    viewProfile:    'View Profile',
    safetyTip:      'Meet in a public place. Do not send money upfront.',
    condition: { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair' },
    negotiable: 'Negotiable',
    featured:   'Featured',
  },
  postAd: {
    title:    'Post Your Ad',
    steps: ['Category', 'Photos', 'Details', 'Description', 'Location', 'Review'],
    nudge:    'Items with 3+ photos sell 4x faster',
    postNow:  'Post Now',
    continue: 'Continue',
    back:     'Back',
  },
  auth: {
    phoneTitle:    'Enter Your Phone Number',
    phoneSubtitle: 'We Will Send You a Verification Code',
    sendCode:      'SEND CODE',
    otpTitle:      'Enter Verification Code',
    verify:        'Verify',
    resend:        'Resend code',
  },
  chat: {
    title:      'Messages',
    inputPlaceholder: 'Write a message...',
    safetyBanner: 'Meet in a public place. Never send money before seeing the item.',
    quickReplies: [
      'Is this still available?',
      "What's the last price?",
      'Where can we meet?',
    ],
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Check your internet connection.',
    offline: "You're offline",
  },
  currency: {
    format: (n: number) => `Rwf ${n.toLocaleString()}`,
  },
} as const

// ─── Categories ─────────────────────────────
export const CATEGORIES = [
  { id: 'mobiles',     label: 'Mobiles',     emoji: '📱', subcategories: ['Smartphones', 'Tablets', 'Accessories'] },
  { id: 'cars',        label: 'Cars',        emoji: '🚗', subcategories: ['Sedans', 'SUVs', 'Motorcycles', 'Parts'] },
  { id: 'properties',  label: 'Properties',  emoji: '🏠', subcategories: ['For Sale', 'For Rent', 'Land', 'Commercial'] },
  { id: 'electronics', label: 'Electronics', emoji: '💻', subcategories: ['Laptops', 'TVs', 'Audio', 'Gaming'] },
  { id: 'fashion',     label: 'Fashion',     emoji: '👗', subcategories: ["Women's", "Men's", 'Kids', 'Shoes'] },
  { id: 'furniture',   label: 'Furniture',   emoji: '🛋️', subcategories: ['Sofas', 'Beds', 'Tables', 'Office'] },
  { id: 'jobs',        label: 'Jobs',        emoji: '💼', subcategories: ['Full-time', 'Part-time', 'Freelance'] },
  { id: 'services',    label: 'Services',    emoji: '🔧', subcategories: ['Repair', 'Cleaning', 'Events'] },
] as const

// ─── Kigali Neighborhoods ────────────────────
export const KIGALI_NEIGHBORHOODS = [
  { name: 'Kimihurura',  district: 'Gasabo',    displayLabel: 'Kimihurura, Kigali' },
  { name: 'Remera',      district: 'Gasabo',    displayLabel: 'Remera, Kigali' },
  { name: 'Kacyiru',     district: 'Gasabo',    displayLabel: 'Kacyiru, Kigali' },
  { name: 'Gisozi',      district: 'Gasabo',    displayLabel: 'Gisozi, Kigali' },
  { name: 'Kibagabaga',  district: 'Gasabo',    displayLabel: 'Kibagabaga, Kigali' },
  { name: 'Kanombe',     district: 'Gasabo',    displayLabel: 'Kanombe, Kigali' },
  { name: 'Kicukiro',    district: 'Kicukiro',  displayLabel: 'Kicukiro, Kigali' },
  { name: 'Gikondo',     district: 'Kicukiro',  displayLabel: 'Gikondo, Kigali' },
  { name: 'Niboye',      district: 'Kicukiro',  displayLabel: 'Niboye, Kigali' },
  { name: 'Kagarama',    district: 'Kicukiro',  displayLabel: 'Kagarama, Kigali' },
  { name: 'Nyamirambo',  district: 'Nyarugenge', displayLabel: 'Nyamirambo, Kigali' },
  { name: 'Downtown',    district: 'Nyarugenge', displayLabel: 'Downtown, Kigali' },
  { name: 'Biryogo',     district: 'Nyarugenge', displayLabel: 'Biryogo, Kigali' },
  { name: 'Muhima',      district: 'Nyarugenge', displayLabel: 'Muhima, Kigali' },
] as const
