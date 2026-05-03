/**
 * GapClosureSummaryCard component
 * Displays gap closure summary statistics for the selected period (AC-013).
 * Feature 0014 — Performance Analytics & Reporting
 */

import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IGapClosureSummary } from '../../models/analytics.models'

export interface GapClosureSummaryCardProps {
  summary: IGapClosureSummary | undefined
  isLoading: boolean
}

const getStyles = () => ({
  card: { mb: 2 },
  title: { mb: 1.5, fontWeight: 600 },
  statBox: { textAlign: 'center' as const },
  statValue: { fontWeight: 700, fontSize: '1.5rem' },
  statLabel: { fontSize: '0.7rem', color: 'text.secondary' },
})

interface GapStatProps {
  value: string
  label: string
  isLoading: boolean
}

const GapStat: React.FC<GapStatProps> = memo(({ value, label, isLoading }) => {
  const styles = useMemo(() => getStyles(), [])

  return (
    <Box sx={styles.statBox}>
      {isLoading ? (
        <Skeleton variant='text' width='60%' sx={{ mx: 'auto' }} />
      ) : (
        <>
          <Typography sx={styles.statValue}>{value}</Typography>
          <Typography sx={styles.statLabel}>{label}</Typography>
        </>
      )}
    </Box>
  )
})

GapStat.displayName = 'GapStat'

const fmt = (n: number | null | undefined): string =>
  n != null ? n.toFixed(1) : '—'

/**
 * Card showing gap closure summary: total assessed, with gaps, closed, worsened, avg gap start/end.
 */
export const GapClosureSummaryCard: React.FC<GapClosureSummaryCardProps> = memo(
  ({ summary, isLoading }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const stats = [
      {
        value: fmt(summary?.skillsAssessed),
        label: t('analytics.skills.summary.skills_assessed', 'Skills Assessed'),
      },
      {
        value: fmt(summary?.skillsWithGaps),
        label: t('analytics.skills.summary.skills_with_gaps', 'With Gaps'),
      },
      {
        value: fmt(summary?.gapsClosedInPeriod),
        label: t('analytics.skills.summary.gaps_closed', 'Closed'),
      },
      {
        value: fmt(summary?.gapsWorsenedInPeriod),
        label: t('analytics.skills.summary.gaps_worsened', 'Worsened'),
      },
      {
        value: fmt(summary?.avgGapAtPeriodStart),
        label: t('analytics.skills.summary.avg_gap_start', 'Avg Gap Start'),
      },
      {
        value: fmt(summary?.avgGapAtPeriodEnd),
        label: t('analytics.skills.summary.avg_gap_end', 'Avg Gap End'),
      },
    ]

    return (
      <Card variant='outlined' sx={styles.card}>
        <CardContent>
          <Typography variant='subtitle1' sx={styles.title}>
            {t('analytics.skills.summary.title', 'Gap Closure Summary')}
          </Typography>
          <Grid container spacing={2}>
            {stats.map(stat => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={stat.label}>
                <GapStat
                  value={stat.value}
                  label={stat.label}
                  isLoading={isLoading}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    )
  }
)

GapClosureSummaryCard.displayName = 'GapClosureSummaryCard'
