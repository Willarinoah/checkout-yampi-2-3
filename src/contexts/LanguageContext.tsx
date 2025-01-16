import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en';
import pt from '../translations/pt';
import { Translation, TranslationKey } from '../translations/types';

type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const translations: Record<Language, Translation> = { en, pt };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return (savedLanguage === 'en' || savedLanguage === 'pt') ? savedLanguage as Language : 'pt';
  });

  useEffect(() => {
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};