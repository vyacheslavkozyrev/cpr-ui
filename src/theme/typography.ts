// Font families
export const fontFamilies = {
  primary: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  monospace: [
    '"Fira Code"',
    '"JetBrains Mono"',
    'Consolas',
    '"Monaco"',
    '"Courier New"',
    'monospace',
  ].join(','),
}

// Font weights
export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

// Typography scale following Material Design principles
export const typography = {
  fontFamily: fontFamilies.primary,
  fontWeightLight: fontWeights.light,
  fontWeightRegular: fontWeights.regular,
  fontWeightMedium: fontWeights.medium,
  fontWeightBold: fontWeights.bold,

  // Display styles (largest text)
  h1: {
    fontSize: '2.5rem', // 40px
    fontWeight: fontWeights.bold,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '2rem', // 32px
    fontWeight: fontWeights.bold,
    lineHeight: 1.25,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.75rem', // 28px
    fontWeight: fontWeights.semibold,
    lineHeight: 1.3,
    letterSpacing: '0em',
  },
  h4: {
    fontSize: '1.5rem', // 24px
    fontWeight: fontWeights.semibold,
    lineHeight: 1.35,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontSize: '1.25rem', // 20px
    fontWeight: fontWeights.medium,
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  h6: {
    fontSize: '1.125rem', // 18px
    fontWeight: fontWeights.medium,
    lineHeight: 1.4,
    letterSpacing: '0.0075em',
  },

  // Body text styles
  body1: {
    fontSize: '1rem', // 16px
    fontWeight: fontWeights.regular,
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: '0.875rem', // 14px
    fontWeight: fontWeights.regular,
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },

  // UI element styles
  subtitle1: {
    fontSize: '1rem', // 16px
    fontWeight: fontWeights.medium,
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontSize: '0.875rem', // 14px
    fontWeight: fontWeights.medium,
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
  },

  // Interactive elements
  button: {
    fontSize: '0.875rem', // 14px
    fontWeight: fontWeights.medium,
    lineHeight: 1.43,
    letterSpacing: '0.02857em',
    textTransform: 'none' as const, // Override default uppercase
  },

  // Small text
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: fontWeights.regular,
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  overline: {
    fontSize: '0.75rem', // 12px
    fontWeight: fontWeights.medium,
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase' as const,
  },
}

// Custom typography variants for specific use cases in the CPR app
export const customTypographyVariants = {
  cardTitle: {
    fontSize: '1.125rem', // 18px
    fontWeight: fontWeights.semibold,
    lineHeight: 1.4,
    letterSpacing: '0.0075em',
  },
  fieldLabel: {
    fontSize: '0.875rem', // 14px
    fontWeight: fontWeights.medium,
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },
  navItem: {
    fontSize: '0.875rem', // 14px
    fontWeight: fontWeights.medium,
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },
  statusText: {
    fontSize: '0.75rem', // 12px
    fontWeight: fontWeights.medium,
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
    textTransform: 'uppercase' as const,
  },
}
