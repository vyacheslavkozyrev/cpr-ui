import { Box, Paper, Stack, Typography } from '@mui/material'
import React, { useMemo } from 'react'

// Style factory outside component
const getStyles = () => ({
  container: {
    // Container styles if needed
  },
  card: {
    p: 2,
    textAlign: 'center',
    flex: 1,
  },
})

/**
 * DashboardPage Component
 * Main dashboard with overview widgets
 */
export const DashboardPage: React.FC = () => {
  const styles = useMemo(() => getStyles(), [])

  return (
    <Box sx={styles.container}>
      <Typography variant='h4' component='h1' gutterBottom>
        Dashboard
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Paper sx={styles.card}>
          <Typography variant='h6' gutterBottom>
            Goals
          </Typography>
          <Typography variant='h3' color='primary'>
            12
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Active goals
          </Typography>
        </Paper>

        <Paper sx={styles.card}>
          <Typography variant='h6' gutterBottom>
            Skills
          </Typography>
          <Typography variant='h3' color='secondary'>
            8
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Skills assessed
          </Typography>
        </Paper>

        <Paper sx={styles.card}>
          <Typography variant='h6' gutterBottom>
            Feedback
          </Typography>
          <Typography variant='h3' color='success.main'>
            5
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Recent feedback
          </Typography>
        </Paper>

        <Paper sx={styles.card}>
          <Typography variant='h6' gutterBottom>
            Progress
          </Typography>
          <Typography variant='h3' color='warning.main'>
            75%
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Overall progress
          </Typography>
        </Paper>
      </Stack>
    </Box>
  )
}
