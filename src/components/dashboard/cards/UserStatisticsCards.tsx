import { TrendingDown, TrendingFlat, TrendingUp } from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material'
import React, { useMemo } from 'react'

// Style factory outside component
const getStyles = (theme: Theme) => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    p: 3,
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    lineHeight: 1,
    mb: 1,
  },
  statLabel: {
    color: 'text.secondary',
    mb: 1,
  },
  trend: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },
  trendIcon: {
    fontSize: '1rem',
  },
})

interface IUserStatCardProps {
  label: string
  value: number | string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value?: string
    color?: 'success' | 'error' | 'warning' | 'info'
  }
  isLoading?: boolean
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
}

/**
 * UserStatCard Component
 * Displays individual user statistics with trend indicators
 */
export const UserStatCard: React.FC<IUserStatCardProps> = ({
  label,
  value,
  trend,
  isLoading = false,
  color = 'primary',
}) => {
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp sx={styles.trendIcon} />
      case 'down':
        return <TrendingDown sx={styles.trendIcon} />
      case 'neutral':
      default:
        return <TrendingFlat sx={styles.trendIcon} />
    }
  }

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    if (trend?.color) {
      return trend.color
    }

    switch (direction) {
      case 'up':
        return 'success'
      case 'down':
        return 'error'
      case 'neutral':
      default:
        return 'info'
    }
  }

  return (
    <Card elevation={1} sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        {isLoading ? (
          <>
            <Skeleton variant='text' width='60%' height={48} />
            <Skeleton variant='text' width='80%' height={24} />
            <Skeleton variant='text' width='40%' height={20} />
          </>
        ) : (
          <>
            <Typography
              variant='h2'
              component='div'
              sx={{
                ...styles.statValue,
                color: `${color}.main`,
              }}
            >
              {value}
            </Typography>
            <Typography variant='body2' sx={styles.statLabel}>
              {label}
            </Typography>
            {trend && (
              <Box sx={styles.trend}>
                <Chip
                  icon={getTrendIcon(trend.direction)}
                  label={trend.value || ''}
                  size='small'
                  color={getTrendColor(trend.direction)}
                  variant='outlined'
                />
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

interface IUserStatisticsCardsProps {
  goalsCompleted?: number
  feedbackReceived?: number
  skillsAssessed?: number
  isLoading?: boolean
}

/**
 * UserStatisticsCards Component
 * Grid of user statistics cards showing key performance metrics
 */
export const UserStatisticsCards: React.FC<IUserStatisticsCardsProps> = ({
  goalsCompleted = 0,
  feedbackReceived = 0,
  skillsAssessed = 0,
  isLoading = false,
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(3, 1fr)',
        },
        mb: 3,
      }}
    >
      <UserStatCard
        label='Goals Completed'
        value={goalsCompleted}
        trend={{ direction: 'up', value: '+2 this month' }}
        isLoading={isLoading}
        color='success'
      />
      <UserStatCard
        label='Feedback Received'
        value={feedbackReceived}
        trend={{ direction: 'neutral', value: 'same as last month' }}
        isLoading={isLoading}
        color='info'
      />
      <UserStatCard
        label='Skills Assessed'
        value={skillsAssessed}
        trend={{ direction: 'up', value: '+3 this quarter' }}
        isLoading={isLoading}
        color='primary'
      />
    </Box>
  )
}
