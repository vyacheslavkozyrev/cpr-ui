import {
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../stores/authStore'
import { logger } from '../../utils/logger'

const getStyles = () => ({
  root: { p: 3 },
  card: { maxWidth: 600, mx: 'auto' },
  cardContent: { p: 4 },
  headerBox: { display: 'flex', alignItems: 'center', gap: 2 },
  avatar: { bgcolor: 'primary.main', width: 56, height: 56 },
  monospace: { fontFamily: 'monospace' },
  rolesLabel: { mb: 1 },
  accessToken: {
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    color: 'success.main',
  },
  flexRow: { display: 'flex', alignItems: 'center', gap: 2 },
})

export const UserProfile = () => {
  const { t } = useTranslation()
  const { user, logout, isLoading, error, isStubMode, isAdmin, hasRole } =
    useAuth()
  const styles = useMemo(() => getStyles(), [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      logger.error('Logout failed', { error: err })
    }
  }

  if (!user) {
    return null
  }

  return (
    <Box sx={styles.root}>
      <Card sx={styles.card}>
        <CardContent sx={styles.cardContent}>
          <Stack spacing={3}>
            {/* Header */}
            <Box sx={styles.headerBox}>
              <Avatar sx={styles.avatar}>
                {isAdmin() ? <AdminIcon /> : <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant='h5' component='h1'>
                  {user.name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {user.email}
                </Typography>
              </Box>
            </Box>

            {isStubMode && <Alert severity='info'>{t('auth.devMode')}</Alert>}

            {error && <Alert severity='error'>{error}</Alert>}

            <Divider />

            {/* User Details */}
            <Stack spacing={2}>
              <Typography variant='h6'>{t('auth.accountDetails')}</Typography>

              <Box>
                <Typography variant='body2' color='text.secondary'>
                  {t('auth.userId')}
                </Typography>
                <Typography variant='body1' sx={styles.monospace}>
                  {user.id}
                </Typography>
              </Box>

              <Box>
                <Typography variant='body2' color='text.secondary'>
                  {t('auth.tenantId')}
                </Typography>
                <Typography variant='body1' sx={styles.monospace}>
                  {user.tenantId}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={styles.rolesLabel}
                >
                  {t('auth.roles')}
                </Typography>
                <Stack direction='row' spacing={1} flexWrap='wrap'>
                  {user.roles.map(role => (
                    <Chip
                      key={role}
                      label={role}
                      size='small'
                      color={role.includes('Admin') ? 'error' : 'primary'}
                      variant={role.includes('Admin') ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Access token info (for development) */}
              {(isStubMode || user.accessToken) && (
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    {t('auth.accessToken')}
                  </Typography>
                  <Typography variant='body2' sx={styles.accessToken}>
                    {user.accessToken
                      ? 'â—â—â—â—â—â—â—â—â—â—â—â—â—â—â—â—'
                      : t('auth.notAvailable')}
                    {isStubMode && ` ${t('auth.stubToken')}`}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Divider />

            {/* Permission Checks */}
            <Stack spacing={2}>
              <Typography variant='h6'>{t('auth.permissions')}</Typography>

              <Stack spacing={1}>
                <Box sx={styles.flexRow}>
                  <Typography variant='body2'>
                    {t('auth.userAccess')}
                  </Typography>
                  <Chip
                    label={
                      hasRole('CPR.User') ? t('auth.granted') : t('auth.denied')
                    }
                    color={hasRole('CPR.User') ? 'success' : 'error'}
                    size='small'
                  />
                </Box>

                <Box sx={styles.flexRow}>
                  <Typography variant='body2'>
                    {t('auth.adminAccess')}
                  </Typography>
                  <Chip
                    label={isAdmin() ? t('auth.granted') : t('auth.denied')}
                    color={isAdmin() ? 'success' : 'error'}
                    size='small'
                  />
                </Box>
              </Stack>
            </Stack>

            <Divider />

            {/* Actions */}
            <Button
              variant='outlined'
              color='error'
              onClick={handleLogout}
              disabled={isLoading}
              startIcon={<LogoutIcon />}
              fullWidth
            >
              {isLoading ? t('auth.signingOut') : t('auth.signOut')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
