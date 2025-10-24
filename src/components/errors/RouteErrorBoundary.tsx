import {
  Alert,
  Box,
  Button,
  Container,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material'
import React, { useMemo } from 'react'
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from 'react-router-dom'

// Style factory outside component
const getStyles = (theme: Theme) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'background.default',
  },
  errorCard: {
    textAlign: 'center',
    p: 4,
    maxWidth: theme.spacing(60),
    width: '100%',
  },
  actions: {
    mt: 3,
    display: 'flex',
    gap: 2,
    justifyContent: 'center',
  },
  details: {
    mt: 2,
    p: 2,
    backgroundColor: 'grey.100',
    borderRadius: 1,
    textAlign: 'left',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
  },
})

/**
 * RouteErrorBoundary Component
 * Catches and displays routing errors with user-friendly messages
 * Used by React Router for route-level error handling
 */
export const RouteErrorBoundary: React.FC = () => {
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])
  const error = useRouteError()
  const navigate = useNavigate()

  // Determine error type and message
  const getErrorInfo = () => {
    if (isRouteErrorResponse(error)) {
      switch (error.status) {
        case 404:
          return {
            title: 'Page Not Found',
            message: 'The page you are looking for does not exist.',
            severity: 'warning' as const,
          }
        case 401:
          return {
            title: 'Unauthorized',
            message: 'You are not authorized to access this page.',
            severity: 'error' as const,
          }
        case 403:
          return {
            title: 'Forbidden',
            message: 'You do not have permission to access this page.',
            severity: 'error' as const,
          }
        case 500:
          return {
            title: 'Server Error',
            message: 'An internal server error occurred.',
            severity: 'error' as const,
          }
        default:
          return {
            title: 'Something went wrong',
            message: `An error occurred: ${error.status} ${error.statusText}`,
            severity: 'error' as const,
          }
      }
    }

    if (error instanceof Error) {
      return {
        title: 'Application Error',
        message: 'An unexpected error occurred while loading this page.',
        severity: 'error' as const,
        details: import.meta.env.DEV ? error.message : undefined,
      }
    }

    return {
      title: 'Unknown Error',
      message: 'An unknown error occurred.',
      severity: 'error' as const,
      details: import.meta.env.DEV ? String(error) : undefined,
    }
  }

  const handleGoHome = () => {
    navigate('/', { replace: true })
  }

  const handleGoBack = () => {
    window.history.back()
  }

  const handleReload = () => {
    window.location.reload()
  }

  const errorInfo = getErrorInfo()

  return (
    <Box sx={styles.container}>
      <Container sx={styles.errorCard}>
        <Alert severity={errorInfo.severity} sx={{ mb: 3 }}>
          <Typography variant='h5' component='h1' gutterBottom>
            {errorInfo.title}
          </Typography>
          <Typography variant='body1'>{errorInfo.message}</Typography>
        </Alert>

        {errorInfo.details && (
          <Box sx={styles.details}>
            <Typography variant='body2' component='pre'>
              {errorInfo.details}
            </Typography>
          </Box>
        )}

        <Box sx={styles.actions}>
          <Button variant='contained' onClick={handleGoHome}>
            Go Home
          </Button>
          <Button variant='outlined' onClick={handleGoBack}>
            Go Back
          </Button>
          <Button variant='outlined' onClick={handleReload}>
            Reload Page
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
