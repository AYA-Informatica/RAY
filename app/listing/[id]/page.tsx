'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockListings } from '@/lib/mockListings';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const listing = mockListings.find((l) => l.id === params.id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Listing Not Found
          </h1>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const sellerInitials = listing.seller.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card className="overflow-hidden">
              <div className="relative w-full aspect-video bg-gray-200">
                <Image
                  src={listing.images[0] || '/placeholder.png'}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            </Card>

            {/* Details */}
            <Card className="p-6 space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {listing.title}
                    </h1>
                    <p className="text-gray-600 mt-2">{listing.location}</p>
                  </div>
                  <Badge className="text-lg py-2 px-4">
                    Frw {listing.price.toLocaleString()}
                  </Badge>
                </div>

                <div className="flex gap-3">
                  <Badge
                    variant="secondary"
                    className="capitalize text-xs py-1"
                  >
                    {listing.condition}
                  </Badge>
                  <Badge variant="outline" className="text-xs py-1">
                    {listing.viewCount} views
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Details
                </h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Category</dt>
                    <dd className="font-semibold text-gray-900 capitalize">
                      {listing.category}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Posted</dt>
                    <dd className="font-semibold text-gray-900">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>
          </div>

          {/* Sidebar - Seller Info */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                About the Seller
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg font-bold">
                      {sellerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {listing.seller.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Joined{' '}
                      {new Date(listing.seller.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">✓ Verified Seller</p>
                </div>

                <Button className="w-full" size="lg">
                  Contact Seller
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  View More Listings
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-blue-50">
              <p className="text-sm text-blue-900">
                <strong>Safety Tip:</strong> Meet in public places and verify
                items before payment.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
