import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { mockListings } from '../lib/mockListings';
import ListingCard from '../components/feed/ListingCard';
import Header from '../components/layout/Header';
import SubHeader from '../components/layout/SubHeader';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const [catOpen, setCatOpen] = useState(true);
  const [locOpen, setLocOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  
  const q = searchParams.get('q')?.toLowerCase();
  const loc = searchParams.get('loc')?.toLowerCase();
  
  const feedListings = mockListings.filter(l => {
     const matchesQ = !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
     const matchesLoc = !loc || l.location.toLowerCase().includes(loc);
     return matchesQ && matchesLoc;
  });

  return (
    <div className="home-page">
      <Header />
      <SubHeader />
      
      <div className="home-container">
        <div className="breadcrumb">Home / Electronics & Appliances</div>
        <h1 className="home-title">{t('buy')} & {t('sell')} in  Rwanda</h1>

        <div className="home-content">
          <aside className="sidebar">
            <div className="filter-group">
              <div className="filter-title" onClick={() => setCatOpen(!catOpen)}>
                {t('popularCategories')} {catOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {catOpen && (
                <div className="filter-list">
                  <div className="category-pill active">Computers & Laptops</div>
                  <div className="category-pill">Electronics & Audio</div>
                  <div className="category-pill">Mobile Phones</div>
                  <div className="category-pill">Kitchen Appliances</div>
                  <div className="category-pill">Furniture</div>
                </div>
              )}
            </div>
            
            <div className="filter-group">
              <div className="filter-title" onClick={() => setLocOpen(!locOpen)}>
                {t('topLocations')} {locOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {locOpen && (
                <div className="filter-list">
                  <div className="category-pill active">Kigali</div>
                  <div className="category-pill">Musanze</div>
                  <div className="category-pill">Gisenyi</div>
                  <div className="category-pill">Rwanda (All)</div>
                </div>
              )}
            </div>
          </aside>

          <main className="main-feed">
            <div className="feed-header">
              <span>{feedListings.length} {t('adsIn')} <b>{loc && loc !== 'all' ? loc : t('rwanda')}</b></span>
              <div className="sort-by">{t('sortBy')} <ChevronDown size={20} /></div>
            </div>
            
            <div className="listings-grid">
              {feedListings.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  onClick={() => navigate(`/listing/${listing.id}`)}
                />
              ))}
            </div>
            
            {feedListings.length === 0 && (
              <div style={{padding: '40px', textAlign: 'center', color: '#5c7a7d', background: '#fff', borderRadius: 8}}>
                <h3>{t('noProductsFound')} "{q || loc}"</h3>
                <p>{t('tryModifying')}</p>
              </div>
            )}

            <button className="load-more">{t('loadMore')}</button>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
