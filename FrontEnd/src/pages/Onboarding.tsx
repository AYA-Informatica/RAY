import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const INTERESTS = ['Phones', 'Cars', 'Houses', 'Furniture', 'Jobs'];

const Onboarding = () => {
  const { updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');
  const { t } = useLanguage();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleComplete = () => {
    // We just ask for intent to hook them! Behind the scenes they are active.
    updateProfile("Guest-" + Math.floor(Math.random()*1000), "Kigali");
    navigate('/', { replace: true });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{maxWidth: 600}}>
        <h2 className="auth-title">{t('whatLookingFor')}</h2>
        <p className="auth-desc">{t('chooseCategory')}</p>

        <div className="onboard-grid">
          {INTERESTS.map(item => (
            <div 
              key={item} 
              onClick={() => setSelected(item)}
              className={`onboard-card ${selected === item ? 'active' : ''}`}
            >
              {item}
            </div>
          ))}
          <div 
            onClick={() => setSelected('Browse everything')}
            className={`onboard-card ${selected === 'Browse everything' ? 'active' : ''}`}
          >
            {t('browseEverything')}
          </div>
        </div>

        <button className="auth-btn-modern" onClick={handleComplete}>
          {t('letsGo')}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
