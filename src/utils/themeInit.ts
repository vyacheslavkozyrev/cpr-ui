import { useThemeStore } from '../stores/themeStore';

// Theme initialization utility
export const initializeTheme = () => {
  // Get system theme detection function
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // Default fallback
  };

  // Only run in browser
  if (typeof window === 'undefined') return;

  // Set initial system theme
  const initialSystemTheme = getSystemTheme();
  useThemeStore.getState().setSystemTheme(initialSystemTheme);
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    const newSystemTheme = e.matches ? 'dark' : 'light';
    useThemeStore.getState().setSystemTheme(newSystemTheme);
  };
  
  // Add listener (modern browsers)
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleSystemThemeChange);
  }

  // Return cleanup function
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else {
      mediaQuery.removeListener(handleSystemThemeChange);
    }
  };
};

// Auto-initialize theme detection
if (typeof window !== 'undefined') {
  initializeTheme();
}