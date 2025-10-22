import type { SystemTheme, ThemeMode } from '../stores/themeStore';
import { useThemeStore } from '../stores/themeStore';

// Pure Zustand theme hook (no Context needed)
export const useTheme = () => {
  const store = useThemeStore();
  
  return {
    // Current state
    mode: store.mode,
    resolvedTheme: store.resolvedTheme,
    systemTheme: store.systemTheme,
    
    // Actions
    setMode: store.setMode,
    toggleTheme: store.toggleTheme,
    setSystemTheme: store.setSystemTheme,
    
    // Utilities
    isDark: store.isDark,
    isLight: store.isLight,
    isSystemMode: store.isSystemMode,
    
    // Additional utilities
    getCurrentTheme: () => store.resolvedTheme,
    isCurrentTheme: (theme: 'light' | 'dark') => store.resolvedTheme === theme,
    
    // Quick setters
    setLight: () => store.setMode('light'),
    setDark: () => store.setMode('dark'),
    setSystem: () => store.setMode('system'),
    
    // Theme classes for CSS
    getThemeClass: () => `theme-${store.resolvedTheme}`,
    getThemeDataAttribute: () => ({ 'data-theme': store.resolvedTheme }),
  };
};

// Export types for consumers
export type { SystemTheme, ThemeMode };

// Export the store directly for advanced use cases
    export { useThemeStore } from '../stores/themeStore';

