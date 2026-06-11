import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'es';

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
