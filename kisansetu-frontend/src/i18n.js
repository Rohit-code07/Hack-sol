import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../public/locales/en/translation.json';
import hiTranslation from '../public/locales/hi/translation.json';

const savedLang = localStorage.getItem('ks_lang') || 'hi';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      hi: { translation: hiTranslation }
    },
    lng: savedLang,
    fallbackLng: 'hi',
    interpolation: {
      escapeValue: false
    }
  });

// Synchronize document data-lang and lang attributes on load and language change
document.documentElement.lang = savedLang;
document.body.setAttribute('data-lang', savedLang);

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.body.setAttribute('data-lang', lng);
  localStorage.setItem('ks_lang', lng);
});

export default i18n;
