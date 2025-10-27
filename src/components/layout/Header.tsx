import {
  AccountCircle,
  DarkMode,
  LightMode,
  Logout,
  Settings,
} from '@mui/icons-material'
import {
  AppBar,
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../../services'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'

// Style factory outside component
const getStyles = (theme: Theme) => ({
  brand: {
    flexGrow: 1,
    fontWeight: 'bold',
  },
  themeToggle: {
    mr: 1,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  userName: {
    mr: 1,
    display: { xs: 'none', sm: 'block' },
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  menuIcon: {
    mr: 2,
  },
})

/**
 * Header Component
 * Application header with branding, theme toggle, and user menu
 */
export const Header: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const styles = useMemo(() => getStyles(theme), [theme])
  const { logout } = useAuthStore()
  const { resolvedTheme, toggleTheme } = useThemeStore()
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleProfileClick = useCallback(() => {
    navigate('/profile')
    handleMenuClose()
  }, [navigate])

  const handleSettingsClick = useCallback(() => {
    navigate('/settings')
    handleMenuClose()
  }, [navigate])

  const handleLogout = useCallback(() => {
    logout()
    handleMenuClose()
  }, [logout])

  const handleThemeToggle = () => {
    toggleTheme()
  }

  return (
    <AppBar position='static' elevation={1}>
      <Toolbar>
        {/* Brand/Logo */}
        <Typography variant='h6' component='div' sx={styles.brand}>
          {t('header.brand')}
        </Typography>

        {/* Theme Toggle */}
        <IconButton
          color='inherit'
          onClick={handleThemeToggle}
          aria-label={t('header.toggleTheme')}
          sx={styles.themeToggle}
        >
          {resolvedTheme === 'dark' ? <LightMode /> : <DarkMode />}
        </IconButton>

        {/* User Menu */}
        <Box sx={styles.userSection}>
          {userLoading ? (
            <>
              <CircularProgress size={16} color='inherit' sx={{ mr: 1 }} />
              <Typography variant='body2' sx={styles.userName}>
                {t('common.loading')}
              </Typography>
            </>
          ) : (
            <Typography variant='body2' sx={styles.userName}>
              {currentUser?.displayName || currentUser?.username || 'User'}
            </Typography>
          )}
          <IconButton
            color='inherit'
            onClick={handleMenuOpen}
            aria-label={t('header.userMenu')}
            disabled={userLoading}
          >
            {userLoading ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              <Avatar sx={styles.avatar}>
                {currentUser?.initials ||
                  (currentUser?.displayName || currentUser?.username || 'U')
                    .charAt(0)
                    .toUpperCase()}
              </Avatar>
            )}
          </IconButton>
        </Box>

        {/* User Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleProfileClick}>
            <AccountCircle sx={styles.menuIcon} />
            {t('navigation.profile')}
          </MenuItem>
          <MenuItem onClick={handleSettingsClick}>
            <Settings sx={styles.menuIcon} />
            {t('navigation.settings')}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout sx={styles.menuIcon} />
            {t('navigation.logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
