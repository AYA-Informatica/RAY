import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockListings } from '../lib/mockListings';
import Header from '../components/layout/Header';
import SubHeader from '../components/layout/SubHeader';
import { MessageSquare, MapPin, Share2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const listing = mockListings.find(l => l.id === id);

  if (!listing) {
    return <div style={{textAlign: "center", padding: "50px"}}>Listing Not Found</div>;
  }

  return (
    <div className="home-page" style={{paddingBottom: 0, marginTop: 0}}>
      <Header />
      <SubHeader />
      
      <div className="detail-page">
        {/* Main Panel */}
        <div className="detail-main">
          <div className="detail-gallery">
            {listing.images.length > 0 ? (
              <img src={listing.images[0]} alt={listing.title} />
            ) : (
              <div className="detail-placeholder">RAY</div>
            )}
          </div>

          <div className="detail-desc">
            <h3>{t('description')}</h3>
            <div className="detail-text">
              {listing.description || "No description provided."}
            </div>
            {listing.condition && (
              <p style={{marginTop: 16, fontWeight: 700}}>{t('condition')}: <span style={{textTransform: 'capitalize'}}>{listing.condition}</span></p>
            )}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="detail-sidebar">
          <div className="price-box">
            <h1 className="price" style={{fontSize: 28, color: '#ff4b2b', margin: '0 0 8px 0'}}>
              {listing.currency === 'Frw' ? 'Frw' : '₹'} {listing.price.toLocaleString()} 
              <span className="kikuu-original" style={{fontSize: 18, color: '#a4b2b4'}}>{Math.floor(listing.price * 1.25).toLocaleString()}</span>
            </h1>
            <h2 className="title" style={{marginBottom: 8}}>{listing.title}</h2>
            
            <div className="kikuu-stats" style={{fontSize: 14, marginBottom: 16}}>
               <span className="kikuu-star">★ 4.8 {t('rating')}</span>
               <span style={{color: '#ebeeef'}}>|</span>
               <span className="kikuu-sold">3,421 {t('offers')}</span>
            </div>

            <div className="detail-kikuu-wrapper">
               <div style={{fontWeight: 800, color: '#e11d48'}}>{t('limitedFlashSale')}</div>
               <div style={{fontSize: 13, color: '#9f1239', marginTop: 4}}>{t('saleEndsToday')}</div>
            </div>

            <div className="footer">
               <span style={{display: 'flex', alignItems: 'center', gap: 4}}><MapPin size={14}/> {listing.location}</span>
               <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="seller-box">
            <p style={{fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#5c7a7d', marginBottom: 8}}>{t('sellerDescription')}</p>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
              <div style={{width: 64, height: 64, borderRadius: '50%', background: '#ffce32', flexShrink: 0}} />
              <div>
                <h3 className="name">{listing.seller.name}</h3>
                <p className="joined">{t('memberSince')} {new Date(listing.seller.joinedDate).getFullYear()}</p>
              </div>
            </div>

            <button className="chat-btn" onClick={() => navigate('/chat')}>
              <MessageSquare size={20} /> {t('chatWithSeller')}
            </button>
            <p style={{fontSize: 12, textAlign: 'center', color: '#5c7a7d', marginTop: 12}}>
              {t('tipsNoPay')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
