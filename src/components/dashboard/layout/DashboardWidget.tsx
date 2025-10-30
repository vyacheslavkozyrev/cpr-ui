import { Alert, Box, Card, CardContent, Typography } from '@mui/material'
import React from 'react'
import { WidgetSkeleton } from './WidgetSkeleton'

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
  return (
    <Card
      elevation={1}
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Widget Header */}
        {title && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='h6' component='h3' gutterBottom>
              {title}
            </Typography>
          </Box>
        )}

        {/* Widget Content */}
        <Box sx={{ flex: 1 }}>
          {error ? (
            <Alert severity='error' sx={{ mt: 1 }}>
              Failed to load {title ? title.toLowerCase() : 'widget'}. Please
              try again later.
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
