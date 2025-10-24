import { Box, Paper, Typography, useTheme, type Theme } from '@mui/material'
import React, { useMemo } from 'react'

// Style factory outside component
const getStyles = (theme: Theme) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'background.default',
  },
  paper: {
    p: 4,
    maxWidth: theme.spacing(50),
    width: '100%',
  },
})

/**
 * LoginPage Component
 * Authentication page for user login
 */
export const LoginPage: React.FC = () => {
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])

  return (
    <Box sx={styles.container}>
      <Paper sx={styles.paper}>
        <Typography variant='h4' component='h1' gutterBottom align='center'>
          Login
        </Typography>
        <Typography variant='body1' color='text.secondary' align='center'>
          Authentication page coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}
