import {
  AdminPanelSettings,
  BugReport,
  Dashboard,
  Feedback,
  Group,
  Person,
  Psychology,
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
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { UserRole } from '../../models'
import { useAuthStore } from '../../stores/authStore'

const drawerWidth = 240

interface INavigationItem {
  label: string
  path: string
  icon: React.ReactNode
  requiredRoles?: string[]
}

/**
 * Sidebar Component
 * Navigation sidebar with role-based menu items
 */
export const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  // Get user roles for menu filtering
  const userRoles = user?.roles || [UserRole.EMPLOYEE]

  // Navigation items with role requirements
  const navigationItems: INavigationItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: <Person />,
    },
    {
      label: 'Goals',
      path: '/goals',
      icon: <TrackChanges />,
    },
    {
      label: 'Skills',
      path: '/skills',
      icon: <Psychology />,
    },
    {
      label: 'Feedback',
      path: '/feedback',
      icon: <Feedback />,
    },
    {
      label: 'Team',
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
      label: 'Admin',
      path: '/admin',
      icon: <AdminPanelSettings />,
      requiredRoles: [UserRole.ADMINISTRATOR],
    },
    // Development only - Test error boundaries
    {
      label: 'Test Errors',
      path: '/test-errors',
      icon: <BugReport />,
    },
  ]

  // Filter navigation items based on user roles
  const visibleItems = navigationItems.filter(item => {
    if (!item.requiredRoles) return true
    return item.requiredRoles.some(role => userRoles.includes(role))
  })

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <Drawer
      variant='permanent'
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'relative',
          height: 'auto',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant='subtitle2' color='text.secondary'>
          Navigation
        </Typography>
      </Box>

      <Divider />

      <List>
        {visibleItems.map(item => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
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
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}
