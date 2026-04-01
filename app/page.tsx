'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ListingCard } from '@/components/listing-card';
import { useAuthStore } from '@/lib/store';
import { mockListings, CATEGORIES } from '@/lib/mockListings';
import { Category } from '@/lib/types';
import { Heart, Plus } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter listings based on category and search
  const filteredListings = useMemo(() => {
    return mockListings.filter((listing) => {
      const matchesCategory =
        selectedCategory === 'all' || listing.category === selectedCategory;
      const matchesSearch =
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-indigo-600">RAY</h1>

            {/* Search Bar */}
            <div className="flex-1 max-w-md hidden sm:block">
              <Input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated && user ? (
                <>
                  <Button
                    size="sm"
                    className="gap-2 hidden sm:flex"
                    onClick={() => router.push('/sell')}
                  >
                    <Plus className="w-4 h-4" />
                    Sell
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/profile')}
                  >
                    {user.name || 'Profile'}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-3 block sm:hidden">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            Buy & Sell Anything in Kigali
          </h2>
          <p className="text-indigo-100 mb-4">
            Find amazing deals or post your items for sale
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3 uppercase">
            Categories
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className={`cursor-pointer whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedCategory(cat.id as Category)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results */}
        {filteredListings.length > 0 ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredListings.length} listings
            </p>

            {/* Listings Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No listings found
            </h3>
            <p className="text-gray-600">
              Try a different search or category to find what you&apos;re looking for
            </p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden">
        <div className="flex justify-around">
          <button className="flex-1 py-3 text-center text-indigo-600 border-t-2 border-indigo-600 font-semibold">
            Home
          </button>
          <button
            onClick={() => router.push(isAuthenticated ? '/sell' : '/login')}
            className="flex-1 py-3 text-center text-gray-600 hover:text-indigo-600 font-semibold"
          >
            Sell
          </button>
          <button className="flex-1 py-3 text-center text-gray-600 hover:text-indigo-600 font-semibold">
            Messages
          </button>
          <button
            onClick={() => router.push(isAuthenticated ? '/profile' : '/login')}
            className="flex-1 py-3 text-center text-gray-600 hover:text-indigo-600 font-semibold"
          >
            Profile
          </button>
        </div>
      </div>

      {/* Mobile Bottom Padding */}
      <div className="h-16 sm:h-0" />
    </div>
  );
}
