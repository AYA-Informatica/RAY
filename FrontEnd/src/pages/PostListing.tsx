import React, { useState } from 'react';
import Header from '../components/layout/Header';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const PostListing = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="home-page" style={{paddingBottom: 0, marginTop: 0}}>
      <Header />
      <div className="post-wizard">
        <h2 style={{fontSize: 24, fontWeight: 700, margin: '0 0 24px 0', color: '#002f34'}}>{t('postYourAd')}</h2>
        
        {step === 1 && (
          <div>
            <div className="wizard-step">{t('whatAreYouSelling')}</div>
            <input className="auth-input-modern" style={{border: '2px solid #e0e0e0', borderRadius: 8}} type="text" placeholder="e.g. iPhone 11 Pro Max" autoFocus />
            <button className="auth-btn-modern" style={{marginTop: 16}} onClick={() => setStep(2)}>{t('next')}</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="wizard-step">{t('uploadPhotos')}</div>
            <div className="post-photo-area">
              <Camera size={48} />
              <p style={{margin: 0, fontWeight: 700, color: '#002f34'}}>{t('tapToUpload')}</p>
              <span className="post-nudge">{t('itemsSellFaster')}</span>
            </div>
            <button className="auth-btn-modern" onClick={() => setStep(3)}>{t('next')}</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="wizard-step">{t('setPriceDesc')}</div>
            <input className="auth-input-modern" style={{border: '2px solid #e0e0e0', borderRadius: 8, marginBottom: 16}} type="number" placeholder={t('priceFrw')} />
            <p style={{fontSize: 12, color: '#5c7a7d', marginTop: -12, marginBottom: 16}}>{t('suggestedPrice')}</p>
            <textarea className="auth-input-modern" placeholder={t('shortDesc')} rows={4} style={{fontFamily: 'Inter', border: '2px solid #e0e0e0', borderRadius: 8, marginBottom: 16}}></textarea>
            
            <button className="auth-btn-modern" onClick={() => {
              alert("Ad Posted successfully! In <60 seconds.");
              navigate('/');
             }}>{t('postNow')}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostListing;
