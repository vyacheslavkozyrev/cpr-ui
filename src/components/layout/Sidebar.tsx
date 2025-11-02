import {
  AdminPanelSettings,
  BugReport,
  Dashboard,
  Feedback,
  Group,
  Person,
  Psychology,
  Settings,
  TrackChanges,
} from '@mui/icons-material'
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { UserRole } from '../../models'
import { useAuthStore } from '../../stores/authStore'

const drawerWidth = 240

const getStyles = () => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      boxSizing: 'border-box',
      position: 'relative',
      height: 'auto',
    },
  },
  navigationHeader: { p: 2 },
  listItemButton: {
    '&.Mui-selected': {
      backgroundColor: 'primary.main',
      color: 'primary.contrastText',
      '&:hover': {
        backgroundColor: 'primary.dark',
      },
      '& .MuiListItemIcon-root': {
        color: 'primary.contrastText',
      },
    },
  },
})

interface INavigationItem {
  labelKey: string
  path: string
  icon: React.ReactNode
  requiredRoles?: string[]
}

/**
 * Sidebar Component
 * Navigation sidebar with role-based menu items
 */
export const Sidebar: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const styles = useMemo(() => getStyles(), [])

  // Get user roles for menu filtering
  const userRoles = user?.roles || [UserRole.EMPLOYEE]

  // Navigation items with role requirements
  const navigationItems: INavigationItem[] = [
    {
      labelKey: 'navigation.dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
    },
    {
      labelKey: 'navigation.profile',
      path: '/profile',
      icon: <Person />,
    },
    {
      labelKey: 'navigation.goals',
      path: '/goals',
      icon: <TrackChanges />,
    },
    {
      labelKey: 'navigation.skills',
      path: '/skills',
      icon: <Psychology />,
    },
    {
      labelKey: 'navigation.feedback',
      path: '/feedback',
      icon: <Feedback />,
    },
    {
      labelKey: 'navigation.settings',
      path: '/settings',
      icon: <Settings />,
    },
    {
      labelKey: 'navigation.team',
      path: '/team',
      icon: <Group />,
      requiredRoles: [
        UserRole.PEOPLE_MANAGER,
        UserRole.SOLUTION_OWNER,
        UserRole.DIRECTOR,
        UserRole.ADMINISTRATOR,
      ],
    },
    {
      labelKey: 'navigation.admin',
      path: '/admin',
      icon: <AdminPanelSettings />,
      requiredRoles: [UserRole.ADMINISTRATOR],
    },
    // Development only - Test error boundaries
    {
      labelKey: 'Test Errors',
      path: '/test-errors',
      icon: <BugReport />,
    },
  ]

  // Filter navigation items based on user roles
  const visibleItems = navigationItems.filter(item => {
    if (!item.requiredRoles) return true
    return item.requiredRoles.some(role => userRoles.includes(role))
  })

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path)
    },
    [navigate]
  )

  return (
    <Drawer variant='permanent' sx={styles.drawer}>
      <Box sx={styles.navigationHeader}>
        <Typography variant='subtitle2' color='text.secondary'>
          {t('sidebar.navigation')}
        </Typography>
      </Box>

      <Divider />

      <List>
        {visibleItems.map(item => {
          const handleItemClick = () => {
            handleNavigation(item.path)
          }

          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={handleItemClick}
                sx={styles.listItemButton}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    item.labelKey.startsWith('navigation.')
                      ? t(item.labelKey)
                      : item.labelKey
                  }
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Drawer>
  )
}
