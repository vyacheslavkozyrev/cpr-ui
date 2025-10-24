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
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material'
import React, { useMemo } from 'react'
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
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])
  const { user, logout } = useAuthStore()
  const { resolvedTheme, toggleTheme } = useThemeStore()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
  }

  const handleThemeToggle = () => {
    toggleTheme()
  }

  return (
    <AppBar position='static' elevation={1}>
      <Toolbar>
        {/* Brand/Logo */}
        <Typography variant='h6' component='div' sx={styles.brand}>
          CPR Performance
        </Typography>

        {/* Theme Toggle */}
        <IconButton
          color='inherit'
          onClick={handleThemeToggle}
          aria-label='toggle theme'
          sx={styles.themeToggle}
        >
          {resolvedTheme === 'dark' ? <LightMode /> : <DarkMode />}
        </IconButton>

        {/* User Menu */}
        <Box sx={styles.userSection}>
          <Typography variant='body2' sx={styles.userName}>
            {user?.name || 'User'}
          </Typography>
          <IconButton
            color='inherit'
            onClick={handleMenuOpen}
            aria-label='user menu'
          >
            <Avatar sx={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
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
          <MenuItem onClick={handleMenuClose}>
            <AccountCircle sx={styles.menuIcon} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Settings sx={styles.menuIcon} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout sx={styles.menuIcon} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
