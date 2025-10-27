import { Settings } from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import React, { useCallback, useMemo } from 'react'
import { useToast } from '../../stores'
import { useThemeStore, type TThemeMode } from '../../stores/themeStore'

// Style factory outside component
const getStyles = () => ({
  container: {
    p: 3,
    maxWidth: '800px',
    mx: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 3,
  },
  settingsCard: {
    mb: 3,
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    py: 2,
  },
  settingControl: {
    minWidth: '120px',
  },
})

/**
 * SettingsPage Component
 * User preferences and configuration settings
 */
export const SettingsPage: React.FC = () => {
  const styles = useMemo(() => getStyles(), [])
  const { showSuccess } = useToast()

  // Theme management
  const {
    mode: currentTheme,
    resolvedTheme,
    systemTheme,
    setMode,
    toggleTheme,
    isSystemMode,
  } = useThemeStore()

  const handleThemeChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const newTheme = event.target.value as TThemeMode
      setMode(newTheme)
      showSuccess(
        `Theme changed to ${newTheme === 'system' ? 'system preference' : newTheme} mode`
      )
    },
    [setMode, showSuccess]
  )

  const handleDarkModeToggle = useCallback(() => {
    toggleTheme()
    showSuccess(
      `Switched to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`
    )
  }, [toggleTheme, showSuccess, resolvedTheme])

  return (
    <Box sx={styles.container}>
      {/* Page Header */}
      <Box sx={styles.header}>
        <Settings color='primary' />
        <Typography variant='h4' component='h1'>
          Settings
        </Typography>
      </Box>

      <Typography variant='body1' color='textSecondary' sx={{ mb: 4 }}>
        Customize your experience and preferences
      </Typography>

      {/* Appearance Settings */}
      <Card sx={styles.settingsCard}>
        <CardHeader
          title='Appearance'
          subheader='Customize the look and feel of the application'
        />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            {/* Theme Selection */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Theme
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Choose your preferred color theme
                  {currentTheme === 'system' && (
                    <Typography variant='caption' display='block'>
                      Currently following system preference ({systemTheme})
                    </Typography>
                  )}
                </Typography>
              </Box>
              <FormControl sx={styles.settingControl}>
                <Select
                  value={currentTheme}
                  onChange={handleThemeChange}
                  size='small'
                >
                  <MenuItem value='light'>Light</MenuItem>
                  <MenuItem value='dark'>Dark</MenuItem>
                  <MenuItem value='system'>System</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Quick Dark Mode Toggle */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Dark Mode
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Quick toggle for dark mode
                  {currentTheme === 'system' &&
                    ' (overrides system preference)'}
                </Typography>
              </Box>
              <Switch
                checked={resolvedTheme === 'dark'}
                onChange={handleDarkModeToggle}
                disabled={isSystemMode()}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Language & Region Settings */}
      <Card sx={styles.settingsCard}>
        <CardHeader
          title='Language & Region'
          subheader='Set your language and regional preferences'
        />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            {/* Language Selection - Placeholder for i18n */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Language
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Choose your preferred language (coming soon)
                </Typography>
              </Box>
              <FormControl sx={styles.settingControl} disabled>
                <Select value='en' size='small'>
                  <MenuItem value='en'>English</MenuItem>
                  <MenuItem value='es'>Español</MenuItem>
                  <MenuItem value='fr'>Français</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Date Format */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Date Format
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  How dates are displayed (coming soon)
                </Typography>
              </Box>
              <FormControl sx={styles.settingControl} disabled>
                <Select value='mm-dd-yyyy' size='small'>
                  <MenuItem value='mm-dd-yyyy'>MM/DD/YYYY</MenuItem>
                  <MenuItem value='dd-mm-yyyy'>DD/MM/YYYY</MenuItem>
                  <MenuItem value='yyyy-mm-dd'>YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card sx={styles.settingsCard}>
        <CardHeader
          title='Notifications'
          subheader='Configure how you receive notifications'
        />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            {/* Email Notifications */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Email Notifications
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Receive email updates for important activities (coming soon)
                </Typography>
              </Box>
              <Switch disabled />
            </Box>

            <Divider />

            {/* Browser Notifications */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Browser Notifications
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Show desktop notifications (coming soon)
                </Typography>
              </Box>
              <Switch disabled />
            </Box>

            <Divider />

            {/* Toast Duration */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Toast Duration
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  How long success/error messages are shown (coming soon)
                </Typography>
              </Box>
              <FormControl sx={styles.settingControl} disabled>
                <Select value='6000' size='small'>
                  <MenuItem value='3000'>3 seconds</MenuItem>
                  <MenuItem value='6000'>6 seconds</MenuItem>
                  <MenuItem value='10000'>10 seconds</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Privacy & Data Settings */}
      <Card sx={styles.settingsCard}>
        <CardHeader
          title='Privacy & Data'
          subheader='Manage your data and privacy preferences'
        />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            {/* Analytics */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Usage Analytics
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Help improve the app by sharing anonymous usage data (coming
                  soon)
                </Typography>
              </Box>
              <Switch disabled />
            </Box>

            <Divider />

            {/* Data Export */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Data Export
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Download your data in portable format (coming soon)
                </Typography>
              </Box>
              <Typography
                variant='body2'
                color='primary'
                sx={{ cursor: 'pointer', opacity: 0.5 }}
              >
                Export Data
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
