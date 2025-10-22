import {
    DarkMode as DarkIcon,
    LightMode as LightIcon,
    SettingsBrightness as SystemIcon,
} from '@mui/icons-material';
import {
    Box,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
} from '@mui/material';
import React from 'react';
import { useThemeStore, type ThemeMode } from '../stores/themeStore';

// Theme toggle button props
interface ThemeToggleProps {
  variant?: 'icon' | 'menu' | 'toggle';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

// Theme mode options for menu
const themeOptions: Array<{
  mode: ThemeMode;
  label: string;
  icon: React.ReactElement;
  description: string;
}> = [
  {
    mode: 'light',
    label: 'Light',
    icon: <LightIcon />,
    description: 'Light mode',
  },
  {
    mode: 'dark',
    label: 'Dark',
    icon: <DarkIcon />,
    description: 'Dark mode',
  },
  {
    mode: 'system',
    label: 'System',
    icon: <SystemIcon />,
    description: 'Follow system preference',
  },
];

// Simple toggle button (cycles through light -> dark -> system)
const ThemeToggleButton: React.FC<Omit<ThemeToggleProps, 'variant'>> = ({
  size = 'medium',
  showLabel = false,
  className,
}) => {
  const { mode, toggleTheme, resolvedTheme } = useThemeStore();
  
  const getCurrentIcon = () => {
    if (mode === 'system') return <SystemIcon />;
    return resolvedTheme === 'dark' ? <DarkIcon /> : <LightIcon />;
  };
  
  const getTooltipText = () => {
    switch (mode) {
      case 'light': return 'Switch to dark mode';
      case 'dark': return 'Switch to system mode';
      case 'system': return 'Switch to light mode';
      default: return 'Toggle theme';
    }
  };
  
  return (
    <Box className={className} display="flex" alignItems="center" gap={1}>
      <Tooltip title={getTooltipText()}>
        <IconButton
          onClick={toggleTheme}
          size={size}
          color="inherit"
          aria-label="Toggle theme"
        >
          {getCurrentIcon()}
        </IconButton>
      </Tooltip>
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          {mode === 'system' ? `System (${resolvedTheme})` : mode}
        </Typography>
      )}
    </Box>
  );
};

// Menu-based theme selector
const ThemeMenuSelector: React.FC<Omit<ThemeToggleProps, 'variant'>> = ({
  size = 'medium',
  className,
}) => {
  const { mode, setMode, resolvedTheme } = useThemeStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleModeSelect = (selectedMode: ThemeMode) => {
    setMode(selectedMode);
    handleClose();
  };
  
  const getCurrentIcon = () => {
    if (mode === 'system') return <SystemIcon />;
    return resolvedTheme === 'dark' ? <DarkIcon /> : <LightIcon />;
  };
  
  return (
    <Box className={className}>
      <Tooltip title="Change theme">
        <IconButton
          onClick={handleClick}
          size={size}
          color="inherit"
          aria-label="Change theme"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          {getCurrentIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {themeOptions.map((option) => (
          <MenuItem
            key={option.mode}
            onClick={() => handleModeSelect(option.mode)}
            selected={mode === option.mode}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText
              primary={option.label}
              secondary={option.description}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

// Main theme toggle component with variant support
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'toggle',
  ...props
}) => {
  switch (variant) {
    case 'menu':
      return <ThemeMenuSelector {...props} />;
    case 'icon':
    case 'toggle':
    default:
      return <ThemeToggleButton {...props} />;
  }
};

// Export individual components
export { ThemeMenuSelector, ThemeToggleButton };

// Export default as main component
export default ThemeToggle;