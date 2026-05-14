/**
 * TimeRangeSelector component
 * Displays 5 preset time range options using MUI ToggleButtonGroup.
 * Syncs selection with URL ?period= query param (AC-021 – AC-024).
 * Feature 0014 — Performance Analytics & Reporting
 */

import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import React, { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { EAnalyticsPeriod } from '../../models/analytics.models'

export interface TimeRangeSelectorProps {
  /** Currently selected period. */
  value: EAnalyticsPeriod
  /** Called when the user selects a different preset. */
  onChange: (period: EAnalyticsPeriod) => void
}

const getStyles = () => ({
  toggleGroup: {
    flexWrap: 'wrap' as const,
    gap: 0.5,
  },
})

const PERIOD_OPTIONS: { value: EAnalyticsPeriod; labelKey: string }[] = [
  {
    value: EAnalyticsPeriod.LAST_30_DAYS,
    labelKey: 'analytics.period.last_30_days',
  },
  {
    value: EAnalyticsPeriod.LAST_90_DAYS,
    labelKey: 'analytics.period.last_90_days',
  },
  {
    value: EAnalyticsPeriod.LAST_180_DAYS,
    labelKey: 'analytics.period.last_180_days',
  },
  {
    value: EAnalyticsPeriod.LAST_QUARTER,
    labelKey: 'analytics.period.last_quarter',
  },
  { value: EAnalyticsPeriod.LAST_YEAR, labelKey: 'analytics.period.last_year' },
]

/**
 * Hook that manages the selected period, syncing with URL ?period= param.
 * Returns [period, setPeriod]. Default is last_90_days (AC-022).
 */
export const usePeriodParam = (): [
  EAnalyticsPeriod,
  (p: EAnalyticsPeriod) => void,
] => {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get('period')
  const validValues = Object.values(EAnalyticsPeriod) as string[]
  const period: EAnalyticsPeriod =
    raw && validValues.includes(raw)
      ? (raw as EAnalyticsPeriod)
      : EAnalyticsPeriod.LAST_90_DAYS

  const setPeriod = useCallback(
    (p: EAnalyticsPeriod) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.set('period', p)
        return next
      })
    },
    [setSearchParams]
  )

  return [period, setPeriod]
}

/**
 * Time range selector with 5 preset options (AC-021).
 * Renders as a MUI ToggleButtonGroup.
 */
export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = memo(
  ({ value, onChange }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const handleChange = useCallback(
      (
        _event: React.MouseEvent<HTMLElement>,
        newValue: EAnalyticsPeriod | null
      ) => {
        if (newValue !== null) {
          onChange(newValue)
        }
      },
      [onChange]
    )

    return (
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label={t('analytics.time_range_selector', 'Time Range')}
        size='small'
        sx={styles.toggleGroup}
      >
        {PERIOD_OPTIONS.map(opt => (
          <ToggleButton key={opt.value} value={opt.value}>
            {t(opt.labelKey)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    )
  }
)

TimeRangeSelector.displayName = 'TimeRangeSelector'
