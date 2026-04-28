// ─────────────────────────────────────────────
// RAY — UI Strings (English)
// All user-facing text must live here.
// Kinyarwanda and French translations to follow.
// ─────────────────────────────────────────────

export const STRINGS = {
  app: {
    name: 'RAY',
    tagline: 'Buy & Sell Anything Near You',
    taglineShort: 'Buy. Sell. Near You.',
  },

  nav: {
    home: 'Home',
    search: 'Search',
    sell: 'Sell',
    chats: 'Chats',
    profile: 'Profile',
    postAd: 'Post Ad',
    login: 'Login',
    logout: 'Logout',
  },

  home: {
    searchPlaceholder: 'Search for items, brands, or categories...',
    locationLabel: 'Rwanda',
    browseCategories: 'Browse Categories',
    freshNearYou: 'Fresh Near You',
    popularInKigali: 'Popular in Kigali',
    bestDealsToday: 'Best Deals Today',
    seeAll: 'See all',
    sellFasterWithPremium: 'Sell Faster with Premium',
    premiumBenefit: 'Get 3x more visibility for your listings',
    upgradeNow: 'Upgrade Now',
    recentListings: 'Recent Listings',
  },

  listing: {
    chatWithSeller: 'Chat with Seller',
    viewProfile: 'View Profile',
    postedAgo: 'ago',
    away: 'away',
    condition: {
      new: 'New',
      like_new: 'Like New',
      good: 'Good',
      fair: 'Fair',
    },
    status: {
      active: 'Active',
      sold: 'Sold',
      expired: 'Expired',
    },
    featured: 'Featured',
    negotiable: 'Negotiable',
    safetyTip: 'Meet in a public place. Do not send money upfront.',
    shareWhatsApp: 'Share on WhatsApp',
    reportListing: 'Report Listing',
    saveListing: 'Save',
    similarListings: 'Similar Listings',
    sellerInfo: 'Seller Information',
    memberSince: 'Member since',
    responseRate: 'Response rate',
    activeAds: 'Active Ads',
    totalViews: 'Total Views',
    favourites: 'Favourites',
  },

  postAd: {
    title: 'Post Your Ad',
    preview: 'Preview',
    step1: { title: "What are you selling?", subtitle: 'Choose a category' },
    step2: {
      title: 'Add Photos',
      subtitle: 'First photo will be the cover image.',
      max: 'Add up to 10 photos',
      nudge: 'Items with 3+ photos sell 4x faster',
      coverLabel: 'Cover',
    },
    step3: {
      title: 'Item Details',
      titleLabel: 'Ad Title',
      titlePlaceholder: 'e.g., iPhone 14 Pro Max 256GB',
      titleHint: 'Mention the key features (e.g., brand, model, year)',
      conditionLabel: 'Condition',
      priceLabel: 'Price',
      pricePlaceholder: 'Rwf 0',
      negotiable: 'Price is negotiable',
    },
    step4: {
      title: 'Description',
      label: 'Description',
      placeholder: 'Include details like condition, features, reason for selling...',
      optional: '(Optional)',
      maxChars: 500,
    },
    step5: {
      title: 'Location',
      label: 'Select Location',
      phoneLabel: 'Phone Number',
      phonePlaceholder: '+250 7xx xxx xxxx',
      hidePhone: 'Hide phone number in ad',
    },
    step6: {
      title: 'Review & Post',
      makeFeatured: 'Make it Featured',
      featuredBenefit: 'Get 3x more views and sell faster',
      postAd: 'Post Ad',
      terms: 'By Posting you agree to our Terms & Conditions',
    },
    featuredPrice: 'Rwf 499',
    progressLabel: (step: number, total: number) => `Step ${step} of ${total}`,
  },

  auth: {
    phoneTitle: 'Enter Your Phone Number',
    phoneSubtitle: 'We Will Send You a Verification Code',
    sendCode: 'SEND CODE',
    otpTitle: 'Enter Verification Code',
    otpSubtitle: (phone: string) => `Sent to ${phone}`,
    resend: 'Resend code',
    resendIn: (seconds: number) => `Resend in ${seconds}s`,
    profileSetupTitle: 'Set Up Your Profile',
    profileSetupSubtitle: 'Let buyers and sellers know who you are',
    displayNameLabel: 'Your Name',
    displayNamePlaceholder: 'Full name',
    locationLabel: 'Your Neighborhood',
    getStarted: 'Start Using RAY',
    skipForNow: 'Skip for now',
  },

  chat: {
    title: 'Messages',
    searchPlaceholder: 'Search in messages...',
    quickReplies: [
      'Is this still available?',
      "What's the last price?",
      'Where can we meet?',
      'Can you send more photos?',
    ],
    inputPlaceholder: 'Write a message...',
    safetyBanner: 'Meet in a public place. Never send money before seeing the item.',
    sharePhone: 'Share Phone Number',
    reportUser: 'Report User',
  },

  profile: {
    myAccount: 'My Account',
    myAds: 'My Ads',
    favourites: 'Favourites',
    notifications: 'Notification',
    reviewsRatings: 'Review & Ratings',
    upgradePremium: 'Upgrade to Premium',
    settings: 'Settings',
    helpSupport: 'Help & Support',
    safetyTips: 'Safety Tips',
    logout: 'Logout',
    goPremium: 'Go Premium',
    premiumSell: 'Sell 3x faster with featured listings',
    upgrade: 'Upgrade',
  },

  search: {
    placeholder: 'Search in Ray...',
    resultsCount: (n: number) => `Found ${n.toLocaleString()} results`,
    noResults: 'No results found',
    noResultsHint: 'Try different keywords or browse categories',
    recentSearches: 'Recent Searches',
    trending: 'Trending',
    filters: 'Filters',
    sortBy: 'Sort by',
    sort: {
      newest: 'Newest',
      price_asc: 'Price: Low to High',
      price_desc: 'Price: High to Low',
      nearest: 'Nearest',
    },
    filterLabels: {
      price: 'Price',
      distance: 'Distance',
      condition: 'Condition',
      category: 'Category',
    },
  },

  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Check your connection.',
    unauthorized: 'You need to be logged in to do that.',
    notFound: 'This listing no longer exists.',
    validation: {
      required: 'This field is required.',
      minLength: (n: number) => `Must be at least ${n} characters.`,
      maxLength: (n: number) => `Must be at most ${n} characters.`,
      invalidPhone: 'Enter a valid Rwandan phone number.',
      invalidPrice: 'Enter a valid price.',
    },
  },

  currency: {
    symbol: 'Rwf',
    format: (amount: number) => `Rwf ${amount.toLocaleString()}`,
  },

  trust: {
    verified: 'Verified',
    topSeller: 'Top Seller',
    fastReply: 'Fast Reply',
  },
} as const
