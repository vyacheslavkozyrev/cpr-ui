import { Cancel, Edit, Save } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { User } from '../../models'
import { useCurrentUser, useUpdateCurrentUser } from '../../services'
import { useToast } from '../../stores'
import { logger } from '../../utils/logger'

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
  editButton: {
    ml: 'auto',
  },
  actionButtons: {
    display: 'flex',
    gap: 2,
    justifyContent: 'flex-end',
    mt: 3,
  },
})

// Form data interface
interface ProfileFormData {
  name: string
  email: string
}

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
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const { data: user, isLoading, error } = useCurrentUser()
  const updateUserMutation = useUpdateCurrentUser()
  const { showSuccess, showError } = useToast()

  const [isEditing, setIsEditing] = useState(false)

  // Form setup with validation
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors, isValid, isDirty },
  } = useForm<ProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
    },
  })

  // Update form when user data changes
  React.useEffect(() => {
    if (user) {
      reset({
        name: user.displayName || '',
        email: user.email || '',
      })
    }
  }, [user, reset])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (user) {
      reset({
        name: user.displayName || '',
        email: user.email || '',
      })
    }
    setIsEditing(false)
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    try {
      const updateData: Partial<User> = {
        displayName: data.name.trim(),
      }

      if (data.email.trim()) {
        updateData.email = data.email.trim()
      }

      // Note: bio is not available in current User model
      // If needed, this would require extending the model

      await updateUserMutation.mutateAsync(updateData)
      setIsEditing(false)
      showSuccess(t('profile.updateSuccess'))
    } catch (error) {
      logger.error('Failed to update profile', { error })
      showError(t('profile.updateError'))
    }
  }

  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <Stack alignItems='center' spacing={2}>
          <CircularProgress />
          <Typography color='textSecondary'>{t('profile.loading')}</Typography>
        </Stack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={styles.container}>
        <Paper elevation={1} sx={styles.errorPaper}>
          <Typography variant='h6' gutterBottom>
            {t('profile.loadError')}
          </Typography>
          <Typography variant='body2'>
            {error.message || t('profile.unableToLoad')}
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
      <Stack direction='row' alignItems='center' sx={{ mb: 3 }}>
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
          sx={{ mb: 0, flex: 1 }}
        >
          User Profile
        </Typography>
        {!isEditing ? (
          <IconButton onClick={handleEdit} color='primary'>
            <Edit />
          </IconButton>
        ) : (
          <Stack direction='row' spacing={1}>
            <IconButton
              onClick={handleSubmit(onSubmit)}
              color='primary'
              disabled={updateUserMutation.isPending || !isValid || !isDirty}
              title='Save changes'
            >
              {updateUserMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <Save />
              )}
            </IconButton>
            <IconButton
              onClick={handleCancel}
              color='default'
              disabled={updateUserMutation.isPending}
              title='Cancel editing'
            >
              <Cancel />
            </IconButton>
          </Stack>
        )}
      </Stack>

      <Paper elevation={2} sx={styles.profilePaper}>
        {/* Avatar and Basic Info Section */}
        <Stack
          direction='row'
          spacing={3}
          alignItems='flex-start'
          sx={{ mb: 3 }}
        >
          <Box textAlign='center'>
            <Avatar alt={user.displayName || 'User'} sx={styles.avatar}>
              {user.initials || getInitials(user.displayName)}
            </Avatar>
            <Typography
              variant='caption'
              color='textSecondary'
              sx={{ mt: 1, display: 'block' }}
            >
              Synced from Azure AD
            </Typography>
          </Box>

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
          {t('profile.personalInfo')}
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          {isEditing ? (
            <>
              <Controller
                name='name'
                control={control}
                rules={{
                  required: t('profile.validation.nameRequired'),
                  minLength: {
                    value: 2,
                    message: t('profile.validation.nameMinLength'),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('profile.displayName')}
                    fullWidth
                    variant='outlined'
                    error={!!formErrors.name}
                    helperText={formErrors.name?.message}
                  />
                )}
              />
              <Controller
                name='email'
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('profile.validation.emailInvalid'),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('profile.email')}
                    fullWidth
                    variant='outlined'
                    type='email'
                    error={!!formErrors.email}
                    helperText={formErrors.email?.message}
                  />
                )}
              />
            </>
          ) : (
            <>
              <Box>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  {t('profile.displayName')}
                </Typography>
                <Typography variant='body1'>
                  {user.displayName || t('profile.notProvided')}
                </Typography>
              </Box>

              <Box>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  {t('profile.email')}
                </Typography>
                <Typography variant='body1'>
                  {user.email || t('profile.notProvided')}
                </Typography>
              </Box>

              <Box>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  {t('profile.username')}
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
            </>
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Position & Organization Information */}
        <Typography variant='h6' gutterBottom sx={styles.sectionTitle}>
          {t('profile.positionInfo')}
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              {t('profile.employeeId')}
            </Typography>
            <Typography variant='body1' sx={{ fontFamily: 'monospace' }}>
              {user.employeeId || t('profile.notAssigned')}
            </Typography>
          </Box>

          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              {t('profile.jobTitle')}
            </Typography>
            <Typography variant='body1'>
              {user.position.title || t('profile.notSpecified')}
            </Typography>
          </Box>

          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              {t('profile.positionId')}
            </Typography>
            <Typography variant='body1' sx={{ fontFamily: 'monospace' }}>
              {user.position.id || t('profile.notAssigned')}
            </Typography>
          </Box>

          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Department
            </Typography>
            <Typography variant='body1'>
              Coming soon - Available through employee directory integration
            </Typography>
          </Box>

          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Reporting Manager
            </Typography>
            <Typography variant='body1'>
              Coming soon - Available through organizational chart integration
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
