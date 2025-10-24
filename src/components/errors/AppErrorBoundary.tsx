import { Alert, Box, Button, Container, Typography } from '@mui/material'
import React, { type ErrorInfo, type ReactNode } from 'react'

export interface IErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

interface IErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * AppErrorBoundary Component
 * React Error Boundary for catching JavaScript errors during rendering
 * Displays user-friendly error message and recovery options
 */
export class AppErrorBoundary extends React.Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  constructor(props: IErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<IErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('React Error Boundary caught an error:', error, errorInfo)
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // In production, you might want to log to an error reporting service
    // Example: logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  override render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Box
          sx={{
            minHeight: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Container maxWidth='md'>
            <Alert severity='error' sx={{ mb: 3 }}>
              <Typography variant='h5' component='h1' gutterBottom>
                Something went wrong
              </Typography>
              <Typography variant='body1' gutterBottom>
                An unexpected error occurred. Please try refreshing the page or
                contact support if the problem persists.
              </Typography>
            </Alert>

            {import.meta.env.DEV && this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  overflow: 'auto',
                }}
              >
                <Typography variant='subtitle2' gutterBottom>
                  Error Details (Development Only):
                </Typography>
                <Typography
                  variant='body2'
                  component='pre'
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}

            <Box
              sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}
            >
              <Button variant='contained' onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant='outlined' onClick={this.handleReload}>
                Reload Page
              </Button>
            </Box>
          </Container>
        </Box>
      )
    }

    return this.props.children
  }
}
