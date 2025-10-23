import {
  Api as ApiIcon,
  CheckCircle as CheckCircleIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useTheme as useAppTheme } from '../hooks/useTheme'
import { useAuth } from '../stores/authStore'
import { ThemeDemo, ThemeToggle } from '../theme'
import { AuthGuard, UserProfile } from './auth'

const getStyles = () => ({
  rootBox: { py: 4 },
  headerCard: { mb: 4 },
  tabsCard: { mb: 4 },
  tabs: { borderBottom: 1, borderColor: 'divider' },
  devAlert: { mb: 4 },
  footer: { mt: 4, textAlign: 'center' },
})

function Application() {
  const { mode, resolvedTheme } = useAppTheme()
  const { isAuthenticated, isStubMode } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const styles = useMemo(() => getStyles(), [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <Container maxWidth='lg'>
      <Box sx={styles.rootBox}>
        {/* Header with theme toggle */}
        <Card elevation={1} sx={styles.headerCard}>
          <CardContent>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              flexWrap='wrap'
              gap={2}
            >
              <Box>
                <Typography variant='h3' gutterBottom>
                  🎯 CPR System
                </Typography>
                <Typography variant='subtitle1' color='text.secondary'>
                  Current Performance Review Application
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Theme: {mode} → {resolvedTheme} | Auth:{' '}
                  {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                  {isStubMode && ' (stub mode)'}
                </Typography>
              </Box>
              <ThemeToggle variant='menu' size='large' />
            </Stack>
          </CardContent>
        </Card>

        {/* Development Mode Alert */}
        {isStubMode && (
          <Alert severity='info' sx={styles.devAlert}>
            <Typography variant='body2'>
              🚧 <strong>Development Mode:</strong> Authentication is running in
              stub mode. Real MSAL.js integration is configured but not active.
            </Typography>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Card elevation={1} sx={styles.tabsCard}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant='fullWidth'
            sx={styles.tabs}
          >
            <Tab
              icon={<SecurityIcon />}
              label='Authentication'
              iconPosition='start'
            />
            <Tab
              icon={<PaletteIcon />}
              label='Theme System'
              iconPosition='start'
            />
            <Tab
              icon={<ApiIcon />}
              label='API Infrastructure'
              iconPosition='start'
            />
          </Tabs>
        </Card>

        {/* Tab Panels */}
        {activeTab === 0 && (
          <AuthGuard>
            <UserProfile />
          </AuthGuard>
        )}

        {activeTab === 1 && <ThemeDemo />}

        {activeTab === 2 && (
          <Card elevation={1}>
            <CardContent>
              <Typography variant='h5' gutterBottom>
                🚀 React Query Infrastructure
              </Typography>
              <Typography variant='body1' paragraph>
                Complete API infrastructure setup with React Query (TanStack
                Query) and native fetch client.
              </Typography>

              <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                ✅ Features Implemented:
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color='success' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Native Fetch API Client'
                    secondary='Zero dependencies HTTP client with authentication integration'
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color='success' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Environment-Based URLs'
                    secondary={`Uses VITE_API_BASE_URL environment variable`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color='success' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Authentication Integration'
                    secondary='Automatic Bearer token injection from Zustand auth store'
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color='success' />
                  </ListItemIcon>
                  <ListItemText
                    primary='TypeScript Support'
                    secondary='Full type safety with standardized API types and response handling'
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color='success' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Query Keys Factory'
                    secondary='Centralized cache key management with TypeScript autocomplete'
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color='success' />
                  </ListItemIcon>
                  <ListItemText
                    primary='File Upload Support'
                    secondary='Progress tracking with XMLHttpRequest for file uploads'
                  />
                </ListItem>
              </List>

              <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                🎯 Next Steps:
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary='• Set up React Router for navigation'
                    secondary='Add protected routes and route guards'
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary='• Create your first API service'
                    secondary='Build services for goals, skills, and feedback management'
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary='• Add MSW (Mock Service Worker)'
                    secondary='Development API mocking for realistic testing'
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary='• Build UI components with query hooks'
                    secondary='Create data-driven components using React Query patterns'
                  />
                </ListItem>
              </List>

              <Box
                sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}
              >
                <Typography variant='body2'>
                  <strong>Development Tools:</strong> React Query DevTools are
                  available in development mode. Look for the React Query icon
                  in the bottom-left corner to inspect cache and network
                  activity.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Box sx={styles.footer}>
          <Typography variant='body2' color='text.secondary'>
            🚀 Built with React + TypeScript + MUI v6 + Zustand + MSAL.js v3 +
            React Query
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

export default Application
