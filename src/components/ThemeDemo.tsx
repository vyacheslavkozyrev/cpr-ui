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
import React from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../hooks/useTheme'

// Theme demo component to showcase the theme system
export const ThemeDemo: React.FC = () => {
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
                🎨 Theme System Demo
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
                  <strong>isDark():</strong> {isDark() ? '✅ Yes' : '❌ No'}
                </Typography>
                <Typography variant='body2'>
                  <strong>isLight():</strong> {isLight() ? '✅ Yes' : '❌ No'}
                </Typography>
                <Typography variant='body2'>
                  <strong>isSystemMode():</strong>{' '}
                  {isSystemMode() ? '✅ Yes' : '❌ No'}
                </Typography>
              </Stack>
            </Box>

            {/* Color Palette Demo */}
            <Box>
              <Typography variant='h6' gutterBottom>
                Color Palette Demo
              </Typography>
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                >
                  <Typography variant='body2'>Primary</Typography>
                </Paper>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                  }}
                >
                  <Typography variant='body2'>Secondary</Typography>
                </Paper>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'success.main',
                    color: 'success.contrastText',
                  }}
                >
                  <Typography variant='body2'>Success</Typography>
                </Paper>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                  }}
                >
                  <Typography variant='body2'>Warning</Typography>
                </Paper>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                  }}
                >
                  <Typography variant='body2'>Error</Typography>
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
                <Button variant='contained'>Contained Button</Button>
                <Button variant='outlined'>Outlined Button</Button>
                <Button variant='text'>Text Button</Button>
                <Chip label='Chip Component' />
                <Chip label='Deletable Chip' onDelete={() => {}} />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ThemeDemo
