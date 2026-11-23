import React, { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext({
  language: 'hi',
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export default function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('ks_lang') || i18n.language || 'hi';
  });

  const setLanguage = (lng) => {
    setLanguageState(lng);
    i18n.changeLanguage(lng);
    localStorage.setItem('ks_lang', lng);
    document.documentElement.lang = lng;
    document.documentElement.setAttribute('data-lang', lng);
    if (document.body) {
      document.body.setAttribute('data-lang', lng);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.setAttribute('data-lang', language);
    if (document.body) {
      document.body.setAttribute('data-lang', language);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
