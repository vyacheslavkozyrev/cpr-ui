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
import { useNavigate } from 'react-router-dom'

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
    flexWrap: 'wrap',
  },
  errorCode: {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: 'text.secondary',
    mb: 2,
  },
})

interface IErrorPageProps {
  code?: number
  title?: string
  message?: string
  showHomeButton?: boolean
  showBackButton?: boolean
  showReloadButton?: boolean
  onCustomAction?: () => void
  customActionText?: string
}

/**
 * ErrorPage Component
 * Reusable error page for displaying various error states
 * Can be used for 404, 500, network errors, etc.
 */
export const ErrorPage: React.FC<IErrorPageProps> = ({
  code,
  title,
  message,
  showHomeButton = true,
  showBackButton = true,
  showReloadButton = false,
  onCustomAction,
  customActionText,
}) => {
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/', { replace: true })
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate('/', { replace: true })
    }
  }

  const handleReload = () => {
    window.location.reload()
  }

  // Default error messages based on code
  const getDefaultContent = () => {
    switch (code) {
      case 404:
        return {
          title: 'Page Not Found',
          message:
            'The page you are looking for does not exist or has been moved.',
          severity: 'warning' as const,
        }
      case 401:
        return {
          title: 'Unauthorized',
          message: 'You need to log in to access this page.',
          severity: 'error' as const,
        }
      case 403:
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access this resource.',
          severity: 'error' as const,
        }
      case 500:
        return {
          title: 'Server Error',
          message: 'An internal server error occurred. Please try again later.',
          severity: 'error' as const,
        }
      default:
        return {
          title: 'Something went wrong',
          message: 'An unexpected error occurred.',
          severity: 'error' as const,
        }
    }
  }

  const defaultContent = getDefaultContent()
  const finalTitle = title || defaultContent.title
  const finalMessage = message || defaultContent.message

  return (
    <Box sx={styles.container}>
      <Container sx={styles.errorCard}>
        {code && (
          <Typography variant='h1' sx={styles.errorCode}>
            {code}
          </Typography>
        )}

        <Alert severity={defaultContent.severity} sx={{ mb: 3 }}>
          <Typography variant='h4' component='h1' gutterBottom>
            {finalTitle}
          </Typography>
          <Typography variant='body1'>{finalMessage}</Typography>
        </Alert>

        <Box sx={styles.actions}>
          {showHomeButton && (
            <Button variant='contained' onClick={handleGoHome}>
              Go Home
            </Button>
          )}
          {showBackButton && (
            <Button variant='outlined' onClick={handleGoBack}>
              Go Back
            </Button>
          )}
          {showReloadButton && (
            <Button variant='outlined' onClick={handleReload}>
              Reload Page
            </Button>
          )}
          {onCustomAction && customActionText && (
            <Button variant='outlined' onClick={onCustomAction}>
              {customActionText}
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  )
}

/**
 * Specific error page components for common scenarios
 */
export const NotFoundPage: React.FC = () => <ErrorPage code={404} />

export const UnauthorizedPage: React.FC = () => <ErrorPage code={401} />

export const ForbiddenPage: React.FC = () => <ErrorPage code={403} />

export const ServerErrorPage: React.FC = () => (
  <ErrorPage code={500} showReloadButton />
)
