import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

// Available languages
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'be', name: 'Беларуская', flag: '🇧🇾' },
] as const

export type TLanguageCode = (typeof AVAILABLE_LANGUAGES)[number]['code']

// i18n configuration
i18n
  // Load translation files from public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: 'en',

    // Debug mode (disable in production)
    debug: import.meta.env.DEV,

    // Language detection options
    detection: {
      // Detection order
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language
      caches: ['localStorage'],
      // localStorage key
      lookupLocalStorage: 'cpr-language',
    },

    // Backend options
    backend: {
      // Path to load translations from
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // React-i18next options
    react: {
      // Wait for translations to load before rendering
      useSuspense: false,
    },

    // Interpolation options
    interpolation: {
      // React already escapes values
      escapeValue: false,
    },

    // Default namespace
    defaultNS: 'translation',

    // Available languages
    supportedLngs: AVAILABLE_LANGUAGES.map(lang => lang.code),

    // Don't load languages that aren't supported
    nonExplicitSupportedLngs: false,
  })

export { i18n }
export default i18n
