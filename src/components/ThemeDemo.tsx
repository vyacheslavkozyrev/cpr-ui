import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeToggle } from '../components/ThemeToggle'
import { useTheme } from '../hooks/useTheme'

const getStyles = () => ({
  primaryPaper: {
    p: 2,
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
  },
  secondaryPaper: {
    p: 2,
    bgcolor: 'secondary.main',
    color: 'secondary.contrastText',
  },
  errorPaper: {
    p: 2,
    bgcolor: 'error.main',
    color: 'error.contrastText',
  },
  warningPaper: {
    p: 2,
    bgcolor: 'warning.main',
    color: 'warning.contrastText',
  },
  infoPaper: {
    p: 2,
    bgcolor: 'info.main',
    color: 'info.contrastText',
  },
  successPaper: {
    p: 2,
    bgcolor: 'success.main',
    color: 'success.contrastText',
  },
})

// Theme demo component to showcase the theme system
export const ThemeDemo: React.FC = () => {
  const { t } = useTranslation()
  const {
    mode,
    resolvedTheme,
    systemTheme,
    isDark,
    isLight,
    isSystemMode,
    setLight,
    setDark,
    setSystem,
  } = useTheme()
  const styles = useMemo(() => getStyles(), [])

  return (
    <Box p={3} maxWidth={800} mx='auto'>
      <Card elevation={2}>
        <CardContent>
          <Stack spacing={3}>
            {/* Header */}
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Typography variant='h4' gutterBottom>
                ðŸŽ¨ Theme System Demo
              </Typography>
              <ThemeToggle variant='menu' />
            </Box>

            <Divider />

            {/* Theme Status */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Current Theme Status
              </Typography>
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Chip
                  label={`Mode: ${mode}`}
                  color={mode === 'system' ? 'secondary' : 'primary'}
                  variant='outlined'
                />
                <Chip
                  label={`Resolved: ${resolvedTheme}`}
                  color={resolvedTheme === 'dark' ? 'default' : 'primary'}
                />
                <Chip
                  label={`System: ${systemTheme}`}
                  color='info'
                  variant='outlined'
                />
              </Stack>
            </Box>

            {/* Theme Controls */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Theme Controls
              </Typography>
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Button
                  variant={mode === 'light' ? 'contained' : 'outlined'}
                  onClick={setLight}
                  size='small'
                >
                  Light Mode
                </Button>
                <Button
                  variant={mode === 'dark' ? 'contained' : 'outlined'}
                  onClick={setDark}
                  size='small'
                >
                  Dark Mode
                </Button>
                <Button
                  variant={mode === 'system' ? 'contained' : 'outlined'}
                  onClick={setSystem}
                  size='small'
                >
                  System Mode
                </Button>
              </Stack>
            </Box>

            {/* Theme Utilities */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Theme Utilities
              </Typography>
              <Stack spacing={1}>
                <Typography variant='body2'>
                  <strong>isDark():</strong> {isDark() ? 'âœ… Yes' : 'âŒ No'}
                </Typography>
                <Typography variant='body2'>
                  <strong>isLight():</strong> {isLight() ? 'âœ… Yes' : 'âŒ No'}
                </Typography>
                <Typography variant='body2'>
                  <strong>isSystemMode():</strong>{' '}
                  {isSystemMode() ? 'âœ… Yes' : 'âŒ No'}
                </Typography>
              </Stack>
            </Box>

            {/* Color Palette Demo */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Color Palette Demo
              </Typography>
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Paper sx={styles.primaryPaper}>
                  <Typography variant='body2'>
                    {t('theme.demo.colors.primary')}
                  </Typography>
                </Paper>
                <Paper sx={styles.secondaryPaper}>
                  <Typography variant='body2'>
                    {t('theme.demo.colors.secondary')}
                  </Typography>
                </Paper>
                <Paper sx={styles.successPaper}>
                  <Typography variant='body2'>
                    {t('theme.demo.colors.success')}
                  </Typography>
                </Paper>
                <Paper sx={styles.warningPaper}>
                  <Typography variant='body2'>
                    {t('theme.demo.colors.warning')}
                  </Typography>
                </Paper>
                <Paper sx={styles.errorPaper}>
                  <Typography variant='body2'>
                    {t('theme.demo.colors.error')}
                  </Typography>
                </Paper>
              </Stack>
            </Box>

            {/* Typography Demo */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Typography Demo
              </Typography>
              <Stack spacing={1}>
                <Typography variant='h1'>Heading 1</Typography>
                <Typography variant='h2'>Heading 2</Typography>
                <Typography variant='h3'>Heading 3</Typography>
                <Typography variant='body1'>
                  Body 1: This is the main body text used throughout the
                  application. It's optimized for readability and follows
                  Material Design guidelines.
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Body 2: This is secondary body text with a slightly smaller
                  size and secondary color for less prominent content.
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Caption: This is caption text used for small labels and
                  metadata.
                </Typography>
              </Stack>
            </Box>

            {/* Component Demo */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Component Demo
              </Typography>
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Button variant='contained'>
                  {t('theme.demo.buttons.contained')}
                </Button>
                <Button variant='outlined'>
                  {t('theme.demo.buttons.outlined')}
                </Button>
                <Button variant='text'>{t('theme.demo.buttons.text')}</Button>
                <Chip label={t('theme.demo.components.chip')} />
                <Chip
                  label={t('theme.demo.components.deletableChip')}
                  onDelete={() => {}}
                />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
