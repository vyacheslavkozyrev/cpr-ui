import { Settings, Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Switch,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Style factory outside component
const getStyles = (theme: Theme, inline: boolean = false) => ({
  customizationButton: inline
    ? {
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
      }
    : {
        position: 'fixed' as const,
        top: theme.spacing(10),
        right: theme.spacing(2),
        zIndex: 1200,
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
      },
  menuPaper: {
    width: 320,
    maxHeight: 400,
  },
  sectionHeader: {
    px: 2,
    py: 1,
    backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
    borderBottom: 1,
    borderColor: 'divider',
  },
  widgetItem: {
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  },
})

interface IWidgetConfig {
  id: string
  name: string
  visible: boolean
  order: number
}

interface IDashboardCustomizationProps {
  widgets: IWidgetConfig[]
  onWidgetToggle: (widgetId: string, visible: boolean) => void
  onResetLayout: () => void
  inline?: boolean
}

/**
 * DashboardCustomization Component
 * Customization menu for dashboard widget visibility and layout
 * Can be displayed as floating or inline
 */
export const DashboardCustomization: React.FC<IDashboardCustomizationProps> = ({
  widgets,
  onWidgetToggle,
  onResetLayout,
  inline = false,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme, inline), [theme, inline])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleWidgetToggle = useCallback(
    (widgetId: string) => {
      const widget = widgets.find(w => w.id === widgetId)
      if (widget) {
        onWidgetToggle(widgetId, !widget.visible)
      }
    },
    [widgets, onWidgetToggle]
  )

  const handleResetLayout = useCallback(() => {
    onResetLayout?.()
    handleMenuClose()
  }, [onResetLayout, handleMenuClose])

  const visibleWidgetsCount = widgets.filter(w => w.visible).length

  return (
    <>
      {/* Settings Button - Floating or Inline */}
      <IconButton
        onClick={handleMenuOpen}
        sx={styles.customizationButton}
        aria-label={t('dashboard.customization.ariaLabel')}
        size='small'
      >
        <Settings />
      </IconButton>

      {/* Customization Menu */}
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
        PaperProps={{
          sx: styles.menuPaper,
        }}
      >
        {/* Header */}
        <Box sx={styles.sectionHeader}>
          <Typography
            variant='subtitle1'
            fontWeight='bold'
            color='text.primary'
          >
            {t('dashboard.customization.title')}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {t('dashboard.customization.widgetCount', {
              visible: visibleWidgetsCount,
              total: widgets.length,
            })}
          </Typography>
        </Box>

        {/* Widget Visibility Controls */}
        <List dense>
          {widgets
            .sort((a, b) => a.order - b.order)
            .map(widget => (
              <ListItem
                key={widget.id}
                sx={styles.widgetItem}
                secondaryAction={
                  <FormControl>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={widget.visible}
                          onChange={() => handleWidgetToggle(widget.id)}
                          size='small'
                        />
                      }
                      label=''
                      sx={{ mr: 0 }}
                    />
                  </FormControl>
                }
              >
                <ListItemIcon>
                  {widget.visible ? (
                    <Visibility color='primary' />
                  ) : (
                    <VisibilityOff color='disabled' />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={widget.name}
                  secondary={
                    widget.visible
                      ? t('dashboard.customization.visible')
                      : t('dashboard.customization.hidden')
                  }
                />
              </ListItem>
            ))}
        </List>

        {/* Reset Option */}
        <Box sx={{ px: 2, py: 1 }}>
          <Chip
            label={t('dashboard.customization.resetLayout')}
            variant='outlined'
            size='small'
            onClick={handleResetLayout}
            clickable
            sx={{ width: '100%' }}
          />
        </Box>
      </Menu>
    </>
  )
}

// Hook for managing widget visibility state
export const useDashboardCustomization = () => {
  const { t } = useTranslation()

  const [widgets, setWidgets] = useState<IWidgetConfig[]>([
    {
      id: 'goals',
      name: t('dashboard.widgets.goalSummary'),
      visible: true,
      order: 1,
    },
    {
      id: 'feedback',
      name: t('dashboard.widgets.feedbackSummary'),
      visible: true,
      order: 2,
    },
    {
      id: 'skills',
      name: t('dashboard.widgets.skillProgress'),
      visible: true,
      order: 3,
    },
    {
      id: 'activity',
      name: t('dashboard.widgets.activityFeed'),
      visible: true,
      order: 4,
    },
  ])

  const toggleWidget = useCallback((widgetId: string, visible: boolean) => {
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === widgetId ? { ...widget, visible } : widget
      )
    )
  }, [])

  const resetLayout = useCallback(() => {
    setWidgets(prev => prev.map(widget => ({ ...widget, visible: true })))
  }, [])

  const getVisibleWidgets = useCallback(() => {
    return widgets.filter(w => w.visible).sort((a, b) => a.order - b.order)
  }, [widgets])

  return {
    widgets,
    toggleWidget,
    resetLayout,
    getVisibleWidgets,
  }
}
