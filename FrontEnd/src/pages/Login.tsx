import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (isAuthenticated && user?.name) {
    return <Navigate to="/" replace />;
  }

  const handleSendCode = () => {
    if (phone.length < 8) return; 
    setStep(2);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    const success = await login(phone, otp);
    if (success) {
      navigate('/onboarding');
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-icon-wrap">
          <ShieldCheck size={32} />
        </div>
        <h2 className="auth-title">{t('welcomeRay')}</h2>
        <p className="auth-desc">
          {step === 1 ? t('enterPhone') : `${t('weSentCode')} ${phone}`}
        </p>

        {step === 1 ? (
          <div className="auth-form">
            <div className="input-group">
               <span className="prefix">+250</span>
               <input 
                 className="auth-input-modern" 
                 type="tel" 
                 placeholder="7XXXXXXXX"
                 value={phone}
                 onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                 autoFocus
               />
            </div>
            <button className="auth-btn-modern" onClick={handleSendCode} disabled={phone.length < 8}>
              {t('continueSetup')}
            </button>
          </div>
        ) : (
          <div className="auth-form">
            <input 
              className="auth-input-modern otp-input" 
              type="text" 
              placeholder="• • • • • •"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            <button className="auth-btn-modern" onClick={handleVerifyOTP} disabled={otp.length !== 6}>
              {t('verifyLogin')}
            </button>
            <button className="auth-link-btn" onClick={() => setStep(1)}>{t('changePhone')}</button>
          </div>
        )}
        
        <div className="auth-footer">
          {t('terms')}
        </div>
      </div>
    </div>
  );
};

export default Login;
