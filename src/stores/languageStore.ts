import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'
import i18n, { AVAILABLE_LANGUAGES, type TLanguageCode } from '../config/i18n'

// Language store interface following I prefix convention
interface ILanguageStore {
  // Current language
  language: TLanguageCode

  // Available languages
  availableLanguages: typeof AVAILABLE_LANGUAGES

  // Actions
  setLanguage: (language: TLanguageCode) => void
  getLanguageName: (code: TLanguageCode) => string
  getLanguageFlag: (code: TLanguageCode) => string

  // Utility functions
  getCurrentLanguageName: () => string
  getCurrentLanguageFlag: () => string
}

// Create language store with persistence
export const useLanguageStore = create<ILanguageStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        language: 'en', // Default language
        availableLanguages: AVAILABLE_LANGUAGES,

        setLanguage: (language: TLanguageCode) => {
          // Update store
          set({ language })

          // Update i18next
          i18n.changeLanguage(language)
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
      }),
      {
        name: 'cpr-language-storage', // Storage key
        storage: createJSONStorage(() => localStorage),

        // Only persist the language
        partialize: state => ({ language: state.language }),

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
