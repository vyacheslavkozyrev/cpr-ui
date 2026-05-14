/**
 * GoalStatCards component
 * Displays six stat cards for goal analytics data (AC-005, AC-008, AC-009).
 * Feature 0014 — Performance Analytics & Reporting
 */

import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material'
import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IGoalStats } from '../../models/analytics.models'

export interface GoalStatCardsProps {
  stats: IGoalStats | undefined
  isLoading: boolean
}

const getStyles = () => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 2,
    mb: 2,
  },
  card: {
    textAlign: 'center' as const,
    height: '100%',
  },
  value: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1,
    mb: 0.5,
  },
  label: {
    fontSize: '0.75rem',
    color: 'text.secondary',
  },
})

interface StatCardProps {
  label: string
  value: string
  isLoading: boolean
}

const StatCard: React.FC<StatCardProps> = memo(
  ({ label, value, isLoading }) => {
    const styles = useMemo(() => getStyles(), [])

    return (
      <Card variant='outlined' sx={styles.card}>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton
                variant='text'
                width='60%'
                sx={{ mx: 'auto', mb: 0.5 }}
              />
              <Skeleton variant='text' width='80%' sx={{ mx: 'auto' }} />
            </>
          ) : (
            <>
              <Typography sx={styles.value}>{value}</Typography>
              <Typography sx={styles.label}>{label}</Typography>
            </>
          )}
        </CardContent>
      </Card>
    )
  }
)

StatCard.displayName = 'StatCard'

/**
 * Formats a completion rate for display. Returns "—" when null.
 */
const formatRate = (rate: number | null): string => {
  if (rate === null) return '—'
  return `${Math.round(rate * 100)}%`
}

/**
 * Formats a number for display. Returns "0" when undefined.
 */
const formatCount = (n: number | undefined): string => (n ?? 0).toString()

/**
 * Six stat cards: Total Goals, Created, Completed, Avg Days, Overdue, Completion Rate.
 */
export const GoalStatCards: React.FC<GoalStatCardsProps> = memo(
  ({ stats, isLoading }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const cards = [
      {
        label: t('analytics.goals.stat.total_goals', 'Total Goals'),
        value: formatCount(stats?.totalGoals),
      },
      {
        label: t('analytics.goals.stat.created_in_period', 'Created in Period'),
        value: formatCount(stats?.createdInPeriod),
      },
      {
        label: t(
          'analytics.goals.stat.completed_in_period',
          'Completed in Period'
        ),
        value: formatCount(stats?.completedInPeriod),
      },
      {
        label: t('analytics.goals.stat.avg_days', 'Avg Days to Complete'),
        value:
          stats?.avgDaysToComplete != null
            ? stats.avgDaysToComplete.toFixed(1)
            : '—',
      },
      {
        label: t('analytics.goals.stat.overdue', 'Overdue Goals'),
        value: formatCount(stats?.overdueGoals),
      },
      {
        label: t('analytics.goals.stat.completion_rate', 'Completion Rate'),
        value: formatRate(stats?.completionRate ?? null),
      },
    ]

    return (
      <Box sx={styles.grid}>
        {cards.map(card => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            isLoading={isLoading}
          />
        ))}
      </Box>
    )
  }
)

GoalStatCards.displayName = 'GoalStatCards'
