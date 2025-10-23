import { createTheme, type ThemeOptions } from '@mui/material/styles'
import { darkPalette, lightPalette } from './palette'
import { customTypographyVariants, typography } from './typography'

// Spacing configuration (8px base unit)
const spacing = 8

// Shape configuration for rounded corners
const shape = {
  borderRadius: 8, // Default border radius
}

// Base theme configuration
const baseThemeOptions: ThemeOptions = {
  typography: {
    ...typography,
    // Add custom variants to the typography object
    ...customTypographyVariants,
  },
  spacing,
  shape,

  // Component customizations
  components: {
    // Button customizations
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          '&:hover': {
            boxShadow:
              '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },

    // Card customizations
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow:
              '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
          },
        },
      },
    },

    // Paper customizations
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    // AppBar customizations
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        },
      },
    },

    // Chip customizations
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },

    // TextField customizations
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },

    // Dialog customizations
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },

    // Drawer customizations
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: '1px solid',
          borderRightColor: 'divider',
        },
      },
    },
  },
}

// Create light theme
export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    ...lightPalette,
    mode: 'light',
  },
})

// Create dark theme
export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    ...darkPalette,
    mode: 'dark',
  },
})

// Default export is light theme
export const theme = lightTheme

// Export individual themes for theme provider
export { darkTheme as dark, lightTheme as light }

// Theme type for TypeScript
export type Theme = typeof lightTheme
