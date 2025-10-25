import { Alert, Box } from '@mui/material'
import React, { useMemo } from 'react'
import { UserRole, type UserRole as UserRoleType } from '../../models'
import { useAuthStore } from '../../stores/authStore'

// Style factory outside component
const getStyles = () => ({
  container: {
    p: 2,
  },
})

interface IRoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRoleType[]
  fallback?: React.ReactNode
}

/**
 * RoleGuard Component
 * Protects content based on user roles
 * Shows fallback or error message if user doesn't have required role
 */
export const RoleGuard: React.FC<IRoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const styles = useMemo(() => getStyles(), [])
  const { user } = useAuthStore()

  // Get user roles (defaulting to [UserRole.EMPLOYEE] if not set)
  const userRoles = user?.roles || [UserRole.EMPLOYEE]

  // Check if user has one of the allowed roles
  const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role))

  if (!hasRequiredRole) {
    // Show custom fallback or default error message
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Box sx={styles.container}>
        <Alert severity='warning'>
          You don't have permission to access this content. Required role:{' '}
          {allowedRoles.join(' or ')}
        </Alert>
      </Box>
    )
  }

  // Render protected content if user has required role
  return <>{children}</>
}
