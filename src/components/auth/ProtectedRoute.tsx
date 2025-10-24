import { Box, CircularProgress } from '@mui/material'
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface IProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects to login if not authenticated
 */
export const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuthStore()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <CircularProgress />
      </Box>
    )
  }

  // Redirect to login if not authenticated, preserving the intended location
  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // Render protected content if authenticated
  return <>{children}</>
}
