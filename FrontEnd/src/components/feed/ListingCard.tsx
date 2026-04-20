import React from 'react';
import { Listing } from '../../lib/mockListings';
import { Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ListingCardProps {
  listing: Listing;
  onClick: (id: string) => void;
}

const formatPrice = (price: number) => {
  return price.toLocaleString('en-US');
};

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const { t } = useLanguage();
  return (
    <div onClick={() => onClick(listing.id)} className="listing-card">
      <div className="card-image-wrap">
        <div className="kikuu-discount">-20%</div>
        {listing.images.length > 0 ? (
          <img src={listing.images[0]} alt={listing.title} />
        ) : (
          <div className="placeholder-img">RAY</div>
        )}
        <button className="heart-icon" onClick={(e) => { e.stopPropagation(); }}><Heart size={18} color="#002f34" /></button>
        {listing.isBoosted && <div className="featured-badge">{t('featured')}</div>}
      </div>

      <div className="card-info">
        <div className="price">{listing.currency === 'Frw' ? 'Frw' : '₹'} {formatPrice(listing.price)} <span className="kikuu-original">{formatPrice(Math.floor(listing.price * 1.25))}</span></div>
        <h3 className="card-title">{listing.title}</h3>
        <div className="kikuu-delivery">{t('expressLocal')}</div>
        <div className="kikuu-stats">
          <span className="kikuu-star">★ {(Math.random() * 1.0 + 4.0).toFixed(1)}</span>
          <span className="kikuu-sold">{Math.floor(Math.random() * 500) + 12} {t('sold')}</span>
        </div>
        <div className="card-footer">
          <span>{listing.location.split(',')[0]}</span>
          <span>{new Date(listing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
};
export default ListingCard;
