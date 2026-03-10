import { Alert, Box } from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { EUserRole, type EUserRole as EUserRoleType } from '../../models'
import { useAuthStore } from '../../stores/authStore'

// Style factory outside component
const getStyles = () => ({
  container: {
    p: 2,
  },
})

interface IRoleGuardProps {
  children: React.ReactNode
  allowedRoles: EUserRoleType[]
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
  const { t } = useTranslation()
  const { user } = useAuthStore()

  // Get user roles (defaulting to [EUserRole.EMPLOYEE] if not set)
  const userRoles = user?.roles || [EUserRole.EMPLOYEE]

  // Check if user has one of the allowed roles
  const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role))

  if (!hasRequiredRole) {
    // fallback={null} means intentionally render nothing; undefined means no fallback provided
    if (fallback !== undefined) {
      return <>{fallback}</>
    }

    return (
      <Box sx={styles.container}>
        <Alert severity='warning'>
          {t('auth.roleGuard.noPermission', {
            roles: allowedRoles.join(` ${t('common.or', 'or')} `),
          })}
        </Alert>
      </Box>
    )
  }

  // Render protected content if user has required role
  return <>{children}</>
}
