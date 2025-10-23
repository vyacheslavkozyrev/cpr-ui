import { Palette as PaletteIcon, Security as SecurityIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Container,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useTheme as useAppTheme } from '../hooks/useTheme';
import { useAuth } from '../stores/authStore';
import { ThemeDemo, ThemeToggle } from '../theme';
import { AuthGuard, UserProfile } from './auth';

const getStyles = () => ({
  rootBox: { py: 4 },
  headerCard: { mb: 4 },
  tabsCard: { mb: 4 },
  tabs: { borderBottom: 1, borderColor: 'divider' },
  devAlert: { mb: 4 },
  footer: { mt: 4, textAlign: 'center' },
});

function Application() {
  const { mode, resolvedTheme } = useAppTheme();
  const { isAuthenticated, isStubMode } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const styles = useMemo(() => getStyles(), []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={styles.rootBox}>
        {/* Header with theme toggle */}
        <Card elevation={1} sx={styles.headerCard}>
          <CardContent>
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                <Typography variant="h3" gutterBottom>
                  🎯 CPR System
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Current Performance Review Application
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Theme: {mode} → {resolvedTheme} | Auth: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                  {isStubMode && ' (stub mode)'}
                </Typography>
              </Box>
              <ThemeToggle variant="menu" size="large" />
            </Stack>
          </CardContent>
        </Card>

        {/* Development Mode Alert */}
        {isStubMode && (
          <Alert severity="info" sx={styles.devAlert}>
            <Typography variant="body2">
              🚧 <strong>Development Mode:</strong> Authentication is running in stub mode. 
              Real MSAL.js integration is configured but not active.
            </Typography>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Card elevation={1} sx={styles.tabsCard}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={styles.tabs}
          >
            <Tab 
              icon={<SecurityIcon />} 
              label="Authentication" 
              iconPosition="start"
            />
            <Tab 
              icon={<PaletteIcon />} 
              label="Theme System" 
              iconPosition="start"
            />
          </Tabs>
        </Card>

        {/* Tab Panels */}
        {activeTab === 0 && (
          <AuthGuard>
            <UserProfile />
          </AuthGuard>
        )}

        {activeTab === 1 && (
          <ThemeDemo />
        )}
        
        {/* Footer */}
        <Box sx={styles.footer}>
          <Typography variant="body2" color="text.secondary">
            🚀 Built with React + TypeScript + MUI v6 + Zustand + MSAL.js v3
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Application;