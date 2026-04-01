import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

interface ListingCardProps {
  listing: Listing;
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative w-full aspect-video bg-gray-200">
          <Image
            src={listing.images[0] || '/placeholder.png'}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {listing.isBoosted && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
              Boosted
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Price */}
          <div className="mb-2">
            <p className="text-lg font-bold text-gray-900">
              Frw {listing.price.toLocaleString()}
            </p>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 flex-1">
            {listing.title}
          </h3>

          {/* Badges */}
          <div className="flex gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
            </Badge>
            {listing.viewCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {listing.viewCount} views
              </Badge>
            )}
          </div>

          {/* Location & Time */}
          <div className="flex items-center justify-between text-xs text-gray-600 border-t pt-3">
            <span>{listing.location}</span>
            <span>{getTimeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
