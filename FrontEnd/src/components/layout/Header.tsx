import React, { useState, useEffect } from 'react';
import { Search, Heart, Plus, ChevronDown, MapPin } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loc, setLoc] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Keep search bar in sync with URL
    const params = new URLSearchParams(location.search);
    if(params.get('q')) setQuery(params.get('q') || '');
    if(params.get('loc')) setLoc(params.get('loc') || 'all');
  }, [location.search]);

  const handleSearch = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    const params = new URLSearchParams();
    if(query.trim()) params.append('q', query.trim());
    if(loc !== 'all') params.append('loc', loc);
    
    // Only navigate to home for searching if we have a filter or if we are already on home
    navigate(`/?${params.toString()}`);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="logo">RAY</Link>
        <div className="search-location">
          <MapPin size={20} className="icon" />
          <select className="location-select" value={loc} onChange={(e) => { setLoc(e.target.value); setTimeout(() => document.getElementById('global-search-btn')?.click(), 50); }}>
            <option value="all">{t('allRwanda')}</option>
            <optgroup label="Kigali">
              <option value="kigali">Gasabo, Kigali</option>
              <option value="kicukiro">Kicukiro, Kigali</option>
              <option value="nyarugenge">Nyarugenge, Kigali</option>
            </optgroup>
            <optgroup label="Northern Province">
              <option value="musanze">Musanze</option>
              <option value="gicumbi">Gicumbi</option>
              <option value="rulindo">Rulindo</option>
              <option value="burera">Burera</option>
              <option value="gakenke">Gakenke</option>
            </optgroup>
            <optgroup label="Western Province">
              <option value="rubavu">Rubavu (Gisenyi)</option>
              <option value="karongi">Karongi</option>
              <option value="rusizi">Rusizi</option>
              <option value="rutsiro">Rutsiro</option>
              <option value="nyabihu">Nyabihu</option>
              <option value="ngororero">Ngororero</option>
              <option value="nyamasheke">Nyamasheke</option>
            </optgroup>
            <optgroup label="Southern Province">
              <option value="huye">Huye</option>
              <option value="muhanga">Muhanga</option>
              <option value="kamonyi">Kamonyi</option>
              <option value="nyanza">Nyanza</option>
              <option value="ruhango">Ruhango</option>
              <option value="nyaruguru">Nyaruguru</option>
              <option value="gisagara">Gisagara</option>
              <option value="nyamagabe">Nyamagabe</option>
            </optgroup>
            <optgroup label="Eastern Province">
              <option value="bugesera">Bugesera</option>
              <option value="rwamagana">Rwamagana</option>
              <option value="kayonza">Kayonza</option>
              <option value="nyagatare">Nyagatare</option>
              <option value="kirehe">Kirehe</option>
              <option value="ngoma">Ngoma</option>
              <option value="gatsibo">Gatsibo</option>
            </optgroup>
          </select>
          <ChevronDown size={20} className="icon" />
        </div>
        <form className="search-main" onSubmit={handleSearch}>
          <input type="text" placeholder={t('searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="submit" id="global-search-btn" className="search-btn"><Search size={24} /></button>
        </form>
        <div className="header-actions">
          <div className="lang-wrapper">
            <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value as 'en' | 'rw')}>
              <option value="en">ENGLISH</option>
              <option value="rw">KINYARWANDA</option>
            </select>
            <ChevronDown size={20} className="icon" />
          </div>
          <button className="icon-btn"><Heart size={20} /></button>
          
          {isAuthenticated ? (
            <button className="login-btn" style={{color: '#ff4747'}} onClick={() => { logout(); window.location.href='/'; }}>{t('logout')}</button>
          ) : (
            <Link to="/login" className="login-btn" style={{textDecoration: 'none'}}>{t('login')}</Link>
          )}

          <Link to="/sell" className="relative flex items-center justify-center px-6 h-12 font-bold text-[15px] bg-white rounded-[24px] uppercase tracking-wide group shadow-sm z-0 text-[#002f34] sell-btn">
            {/* The gradient border container mimicking OLX */}
            <div className="absolute inset-0 rounded-[24px] border-[5px] border-transparent" 
                 style={{ 
                   background: 'linear-gradient(to right, #23e5db, #3a77ff, #ffce32) border-box',
                   WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                   WebkitMaskComposite: 'destination-out',
                   maskComposite: 'exclude'
                 }} 
            />
            <span className="flex items-center gap-1 z-10">
              <Plus size={18} className="stroke-[3]" /> {t('sell')}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
export default Header;
