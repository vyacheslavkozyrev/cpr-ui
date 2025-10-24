import { Box } from '@mui/material'
import React, { useMemo } from 'react'
import { LoginForm } from '../../components/auth'

// Style factory outside component
const getStyles = () => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'background.default',
    p: 2,
  },
})

/**
 * LoginPage Component
 * Authentication page for user login
 */
export const LoginPage: React.FC = () => {
  const styles = useMemo(() => getStyles(), [])

  return (
    <Box sx={styles.container}>
      <LoginForm />
    </Box>
  )
}
