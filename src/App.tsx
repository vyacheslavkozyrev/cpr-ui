import { Box, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { useTheme } from './hooks/useTheme';
import { ThemeDemo, ThemeToggle } from './theme';

function App() {
  const { mode, resolvedTheme } = useTheme();

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Header with theme toggle */}
        <Card elevation={1} sx={{ mb: 4 }}>
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
                  Theme: {mode} → {resolvedTheme}
                </Typography>
              </Box>
              <ThemeToggle variant="menu" size="large" />
            </Stack>
          </CardContent>
        </Card>

        {/* Theme Demo Component */}
        <ThemeDemo />
        
        {/* Footer */}
        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            🚀 Built with React + TypeScript + MUI v6 + Zustand
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
