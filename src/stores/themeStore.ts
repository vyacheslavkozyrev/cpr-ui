import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme preference for system detection
type SystemTheme = 'light' | 'dark';

// Theme store interface
interface ThemeStore {
  // Current theme mode (user preference)
  mode: ThemeMode;
  
  // Resolved theme (actual theme being used)
  resolvedTheme: 'light' | 'dark';
  
  // System theme detection
  systemTheme: SystemTheme;
  
  // Actions
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setSystemTheme: (theme: SystemTheme) => void;
  
  // Utility functions
  isDark: () => boolean;
  isLight: () => boolean;
  isSystemMode: () => boolean;
}

// Create theme store with persistence
export const useThemeStore = create<ThemeStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        mode: 'system', // Default to system preference
        resolvedTheme: 'light', // Default resolved theme
        systemTheme: 'light', // Default system theme
        
        setMode: (mode: ThemeMode) => {
          set({ mode });
          // Update resolved theme based on new mode
          const { systemTheme } = get();
          const resolvedTheme = mode === 'system' ? systemTheme : mode;
          set({ resolvedTheme });
        },
        
        toggleTheme: () => {
          const { mode } = get();
          if (mode === 'system') {
            // If in system mode, switch to opposite of current system theme
            const { systemTheme } = get();
            const newMode = systemTheme === 'light' ? 'dark' : 'light';
            set({ mode: newMode, resolvedTheme: newMode });
          } else {
            // Toggle between light and dark
            const newMode = mode === 'light' ? 'dark' : 'light';
            set({ mode: newMode, resolvedTheme: newMode });
          }
        },
        
        setSystemTheme: (theme: SystemTheme) => {
          set({ systemTheme: theme });
          // Update resolved theme if in system mode
          const { mode } = get();
          if (mode === 'system') {
            set({ resolvedTheme: theme });
          }
        },
        
        // Utility functions
        isDark: () => get().resolvedTheme === 'dark',
        isLight: () => get().resolvedTheme === 'light',
        isSystemMode: () => get().mode === 'system',
      }),
      {
        name: 'cpr-theme-storage', // Storage key
        storage: createJSONStorage(() => localStorage),
        
        // Only persist the mode, not system detection or resolved theme
        partialize: (state) => ({ mode: state.mode }),
        
        // Rehydration callback to set up initial state
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Import theme initialization
            import('../utils/themeInit').then(() => {
              // Theme initialization will handle system detection
            });
          }
        },
      }
    )
  )
);

// Export theme store hook
export { useThemeStore as useTheme };

// Export types
    export type { SystemTheme, ThemeStore };

