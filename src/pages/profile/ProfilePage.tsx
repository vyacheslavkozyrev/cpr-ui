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
  headerSection: { mb: 3 },
  titleContainer: { mb: 0, flex: 1 },
  personalInfoSection: { mb: 3 },
  fieldHelperText: { mt: 1, display: 'block' },
  divider: { my: 3 },
  skillsSection: { mb: 3 },
  monospaceText: { fontFamily: 'monospace' },
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
            {t('profile.noDataAvailable')}
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={styles.container}>
      <Stack direction='row' alignItems='center' sx={styles.headerSection}>
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
          sx={styles.titleContainer}
        >
          {t('profile.userProfile')}
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
              title={t('profile.saveChanges')}
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
              title={t('profile.cancelEditing')}
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
          sx={styles.personalInfoSection}
        >
          <Box textAlign='center'>
            <Avatar alt={user.displayName || 'User'} sx={styles.avatar}>
              {user.initials || getInitials(user.displayName)}
            </Avatar>
            <Typography
              variant='caption'
              color='textSecondary'
              sx={styles.fieldHelperText}
            >
              {t('profile.syncedFromAzure')}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography variant='h5' gutterBottom>
              {user.displayName || t('profile.unknownUser')}
            </Typography>
            <Chip
              label={user.position.title}
              color='primary'
              size='small'
              variant='outlined'
            />
          </Box>
        </Stack>

        <Divider sx={styles.divider} />

        {/* Personal Information Section */}
        <Typography variant='h6' gutterBottom sx={styles.sectionTitle}>
          {t('profile.personalInfo')}
        </Typography>

        <Stack spacing={2} sx={styles.skillsSection}>
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
                  {user.username || t('profile.notProvided')}
                </Typography>
              </Box>

              <Box>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  {t('profile.employeeId')}
                </Typography>
                <Typography variant='body1'>
                  {user.employeeId || t('profile.notAssigned')}
                </Typography>
              </Box>
            </>
          )}
        </Stack>

        <Divider sx={styles.divider} />

        {/* Position & Organization Information */}
        <Typography variant='h6' gutterBottom sx={styles.sectionTitle}>
          {t('profile.positionInfo')}
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              {t('profile.employeeId')}
            </Typography>
            <Typography variant='body1' sx={styles.monospaceText}>
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
            <Typography variant='body1' sx={styles.monospaceText}>
              {user.position.id || t('profile.notAssigned')}
            </Typography>
          </Box>

          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              {t('profile.department')}
            </Typography>
            <Typography variant='body1'>
              {t('profile.comingSoon', {
                feature: t('profile.departmentIntegration'),
              })}
            </Typography>
          </Box>

          <Box>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              {t('profile.reportingManager')}
            </Typography>
            <Typography variant='body1'>
              {t('profile.comingSoon', {
                feature: t('profile.orgChartIntegration'),
              })}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Additional Information Panel */}
      <Paper elevation={1} sx={styles.infoPaper}>
        <Typography variant='body2' color='textSecondary' align='center'>
          {t('profile.azureAdNote')}
        </Typography>
      </Paper>
    </Box>
  )
}
