/**
 * AnalyticsContent component
 * Shared component composing TimeRangeSelector, Goals section, and Skill Progression section.
 * Accepts an optional employeeId prop: undefined = personal view, string = employee-scoped view.
 * Feature 0014 — Performance Analytics & Reporting
 */

import { Box, Divider, Paper, Typography } from '@mui/material'
import React, { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useEmployeeGoalAnalytics,
  useEmployeeSkillAnalytics,
} from '../../hooks/useEmployeeAnalytics'
import {
  useMyGoalAnalytics,
  useMySkillAnalytics,
} from '../../hooks/useAnalytics'
import { EAnalyticsPeriod } from '../../models/analytics.models'
import { GapClosureSummaryCard } from './GapClosureSummaryCard'
import { GoalCompletionTrendChart } from './GoalCompletionTrendChart'
import { GoalsByStatusChart } from './GoalsByStatusChart'
import { GoalStatCards } from './GoalStatCards'
import { SkillProgressionList } from './SkillProgressionList'
import { TimeRangeSelector, usePeriodParam } from './TimeRangeSelector'

export interface AnalyticsContentProps {
  /** When defined, loads analytics for the given employee; otherwise loads personal analytics. */
  employeeId?: string
}

const getStyles = () => ({
  container: { p: 2 },
  selectorRow: { mb: 3 },
  section: { mb: 3, p: 2 },
  sectionTitle: { mb: 2, fontWeight: 600 },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 2,
    mb: 2,
  },
})

/**
 * Personal analytics view — uses my-analytics hooks.
 */
const PersonalAnalyticsContent: React.FC<{
  period: EAnalyticsPeriod
}> = memo(({ period }) => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])

  const { data: goalData, isLoading: goalsLoading } = useMyGoalAnalytics(period)
  const { data: skillData, isLoading: skillsLoading } =
    useMySkillAnalytics(period)

  return (
    <>
      <Paper variant='outlined' sx={styles.section}>
        <Typography variant='h6' sx={styles.sectionTitle}>
          {t('analytics.goals.section_title', 'Goals')}
        </Typography>
        <GoalStatCards stats={goalData?.stats} isLoading={goalsLoading} />
        <Box sx={styles.chartsRow}>
          <GoalCompletionTrendChart data={goalData?.completionTrend ?? []} />
          <GoalsByStatusChart data={goalData?.goalsByStatus} />
        </Box>
      </Paper>

      <Paper variant='outlined' sx={styles.section}>
        <Typography variant='h6' sx={styles.sectionTitle}>
          {t('analytics.skills.section_title', 'Skill Progression')}
        </Typography>
        <GapClosureSummaryCard
          summary={skillData?.gapClosureSummary}
          isLoading={skillsLoading}
        />
        <Divider sx={{ mb: 2 }} />
        <SkillProgressionList
          skills={skillData?.skills ?? []}
          isLoading={skillsLoading}
        />
      </Paper>
    </>
  )
})

PersonalAnalyticsContent.displayName = 'PersonalAnalyticsContent'

/**
 * Employee-scoped analytics view — uses employee analytics hooks.
 */
const EmployeeAnalyticsContent: React.FC<{
  employeeId: string
  period: EAnalyticsPeriod
}> = memo(({ employeeId, period }) => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])

  const { data: goalData, isLoading: goalsLoading } = useEmployeeGoalAnalytics(
    employeeId,
    period
  )
  const { data: skillData, isLoading: skillsLoading } =
    useEmployeeSkillAnalytics(employeeId, period)

  return (
    <>
      <Paper variant='outlined' sx={styles.section}>
        <Typography variant='h6' sx={styles.sectionTitle}>
          {t('analytics.goals.section_title', 'Goals')}
        </Typography>
        <GoalStatCards stats={goalData?.stats} isLoading={goalsLoading} />
        <Box sx={styles.chartsRow}>
          <GoalCompletionTrendChart data={goalData?.completionTrend ?? []} />
          <GoalsByStatusChart data={goalData?.goalsByStatus} />
        </Box>
      </Paper>

      <Paper variant='outlined' sx={styles.section}>
        <Typography variant='h6' sx={styles.sectionTitle}>
          {t('analytics.skills.section_title', 'Skill Progression')}
        </Typography>
        <GapClosureSummaryCard
          summary={skillData?.gapClosureSummary}
          isLoading={skillsLoading}
        />
        <Divider sx={{ mb: 2 }} />
        <SkillProgressionList
          skills={skillData?.skills ?? []}
          isLoading={skillsLoading}
        />
      </Paper>
    </>
  )
})

EmployeeAnalyticsContent.displayName = 'EmployeeAnalyticsContent'

/**
 * Shared analytics content: time range selector + goals + skills sections.
 */
export const AnalyticsContent: React.FC<AnalyticsContentProps> = memo(
  ({ employeeId }) => {
    const styles = useMemo(() => getStyles(), [])
    const [period, setPeriod] = usePeriodParam()

    const handlePeriodChange = useCallback(
      (p: EAnalyticsPeriod) => setPeriod(p),
      [setPeriod]
    )

    return (
      <Box sx={styles.container}>
        <Box sx={styles.selectorRow}>
          <TimeRangeSelector value={period} onChange={handlePeriodChange} />
        </Box>

        {employeeId ? (
          <EmployeeAnalyticsContent employeeId={employeeId} period={period} />
        ) : (
          <PersonalAnalyticsContent period={period} />
        )}
      </Box>
    )
  }
)

AnalyticsContent.displayName = 'AnalyticsContent'
