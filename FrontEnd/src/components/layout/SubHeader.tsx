import React from 'react';
import { ChevronDown, Key } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
interface Props{
  nav:string
}
const CATEGORIES = [
  "Cars", "Motorcycles", "Mobile Phones", "For Sale: Houses & Apartments", "Scooters", "Commercial & Other Vehicles", "For Rent: Houses & Apartments"
];

const SubHeader = ({nav}:Props) => {
  const { t } = useLanguage();
  return (
    <div className="sub-header">
      <div className="sub-header-container">
        <button className="all-cat-btn">
          {t('allCategories')} <ChevronDown size={18} />
        </button>
        <nav className="sub-nav">
          <a href="#" className="active">{t('all')}</a>
          {CATEGORIES.map(cat => (
            <a key={cat} onClick={()=>{
nav(cat)
            }}>{cat}</a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SubHeader;
