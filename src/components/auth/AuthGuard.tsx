import { Box, CircularProgress, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useAuth } from '../../stores/authStore';
import { LoginForm } from './LoginForm';

interface IAuthGuardProps {
  children: ReactNode;
  requireRoles?: string[];
  fallback?: ReactNode;
}

export const AuthGuard = ({ 
  children, 
  requireRoles = [], 
  fallback 
}: IAuthGuardProps) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    hasAnyRole,
    error 
  } = useAuth();
  const styles = useMemo(() => ({
    center: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      gap: 2,
    },
    centerPadded: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      p: 3,
      textAlign: 'center',
    },
    requiredRoles: { mt: 2 },
  }), []);

  // Show loading state
  if (isLoading) {
    return (
      <Box
        sx={styles.center}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  // Check role requirements
  if (requireRoles.length > 0 && !hasAnyRole(requireRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box
        sx={styles.centerPadded}
      >
        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have the required permissions to access this area.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Required roles: {requireRoles.join(', ')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your roles: {user.roles.join(', ')}
        </Typography>
      </Box>
    );
  }

  // Show error state if there's an authentication error
  if (error) {
    return (
      <Box
        sx={styles.centerPadded}
      >
        <Typography variant="h5" gutterBottom color="error">
          Authentication Error
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  // User is authenticated and has required roles
  return <>{children}</>;
};

// Convenience components for common role checks
export const UserGuard = ({ children }: { children: ReactNode }) => (
  <AuthGuard requireRoles={['CPR.User']}>
    {children}
  </AuthGuard>
);

export const AdminGuard = ({ children }: { children: ReactNode }) => (
  <AuthGuard requireRoles={['CPR.Admin']}>
    {children}
  </AuthGuard>
);