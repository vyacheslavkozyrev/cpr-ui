import {
  Assignment,
  Feedback,
  Psychology,
  TrackChanges,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import type { ActivityType } from '../../../models/Dashboard'
import { useActivityFeed } from '../../../services/api/dashboardService'
import { DashboardWidget } from '../layout'

// Style factory outside component
const getStyles = () => ({
  tabPanel: {
    pt: 2,
  },
  summaryContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
  },
  formControl: {
    minWidth: 80,
  },
  statisticsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 2,
  },
  statisticBox: {
    textAlign: 'center',
  },
  emptyState: {
    textAlign: 'center',
    py: 8,
  },
  recentActivitiesTitle: {
    mb: 1,
  },
  listItem: {
    mb: 1,
  },
  avatar: {
    width: 32,
    height: 32,
  },
  activitiesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  activitiesListContainer: {
    flex: 1,
  },
  activitiesEmptyState: {
    textAlign: 'center',
    py: 4,
  },
  activitiesList: {
    maxHeight: 280,
    overflow: 'auto',
  },
  activityTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  activityTitleText: {
    flex: 1,
  },
  activityChip: {
    fontSize: '0.6rem',
    height: 20,
  },
  activitySecondary: {
    mt: 0.5,
  },
  timestampSpacing: {
    ml: 1,
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
  },
  widgetHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 1,
  },
  tabs: {
    minHeight: 'auto',
  },
  tab: {
    minWidth: 0,
    px: 2,
    minHeight: 32,
    py: 1,
  },
})

interface ITabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: ITabPanelProps) {
  const styles = useMemo(() => getStyles(), [])

  return (
    <div role='tabpanel' hidden={value !== index}>
      {value === index && <Box sx={styles.tabPanel}>{children}</Box>}
    </div>
  )
}

/**
 * ActivityFeedWidget Component
 * Displays recent user activities with configurable timeline
 */
export const ActivityFeedWidget: React.FC = () => {
  const styles = useMemo(() => getStyles(), [])

  const [days, setDays] = useState(10) // Configurable days (default 10)
  const [tabValue, setTabValue] = useState(0)
  const {
    data: activityFeed,
    isLoading,
    error,
  } = useActivityFeed({
    days,
    perPage: 10,
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'goal_created':
      case 'goal_completed':
      case 'goal_updated':
        return <TrackChanges />
      case 'feedback_received':
      case 'feedback_requested':
        return <Feedback />
      case 'skill_assessed':
      case 'skill_updated':
        return <Psychology />
      default:
        return <Assignment />
    }
  }

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'goal_created':
        return 'primary'
      case 'goal_completed':
        return 'success'
      case 'goal_updated':
        return 'info'
      case 'feedback_received':
        return 'warning'
      case 'feedback_requested':
        return 'secondary'
      case 'skill_assessed':
      case 'skill_updated':
        return 'purple'
      default:
        return 'default'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getActivityTypeLabel = (type: ActivityType) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleDaysChange = (newDays: number) => {
    setDays(newDays)
  }

  // Summary Tab Content
  const summaryContent = activityFeed && (
    <Box sx={styles.summaryContainer}>
      {/* Timeline Filter */}
      <Box sx={styles.headerRow}>
        <Typography variant='subtitle2'>Activity Overview</Typography>
        <FormControl size='small' sx={styles.formControl}>
          <InputLabel id='days-select-label'>Days</InputLabel>
          <Select
            labelId='days-select-label'
            value={days}
            label='Days'
            onChange={e => handleDaysChange(Number(e.target.value))}
          >
            <MenuItem value={7}>7 days</MenuItem>
            <MenuItem value={10}>10 days</MenuItem>
            <MenuItem value={14}>14 days</MenuItem>
            <MenuItem value={30}>30 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Activity Statistics */}
      {activityFeed.total > 0 ? (
        <Box sx={styles.statisticsRow}>
          <Box sx={styles.statisticBox}>
            <Typography variant='h4' color='primary'>
              {activityFeed.total}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Total Activities
            </Typography>
          </Box>
          <Box sx={styles.statisticBox}>
            <Typography variant='h4' color='success.main'>
              {
                activityFeed.items.filter(item =>
                  item.type.includes('completed')
                ).length
              }
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Completed
            </Typography>
          </Box>
          <Box sx={styles.statisticBox}>
            <Typography variant='h4' color='info.main'>
              {
                activityFeed.items.filter(item => item.type.includes('created'))
                  .length
              }
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Created
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={styles.emptyState}>
          <Typography variant='body2' color='text.secondary'>
            No activities in the last {days} days
          </Typography>
        </Box>
      )}

      {/* Recent Activities Preview (Top 3) */}
      {activityFeed.items.length > 0 && (
        <Box>
          <Typography variant='subtitle2' sx={styles.recentActivitiesTitle}>
            Latest Activities
          </Typography>
          <List dense>
            {activityFeed.items.slice(0, 3).map(activity => (
              <ListItem key={activity.id} disablePadding sx={styles.listItem}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      ...styles.avatar,
                      bgcolor: `${getActivityColor(activity.type)}.main`,
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant='body2'>{activity.title}</Typography>
                  }
                  secondary={
                    <Typography variant='caption' color='text.secondary'>
                      {formatTimeAgo(activity.timestamp)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  )

  // Activities List Tab Content
  const activitiesListContent = activityFeed && (
    <Box sx={styles.activitiesContainer}>
      {/* All Activities List */}
      <Box sx={styles.activitiesListContainer}>
        {activityFeed.items.length === 0 ? (
          <Box sx={styles.activitiesEmptyState}>
            <Typography variant='body2' color='text.secondary'>
              No activities in the last {days} days
            </Typography>
          </Box>
        ) : (
          <List dense sx={styles.activitiesList}>
            {activityFeed.items.map(activity => (
              <ListItem key={activity.id} disablePadding sx={styles.listItem}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      ...styles.avatar,
                      bgcolor: `${getActivityColor(activity.type)}.main`,
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={styles.activityTitleRow}>
                      <Typography variant='body2' sx={styles.activityTitleText}>
                        {activity.title}
                      </Typography>
                      <Chip
                        label={getActivityTypeLabel(activity.type)}
                        size='small'
                        variant='outlined'
                        sx={styles.activityChip}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={styles.activitySecondary}>
                      <Typography variant='caption' color='text.secondary'>
                        {activity.description}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={styles.timestampSpacing}
                      >
                        • {formatTimeAgo(activity.timestamp)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* View More Button */}
      {activityFeed.total > activityFeed.items.length && (
        <Button variant='outlined' size='small' sx={styles.viewMoreButton}>
          View More Activities
        </Button>
      )}
    </Box>
  )

  const widgetContent = activityFeed && (
    <Box>
      {/* Header with Title and Tabs */}
      <Box sx={styles.widgetHeaderRow}>
        <Typography variant='h6' component='h3'>
          Activity Feed
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange} sx={styles.tabs}>
          <Tab label='Summary' sx={styles.tab} />
          <Tab label='Activities' sx={styles.tab} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {summaryContent}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {activitiesListContent}
      </TabPanel>
    </Box>
  )

  return (
    <DashboardWidget isLoading={isLoading} error={error} height={400}>
      {widgetContent}
    </DashboardWidget>
  )
}
