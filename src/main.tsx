import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Application } from './components';
import './index.css';
import { useThemeStore } from './stores/themeStore';
import { darkTheme, lightTheme } from './theme/index';
import { checkExistingAuth, initializeAuth } from './utils/authInit';

// Initialize theme detection
import './utils/themeInit';

// Theme-aware root component with auth initialization
function ThemedApp() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const currentTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  
  useEffect(() => {
    // Initialize authentication system
    const initAuth = async () => {
      await initializeAuth();
      await checkExistingAuth();
    };
    
    initAuth().catch(console.error);
  }, []);
  
  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Application />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>
);
