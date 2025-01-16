import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const NotFound = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-loveblue p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-lovepink">404</h1>
        <p className="text-white text-lg">{t('page_not_found')}</p>
        <Link 
          to="/" 
          className="inline-block px-6 py-2 bg-lovepink text-white rounded-lg hover:bg-lovepink/90 transition-colors"
        >
          {t('back_to_home')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;