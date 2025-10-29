import { Login as LoginIcon, Person as PersonIcon } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../stores/authStore'
import { logger } from '../../utils/logger'

// Styles factory — defined outside component per agreed pattern
const getStyles = () => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    p: 2,
  },
  card: {
    maxWidth: 400,
    width: '100%',
  },
  cardContent: {
    textAlign: 'center',
    p: 4,
  },
  heroIcon: {
    fontSize: 64,
    color: 'primary.main',
    mb: 2,
  },
  paragraph: {
    mb: 3,
  },
  button: {
    mb: 2,
  },
})

export const LoginForm = () => {
  const { login, isLoading, error, isStubMode, isAuthenticated } = useAuth()
  const styles = useMemo(() => getStyles(), [])
  const navigate = useNavigate()

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async () => {
    try {
      await login()
    } catch (err) {
      logger.error('Login failed', { error: err })
    }
  }

  return (
    <Box sx={styles.container}>
      <Card sx={styles.card}>
        <CardContent sx={styles.cardContent}>
          <PersonIcon sx={styles.heroIcon} />

          <Typography variant='h4' component='h1' gutterBottom>
            CPR System
          </Typography>

          <Typography
            variant='body1'
            color='text.secondary'
            sx={styles.paragraph}
          >
            Continuous Performance Review
          </Typography>

          {isStubMode && (
            <Alert severity='info' sx={styles.paragraph}>
              Running in development mode with stub authentication
            </Alert>
          )}

          {error && (
            <Alert severity='error' sx={styles.paragraph}>
              {error}
            </Alert>
          )}

          <Button
            variant='contained'
            size='large'
            fullWidth
            onClick={handleLogin}
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                <LoginIcon />
              )
            }
            sx={styles.button}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Typography variant='caption' color='text.secondary'>
            {isStubMode
              ? 'Development mode - no real authentication required'
              : 'Sign in with your Microsoft account'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
