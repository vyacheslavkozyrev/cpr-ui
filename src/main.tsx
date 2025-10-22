import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useThemeStore } from './stores/themeStore';
import { darkTheme, lightTheme } from './theme/index';

// Initialize theme detection
import './utils/themeInit';

// Theme-aware root component
function ThemedApp() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const currentTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>
);
