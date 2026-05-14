/**
 * SkillProgressionList component
 * Lists all skill rows with sparklines and gap colour coding (AC-010, AC-014).
 * Feature 0014 — Performance Analytics & Reporting
 */

import {
  Box,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ISkillRow } from '../../models/analytics.models'
import { SkillHistorySparkline } from './SkillHistorySparkline'

export interface SkillProgressionListProps {
  skills: ISkillRow[]
  isLoading: boolean
}

const getStyles = () => ({
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: 4,
    color: 'text.secondary',
  },
  sparklineCell: { width: 120, minWidth: 100 },
  gapChip: { fontWeight: 600, fontSize: '0.7rem' },
})

const GAP_CHIP_COLOR: Record<
  string,
  'success' | 'warning' | 'error' | 'default'
> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  default: 'default',
}

/**
 * Displays a list of skill rows with sparklines.
 */
export const SkillProgressionList: React.FC<SkillProgressionListProps> = memo(
  ({ skills, isLoading }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    if (isLoading) {
      return (
        <Box>
          {[1, 2, 3].map(i => (
            <Skeleton
              key={i}
              variant='rectangular'
              height={48}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      )
    }

    if (skills.length === 0) {
      return (
        <Box sx={styles.emptyState}>
          <Typography variant='body2'>
            {t('analytics.skills.empty', 'No skill assessment data available')}
          </Typography>
        </Box>
      )
    }

    return (
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>{t('analytics.skills.col.skill', 'Skill')}</TableCell>
            <TableCell>
              {t('analytics.skills.col.category', 'Category')}
            </TableCell>
            <TableCell align='right'>
              {t('analytics.skills.col.self', 'Self')}
            </TableCell>
            <TableCell align='right'>
              {t('analytics.skills.col.manager', 'Manager')}
            </TableCell>
            <TableCell align='right'>
              {t('analytics.skills.col.required', 'Required')}
            </TableCell>
            <TableCell align='center'>
              {t('analytics.skills.col.gap', 'Gap')}
            </TableCell>
            <TableCell sx={styles.sparklineCell}>
              {t('analytics.skills.col.history', 'History')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {skills.map(skill => (
            <TableRow key={skill.skillId}>
              <TableCell>{skill.skillTitle}</TableCell>
              <TableCell>{skill.categoryTitle}</TableCell>
              <TableCell align='right'>
                {skill.currentSelfAssessment.toFixed(1)}
              </TableCell>
              <TableCell align='right'>
                {skill.currentManagerAssessment != null
                  ? skill.currentManagerAssessment.toFixed(1)
                  : '—'}
              </TableCell>
              <TableCell align='right'>
                {skill.requiredLevel != null
                  ? skill.requiredLevel.toFixed(1)
                  : '—'}
              </TableCell>
              <TableCell align='center'>
                {skill.gap !== null ? (
                  <Chip
                    label={skill.gap <= 0 ? '✓' : `+${skill.gap.toFixed(1)}`}
                    size='small'
                    color={GAP_CHIP_COLOR[skill.gapColor]}
                    sx={styles.gapChip}
                  />
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell sx={styles.sparklineCell}>
                <SkillHistorySparkline
                  history={skill.history}
                  requiredLevel={skill.requiredLevel}
                  currentSelfAssessment={skill.currentSelfAssessment}
                  gapColor={skill.gapColor}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
)

SkillProgressionList.displayName = 'SkillProgressionList'
