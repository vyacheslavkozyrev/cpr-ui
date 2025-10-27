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
import { useTranslation } from 'react-i18next'
import { DatePreview } from '../../components/common/DatePreview'
import { useDateFormat } from '../../hooks/useDateFormat'
import { useLanguageStore, useToast } from '../../stores'
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
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
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

  // Language management
  const {
    language: currentLanguage,
    dateFormat: currentDateFormat,
    availableLanguages,
    availableDateFormats,
    setLanguage,
    setDateFormat,
    getLanguageName,
    getLanguageFlag,
    getDateFormatLabel,
  } = useLanguageStore()

  const handleThemeChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const newTheme = event.target.value as TThemeMode
      setMode(newTheme)
      const message =
        newTheme === 'system'
          ? t('toast.themeChangedSystem')
          : t('toast.themeChanged', { mode: newTheme })
      showSuccess(message)
    },
    [setMode, showSuccess, t]
  )

  const handleLanguageChange = useCallback(
    (event: SelectChangeEvent) => {
      const newLanguage = event.target.value as typeof currentLanguage
      setLanguage(newLanguage)
      showSuccess(`Language changed to ${getLanguageName(newLanguage)}`)
    },
    [setLanguage, showSuccess, getLanguageName]
  )

  const handleDateFormatChange = useCallback(
    (event: SelectChangeEvent) => {
      const newFormat = event.target.value as typeof currentDateFormat
      setDateFormat(newFormat)
      showSuccess(
        t('toast.dateFormatChanged', { format: getDateFormatLabel(newFormat) })
      )
    },
    [setDateFormat, showSuccess, t, getDateFormatLabel]
  )

  const handleDarkModeToggle = useCallback(() => {
    toggleTheme()
    const newMode = resolvedTheme === 'dark' ? 'light' : 'dark'
    showSuccess(t('toast.themeSwitched', { mode: newMode }))
  }, [toggleTheme, showSuccess, resolvedTheme, t])

  return (
    <Box sx={styles.container}>
      {/* Page Header */}
      <Box sx={styles.header}>
        <Settings color='primary' />
        <Typography variant='h4' component='h1'>
          {t('settings.title')}
        </Typography>
      </Box>

      <Typography variant='body1' color='textSecondary' sx={{ mb: 4 }}>
        {t('settings.subtitle')}
      </Typography>

      {/* Appearance Settings */}
      <Card sx={styles.settingsCard}>
        <CardHeader
          title={t('settings.appearance.title')}
          subheader={t('settings.appearance.subtitle')}
        />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            {/* Theme Selection */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  {t('settings.appearance.theme')}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  {t('settings.appearance.themeDescription')}
                  {currentTheme === 'system' && (
                    <Typography variant='caption' display='block'>
                      {t('settings.appearance.systemPreference', {
                        mode: systemTheme,
                      })}
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
                  <MenuItem value='light'>
                    {t('settings.appearance.light')}
                  </MenuItem>
                  <MenuItem value='dark'>
                    {t('settings.appearance.dark')}
                  </MenuItem>
                  <MenuItem value='system'>
                    {t('settings.appearance.system')}
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Quick Dark Mode Toggle */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  {t('settings.appearance.darkMode')}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  {t('settings.appearance.darkModeDescription')}
                  {currentTheme === 'system' &&
                    t('settings.appearance.darkModeSystemOverride')}
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
          title={t('settings.language.title')}
          subheader={t('settings.language.subtitle')}
        />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            {/* Language Selection */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  {t('settings.language.language')}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Choose your preferred language
                </Typography>
              </Box>
              <FormControl sx={styles.settingControl}>
                <Select
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  size='small'
                >
                  {availableLanguages.map(lang => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {getLanguageFlag(lang.code)} {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Date Format */}
            <Box sx={styles.settingItem}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  {t('settings.language.dateFormat')}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  {t('settings.language.dateFormatDescription')}
                </Typography>
                <Typography
                  variant='caption'
                  color='textSecondary'
                  sx={{ mt: 0.5 }}
                >
                  Preview: {formatDate(new Date(), currentDateFormat)}
                </Typography>
              </Box>
              <FormControl sx={styles.settingControl}>
                <Select
                  value={currentDateFormat}
                  onChange={handleDateFormatChange}
                  size='small'
                >
                  {availableDateFormats.map(format => (
                    <MenuItem key={format} value={format}>
                      {t(
                        `settings.language.dateFormats.${format.toLowerCase()}`
                      )}
                    </MenuItem>
                  ))}
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

      {/* Date Localization Preview (for demonstration) */}
      <DatePreview />
    </Box>
  )
}
