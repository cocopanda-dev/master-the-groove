import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';

export const initI18n = () => {
  if (i18n.isInitialized) return Promise.resolve();
  return i18n.use(initReactI18next).init({
    resources: { en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
};
