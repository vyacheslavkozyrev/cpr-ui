import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'
import i18n, { AVAILABLE_LANGUAGES, type TLanguageCode } from '../config/i18n'
import type { TDateFormat } from '../utils/dateLocalization'

// Date format preference options
export const DATE_FORMAT_OPTIONS: TDateFormat[] = [
  'SHORT',
  'MEDIUM',
  'LONG',
  'FULL',
]

// Language store interface following I prefix convention
interface ILanguageStore {
  // Current language
  language: TLanguageCode

  // Date format preference
  dateFormat: TDateFormat

  // Available languages and formats
  availableLanguages: typeof AVAILABLE_LANGUAGES
  availableDateFormats: typeof DATE_FORMAT_OPTIONS

  // Actions
  setLanguage: (language: TLanguageCode) => void
  setDateFormat: (format: TDateFormat) => void
  getLanguageName: (code: TLanguageCode) => string
  getLanguageFlag: (code: TLanguageCode) => string

  // Utility functions
  getCurrentLanguageName: () => string
  getCurrentLanguageFlag: () => string
  getDateFormatLabel: (format: TDateFormat) => string
}

// Create language store with persistence
export const useLanguageStore = create<ILanguageStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        language: 'en', // Default language
        dateFormat: 'MEDIUM', // Default date format
        availableLanguages: AVAILABLE_LANGUAGES,
        availableDateFormats: DATE_FORMAT_OPTIONS,

        setLanguage: (language: TLanguageCode) => {
          // Update store
          set({ language })

          // Update i18next
          i18n.changeLanguage(language)
        },

        setDateFormat: (dateFormat: TDateFormat) => {
          set({ dateFormat })
        },

        getLanguageName: (code: TLanguageCode) => {
          const lang = AVAILABLE_LANGUAGES.find(l => l.code === code)
          return lang?.name || code
        },

        getLanguageFlag: (code: TLanguageCode) => {
          const lang = AVAILABLE_LANGUAGES.find(l => l.code === code)
          return lang?.flag || '🌐'
        },

        getCurrentLanguageName: () => {
          const { language } = get()
          return get().getLanguageName(language)
        },

        getCurrentLanguageFlag: () => {
          const { language } = get()
          return get().getLanguageFlag(language)
        },

        getDateFormatLabel: (format: TDateFormat) => {
          // Return a human-readable label for the date format
          switch (format) {
            case 'SHORT':
              return 'Short'
            case 'MEDIUM':
              return 'Medium'
            case 'LONG':
              return 'Long'
            case 'FULL':
              return 'Full'
            default:
              return format
          }
        },
      }),
      {
        name: 'cpr-language-storage', // Storage key
        storage: createJSONStorage(() => localStorage),

        // Persist language and date format preferences
        partialize: state => ({
          language: state.language,
          dateFormat: state.dateFormat,
        }),

        // Rehydration callback to sync with i18next
        onRehydrateStorage: () => state => {
          if (state) {
            // Sync with i18next after rehydration
            i18n.changeLanguage(state.language)
          }
        },
      }
    )
  )
)

// Export language store hook
export { useLanguageStore as useLanguage }

// Export types
export type { ILanguageStore }
