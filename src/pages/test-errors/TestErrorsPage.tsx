import {
  Alert,
  Box,
  Button,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import { logger } from '../../utils/logger'

// Style factory outside component
const getStyles = (theme: Theme) => ({
  container: {
    p: 3,
    maxWidth: theme.spacing(80),
    mx: 'auto',
  },
  section: {
    mb: 4,
    p: 3,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  buttonGroup: {
    display: 'flex',
    gap: 2,
    flexWrap: 'wrap',
    mt: 2,
  },
})

/**
 * TestErrorsPage Component
 * Page for testing error boundary functionality
 * Provides buttons to trigger different types of errors
 */
export const TestErrorsPage: React.FC = () => {
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])
  const [shouldThrowError, setShouldThrowError] = useState(false)

  // This will trigger a JavaScript error caught by AppErrorBoundary
  const triggerJSError = () => {
    setShouldThrowError(true)
  }

  // This will trigger a routing error
  const triggerRouteError = () => {
    // Simulate a broken route by navigating to invalid route
    window.location.href = '/invalid-route-that-will-error'
  }

  // This will simulate a network error
  const triggerNetworkError = () => {
    // Simulate network failure by trying to fetch from invalid endpoint
    fetch('/api/invalid-endpoint-that-will-fail')
      .then(() => {
        // This won't be reached
      })
      .catch(error => {
        logger.error('Network error', { error })
        // In a real app, this might trigger error boundary through state update
        throw new Error('Network request failed')
      })
  }

  // Intentionally throw error to test error boundary
  if (shouldThrowError) {
    throw new Error(
      'Test JavaScript error - This is intentional for testing error boundaries'
    )
  }

  return (
    <Box sx={styles.container}>
      <Typography variant='h4' component='h1' gutterBottom>
        Error Boundary Testing
      </Typography>

      <Alert severity='warning' sx={{ mb: 3 }}>
        This page is for testing error boundary functionality. Use the buttons
        below to trigger different types of errors.
      </Alert>

      <Box sx={styles.section}>
        <Typography variant='h6' gutterBottom>
          JavaScript Error Boundary Test
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          This will trigger a JavaScript error during component rendering, which
          should be caught by the AppErrorBoundary.
        </Typography>
        <Box sx={styles.buttonGroup}>
          <Button variant='contained' color='error' onClick={triggerJSError}>
            Trigger JavaScript Error
          </Button>
        </Box>
      </Box>

      <Box sx={styles.section}>
        <Typography variant='h6' gutterBottom>
          Route Error Test
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          This will navigate to an invalid route, which should be caught by the
          RouteErrorBoundary or show the 404 page.
        </Typography>
        <Box sx={styles.buttonGroup}>
          <Button
            variant='contained'
            color='warning'
            onClick={triggerRouteError}
          >
            Trigger Route Error
          </Button>
        </Box>
      </Box>

      <Box sx={styles.section}>
        <Typography variant='h6' gutterBottom>
          Network Error Test
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          This will make a request to an invalid endpoint. Check the browser
          console for the error.
        </Typography>
        <Box sx={styles.buttonGroup}>
          <Button
            variant='contained'
            color='info'
            onClick={triggerNetworkError}
          >
            Trigger Network Error
          </Button>
        </Box>
      </Box>

      <Alert severity='info' sx={{ mt: 3 }}>
        <strong>Expected Behavior:</strong>
        <ul>
          <li>
            <strong>JavaScript Error:</strong> Should show AppErrorBoundary with
            error details and recovery options
          </li>
          <li>
            <strong>Route Error:</strong> Should show 404 page with navigation
            options
          </li>
          <li>
            <strong>Network Error:</strong> Should log error to console (in
            production, would be handled by error reporting)
          </li>
        </ul>
      </Alert>
    </Box>
  )
}
