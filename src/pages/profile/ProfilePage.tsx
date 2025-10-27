import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import React, { useMemo } from 'react'
import { useCurrentUser } from '../../services'

// Style factory outside component
const getStyles = () => ({
  container: {
    p: 3,
    maxWidth: '800px',
    mx: 'auto',
  },
  profilePaper: {
    p: 4,
    mb: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    fontSize: '1.5rem',
    bgcolor: 'primary.main',
  },
  sectionTitle: {
    mb: 2,
    color: 'primary.main',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
  errorPaper: {
    p: 3,
    backgroundColor: 'error.light',
    color: 'error.contrastText',
  },
  infoPaper: {
    p: 3,
    backgroundColor: 'background.paper',
    border: 1,
    borderColor: 'divider',
  },
})

const getInitials = (displayName?: string): string => {
  if (!displayName) return '??'
  return displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * ProfilePage Component
 * User profile page displaying personal information and position details
 */
export const ProfilePage: React.FC = () => {
  const styles = useMemo(() => getStyles(), [])
  const { data: user, isLoading, error } = useCurrentUser()

  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <Stack alignItems='center' spacing={2}>
          <CircularProgress />
          <Typography color='textSecondary'>Loading user profile...</Typography>
        </Stack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={styles.container}>
        <Paper elevation={1} sx={styles.errorPaper}>
          <Typography variant='h6' gutterBottom>
            Profile Load Error
          </Typography>
          <Typography variant='body2'>
            {error.message || 'Unable to load profile information'}
          </Typography>
        </Paper>
      </Box>
    )
  }

  if (!user) {
    return (
      <Box sx={styles.container}>
        <Paper elevation={1} sx={styles.profilePaper}>
          <Typography variant='h6' color='textSecondary'>
            No profile data available
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={styles.container}>
      <Typography variant='h4' component='h1' gutterBottom sx={{ mb: 3 }}>
        User Profile
      </Typography>

      <Paper elevation={2} sx={styles.profilePaper}>
        {/* Avatar and Basic Info Section */}
        <Stack direction='row' spacing={3} alignItems='center' sx={{ mb: 3 }}>
          <Avatar alt={user.displayName || 'User'} sx={styles.avatar}>
            {user.initials || getInitials(user.displayName)}
          </Avatar>

          <Box flex={1}>
            <Typography variant='h5' gutterBottom>
              {user.displayName || 'Unknown User'}
            </Typography>
            <Chip
              label={user.position.title}
              color='primary'
              size='small'
              variant='outlined'
            />
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Personal Information Section */}
        <Typography variant='h6' gutterBottom sx={styles.sectionTitle}>
          Personal Information
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Email Address
            </Typography>
            <Typography variant='body1'>
              {user.email || 'Not provided'}
            </Typography>
          </Box>

          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Username
            </Typography>
            <Typography variant='body1'>
              {user.username || 'Not provided'}
            </Typography>
          </Box>

          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Employee ID
            </Typography>
            <Typography variant='body1'>
              {user.employeeId || 'Not assigned'}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Position Information */}
        <Typography variant='h6' gutterBottom sx={styles.sectionTitle}>
          Position Information
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Job Title
            </Typography>
            <Typography variant='body1'>
              {user.position.title || 'Not specified'}
            </Typography>
          </Box>

          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Position ID
            </Typography>
            <Typography variant='body1'>
              {user.position.id || 'Not assigned'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Additional Information Panel */}
      <Paper elevation={1} sx={styles.infoPaper}>
        <Typography variant='body2' color='textSecondary' align='center'>
          Profile information is synchronized with Azure Active Directory. Some
          fields may be managed by your IT administrator.
        </Typography>
      </Paper>
    </Box>
  )
}
