import { Box, Card, CardContent, Typography } from '@mui/material'
import React from 'react'
import { useDateFormat } from '../../hooks/useDateFormat'

/**
 * DatePreview Component
 *
 * Demonstrates different date formatting options with the current locale
 */
export const DatePreview: React.FC = () => {
  const { formatDate, formatDateDistance, formatDateRelative, language } =
    useDateFormat()

  // Sample dates for demonstration
  const now = new Date()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const birthday = new Date(1990, 3, 15) // April 15, 1990

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Date Localization Preview
        </Typography>
        <Typography variant='caption' color='textSecondary' gutterBottom>
          Current locale: {language}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box>
            <Typography variant='body2' color='textSecondary'>
              Today (Different formats):
            </Typography>
            <Typography variant='body1'>
              Short: {formatDate(now, 'SHORT')}
            </Typography>
            <Typography variant='body1'>
              Medium: {formatDate(now, 'MEDIUM')}
            </Typography>
            <Typography variant='body1'>
              Long: {formatDate(now, 'LONG')}
            </Typography>
            <Typography variant='body1'>
              Full: {formatDate(now, 'FULL')}
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant='body2' color='textSecondary'>
              Relative dates:
            </Typography>
            <Typography variant='body1'>
              Yesterday: {formatDateDistance(yesterday)}
            </Typography>
            <Typography variant='body1'>
              Last week: {formatDateDistance(lastWeek)}
            </Typography>
            <Typography variant='body1'>
              Yesterday (relative): {formatDateRelative(yesterday)}
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant='body2' color='textSecondary'>
              Fixed date (April 15, 1990):
            </Typography>
            <Typography variant='body1'>
              {formatDate(birthday, 'FULL')}
            </Typography>
            <Typography variant='body1'>
              Age: {formatDateDistance(birthday, now, { addSuffix: false })} old
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
