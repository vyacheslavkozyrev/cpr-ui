import {
  CheckCircle,
  CommentOutlined,
  EmojiEvents,
  FeedbackOutlined,
  TrendingUp,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material'
import { formatDistanceToNow, parseISO } from 'date-fns'
import React, { useMemo } from 'react'

// Style factory outside component
const getStyles = (theme: Theme) => ({
  timelineContainer: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: theme.spacing(2.5),
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'divider',
  },
  timelineItem: {
    position: 'relative',
    pb: 2,
    '&:last-child': {
      pb: 0,
    },
  },
  timelineDot: {
    position: 'absolute',
    left: theme.spacing(1.5),
    top: theme.spacing(1),
    zIndex: 1,
  },
  timelineContent: {
    ml: theme.spacing(6),
  },
  activityCard: {
    mb: 1,
    '&:last-child': {
      mb: 0,
    },
  },
  activityHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 1,
  },
  activityMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mt: 1,
  },
})

interface IActivityMetadata {
  goalId?: string
  feedbackId?: string
  skillId?: string
  fromUserId?: string
  rating?: number
  category?: string
  priority?: string
  [key: string]: string | number | undefined
}

interface IActivityItem {
  id: string
  type:
    | 'goal_completed'
    | 'feedback_received'
    | 'skill_assessed'
    | 'goal_created'
    | 'feedback_requested'
  title: string
  description: string
  timestamp: string
  metadata?: IActivityMetadata
}

interface IActivityTimelineProps {
  activities: IActivityItem[]
  isLoading?: boolean
  maxItems?: number
}

/**
 * ActivityTimeline Component
 * Timeline view of user activities with icons and metadata
 */
export const ActivityTimeline: React.FC<IActivityTimelineProps> = ({
  activities,
  isLoading = false,
  maxItems = 10,
}) => {
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])

  const getActivityIcon = (type: IActivityItem['type']) => {
    const iconProps = { fontSize: 'small' as const }

    switch (type) {
      case 'goal_completed':
        return <CheckCircle color='success' {...iconProps} />
      case 'feedback_received':
        return <FeedbackOutlined color='info' {...iconProps} />
      case 'skill_assessed':
        return <TrendingUp color='primary' {...iconProps} />
      case 'goal_created':
        return <EmojiEvents color='warning' {...iconProps} />
      case 'feedback_requested':
        return <CommentOutlined color='action' {...iconProps} />
      default:
        return <CheckCircle color='action' {...iconProps} />
    }
  }

  const getActivityColor = (type: IActivityItem['type']) => {
    switch (type) {
      case 'goal_completed':
        return 'success'
      case 'feedback_received':
        return 'info'
      case 'skill_assessed':
        return 'primary'
      case 'goal_created':
        return 'warning'
      case 'feedback_requested':
        return 'default'
      default:
        return 'default'
    }
  }

  const formatActivityType = (type: IActivityItem['type']) => {
    const typeMap: Record<string, string> = {
      goal_completed: 'Goal Completed',
      feedback_received: 'Feedback Received',
      skill_assessed: 'Skill Updated',
      goal_created: 'Goal Created',
      feedback_requested: 'Feedback Requested',
    }

    return typeMap[type] || type
  }

  const displayActivities = activities.slice(0, maxItems)

  if (isLoading) {
    return (
      <Box sx={styles.timelineContainer}>
        <Box sx={styles.timelineLine} />
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} sx={styles.timelineItem}>
            <Box sx={styles.timelineDot}>
              <Skeleton variant='circular' width={24} height={24} />
            </Box>
            <Box sx={styles.timelineContent}>
              <Card elevation={0} variant='outlined' sx={styles.activityCard}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Skeleton variant='text' width='60%' height={24} />
                  <Skeleton variant='text' width='100%' height={20} />
                  <Skeleton variant='text' width='40%' height={16} />
                </CardContent>
              </Card>
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  if (displayActivities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant='body2' color='text.secondary'>
          No recent activities to display
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={styles.timelineContainer}>
      <Box sx={styles.timelineLine} />
      {displayActivities.map(activity => (
        <Box key={activity.id} sx={styles.timelineItem}>
          <Box sx={styles.timelineDot}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: 'background.paper',
                border: 2,
                borderColor: `${getActivityColor(activity.type)}.main`,
              }}
            >
              {getActivityIcon(activity.type)}
            </Avatar>
          </Box>
          <Box sx={styles.timelineContent}>
            <Card elevation={0} variant='outlined' sx={styles.activityCard}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={styles.activityHeader}>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    {activity.title}
                  </Typography>
                  <Chip
                    label={formatActivityType(activity.type)}
                    size='small'
                    color={getActivityColor(activity.type)}
                    variant='outlined'
                  />
                </Box>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  {activity.description}
                </Typography>
                <Box sx={styles.activityMeta}>
                  <Typography variant='caption' color='text.disabled'>
                    {formatDistanceToNow(parseISO(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </Typography>
                  {activity.metadata?.['rating'] && (
                    <Chip
                      label={`${activity.metadata['rating']} stars`}
                      size='small'
                      variant='outlined'
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

interface IActivityFeedWithTimelineProps {
  activities: IActivityItem[]
  isLoading?: boolean
  showAll?: boolean
}

/**
 * ActivityFeedWithTimeline Component
 * Enhanced activity feed with timeline visualization
 */
export const ActivityFeedWithTimeline: React.FC<
  IActivityFeedWithTimelineProps
> = ({ activities, isLoading = false, showAll = false }) => {
  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Recent Activity
      </Typography>
      <ActivityTimeline
        activities={activities}
        isLoading={isLoading}
        {...(showAll ? {} : { maxItems: 10 })}
      />
    </Box>
  )
}
