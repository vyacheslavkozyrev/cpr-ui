import {
  DarkMode as DarkIcon,
  LightMode as LightIcon,
  SettingsBrightness as SystemIcon,
} from '@mui/icons-material'
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useThemeStore, type TThemeMode } from '../stores/themeStore'

// Theme toggle button props
interface ThemeToggleProps {
  variant?: 'icon' | 'menu' | 'toggle'
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
  className?: string
}

// Theme mode options for menu - using keys that will be translated
const getThemeOptions = (
  t: (key: string) => string
): Array<{
  mode: TThemeMode
  label: string
  icon: React.ReactElement
  description: string
}> => [
  {
    mode: 'light',
    label: t('theme.modes.light'),
    icon: <LightIcon />,
    description: t('theme.descriptions.light'),
  },
  {
    mode: 'dark',
    label: t('theme.modes.dark'),
    icon: <DarkIcon />,
    description: t('theme.descriptions.dark'),
  },
  {
    mode: 'system',
    label: t('theme.modes.system'),
    icon: <SystemIcon />,
    description: t('theme.descriptions.system'),
  },
]

// Simple toggle button (cycles through light -> dark -> system)
const ThemeToggleButton: React.FC<Omit<ThemeToggleProps, 'variant'>> = ({
  size = 'medium',
  showLabel = false,
  className,
}) => {
  const { t } = useTranslation()
  const { mode, toggleTheme, resolvedTheme } = useThemeStore()

  const getCurrentIcon = () => {
    if (mode === 'system') return <SystemIcon />
    return resolvedTheme === 'dark' ? <DarkIcon /> : <LightIcon />
  }

  const getTooltipText = () => {
    switch (mode) {
      case 'light':
        return t('theme.tooltips.switchToDark')
      case 'dark':
        return t('theme.tooltips.switchToSystem')
      case 'system':
        return t('theme.tooltips.switchToLight')
      default:
        return t('theme.tooltips.toggle')
    }
  }

  return (
    <Box className={className} display='flex' alignItems='center' gap={1}>
      <Tooltip title={getTooltipText()}>
        <IconButton
          onClick={toggleTheme}
          size={size}
          color='inherit'
          aria-label={t('theme.tooltips.toggle')}
        >
          {getCurrentIcon()}
        </IconButton>
      </Tooltip>
      {showLabel && (
        <Typography variant='body2' color='text.secondary'>
          {mode === 'system'
            ? t('theme.labels.systemMode', { mode: resolvedTheme })
            : mode}
        </Typography>
      )}
    </Box>
  )
}

// Menu-based selector
const ThemeMenuSelector: React.FC<Omit<ThemeToggleProps, 'variant'>> = ({
  size = 'medium',
  className,
}) => {
  const { t } = useTranslation()
  const { mode, setMode, resolvedTheme } = useThemeStore()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const themeOptions = getThemeOptions(t)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleModeSelect = useCallback(
    (selectedMode: TThemeMode) => {
      setMode(selectedMode)
      handleClose()
    },
    [setMode]
  )

  const getCurrentIcon = () => {
    if (mode === 'system') return <SystemIcon />
    return resolvedTheme === 'dark' ? <DarkIcon /> : <LightIcon />
  }

  return (
    <Box className={className}>
      <Tooltip title={t('theme.tooltips.change')}>
        <IconButton
          onClick={handleClick}
          size={size}
          color='inherit'
          aria-label={t('theme.tooltips.change')}
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
        >
          {getCurrentIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        id='theme-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {themeOptions.map(option => {
          const handleOptionClick = () => {
            handleModeSelect(option.mode)
          }

          return (
            <MenuItem
              key={option.mode}
              onClick={handleOptionClick}
              selected={mode === option.mode}
            >
              <ListItemIcon>{option.icon}</ListItemIcon>
              <ListItemText
                primary={option.label}
                secondary={option.description}
              />
            </MenuItem>
          )
        })}
      </Menu>
    </Box>
  )
}

// Main theme toggle component with variant support
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'toggle',
  ...props
}) => {
  switch (variant) {
    case 'menu':
      return <ThemeMenuSelector {...props} />
    case 'icon':
    case 'toggle':
    default:
      return <ThemeToggleButton {...props} />
  }
}

// Export individual components
export { ThemeMenuSelector, ThemeToggleButton }
