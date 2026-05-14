/**
 * SkillHistorySparkline component
 * Compact Recharts line chart showing self and manager assessment history
 * plus a required level reference line (AC-011, AC-012).
 * Feature 0014 — Performance Analytics & Reporting
 */

import React, { memo, useMemo } from 'react'
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type {
  ISkillHistoryEntry,
  TGapColor,
} from '../../models/analytics.models'

export interface SkillHistorySparklineProps {
  history: ISkillHistoryEntry[]
  requiredLevel: number | null
  currentSelfAssessment: number
  gapColor: TGapColor
}

const GAP_COLOR_MAP: Record<TGapColor, string> = {
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  default: '#9e9e9e',
}

/**
 * Compact sparkline for a single skill's assessment history.
 */
export const SkillHistorySparkline: React.FC<SkillHistorySparklineProps> = memo(
  ({ history, requiredLevel, currentSelfAssessment, gapColor }) => {
    const lineColor = useMemo(() => GAP_COLOR_MAP[gapColor], [gapColor])

    const chartData = useMemo(() => {
      if (history.length === 0) {
        // Flat line at current value when no history in period (AC-011)
        return [
          { self: currentSelfAssessment, manager: null, index: 0 },
          { self: currentSelfAssessment, manager: null, index: 1 },
        ]
      }
      return history.map((entry, idx) => ({
        self: entry.selfAssessmentValue,
        manager: entry.managerAssessmentValue,
        index: idx,
      }))
    }, [history, currentSelfAssessment])

    const hasManagerData = useMemo(
      () => chartData.some(d => d.manager !== null),
      [chartData]
    )

    return (
      <ResponsiveContainer width='100%' height={60}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
        >
          {requiredLevel !== null && (
            <ReferenceLine
              y={requiredLevel}
              stroke='#9c27b0'
              strokeDasharray='4 2'
              strokeWidth={1}
            />
          )}
          <Line
            type='monotone'
            dataKey='self'
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {hasManagerData && (
            <Line
              type='monotone'
              dataKey='manager'
              stroke='#1976d2'
              strokeWidth={1.5}
              strokeDasharray='4 2'
              dot={false}
              isAnimationActive={false}
            />
          )}
          <Tooltip
            contentStyle={{ fontSize: 10 }}
            formatter={(value: number) => value.toFixed(1)}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }
)

SkillHistorySparkline.displayName = 'SkillHistorySparkline'
