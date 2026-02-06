import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import es from './locales/es.json'

const storedLanguage = typeof localStorage !== 'undefined' ? localStorage.getItem('ddfit_lang') : null
const browserLanguage = typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] : null
const initialLanguage = storedLanguage || (browserLanguage === 'en' ? 'en' : 'es')

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es }
  },
  lng: initialLanguage,
  fallbackLng: 'es',
  interpolation: { escapeValue: false }
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language
}

i18n.on('languageChanged', (lng) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('ddfit_lang', lng)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng
  }
})

export default i18n
