import { Alert, Box, Card, CardContent, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { WidgetSkeleton } from './WidgetSkeleton'

const getStyles = () => ({
  card: (height: number | string) => ({
    height,
    display: 'flex',
    flexDirection: 'column',
  }),
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  titleContainer: { mb: 2 },
  contentContainer: { flex: 1 },
  errorAlert: { mt: 1 },
  errorDetails: {
    mt: 1,
    fontSize: '0.7rem',
    opacity: 0.7,
  },
})

interface IDashboardWidgetProps {
  title?: string
  children: React.ReactNode
  isLoading?: boolean
  error?: Error | null
  height?: number | string
}

/**
 * DashboardWidget Component
 * Wrapper component for dashboard widgets with loading and error states
 */
export const DashboardWidget: React.FC<IDashboardWidgetProps> = ({
  title,
  children,
  isLoading = false,
  error = null,
  height = 'auto',
}) => {
  const styles = useMemo(() => getStyles(), [])
  return (
    <Card elevation={1} sx={styles.card(height)}>
      <CardContent sx={styles.cardContent}>
        {/* Widget Header */}
        {title && (
          <Box sx={styles.titleContainer}>
            <Typography variant='h6' component='h3' gutterBottom>
              {title}
            </Typography>
          </Box>
        )}

        {/* Widget Content */}
        <Box sx={styles.contentContainer}>
          {error ? (
            <Alert severity='error' sx={styles.errorAlert}>
              Failed to load {title ? title.toLowerCase() : 'widget'}. Please
              try again later.
              {/* Temporary debug info - remove in production */}
              {import.meta.env.DEV && (
                <Typography
                  variant='caption'
                  component='div'
                  sx={styles.errorDetails}
                >
                  Debug: {error.message}
                </Typography>
              )}
            </Alert>
          ) : isLoading ? (
            <WidgetSkeleton />
          ) : (
            children
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
