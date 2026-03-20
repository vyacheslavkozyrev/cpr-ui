import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ISkillGap } from '@/models/GapAnalysis'
import SkillGapRow from './SkillGapRow'

interface ISkillGapTableProps {
  skillGaps: ISkillGap[]
  canCreateGoal?: boolean
  onCreateGoal?: (skillGap: ISkillGap) => void
}

const getStyles = () => ({
  container: { mb: 3 } as const,
  emptyState: {
    py: 4,
    textAlign: 'center' as const,
    color: 'text.secondary',
  } as const,
  headerCell: { fontWeight: 600 } as const,
  categoryHeaderCell: { backgroundColor: 'action.hover', fontWeight: 600 } as const,
})

/** Groups skill gaps by category title. */
const groupByCategory = (skillGaps: ISkillGap[]): Map<string, ISkillGap[]> => {
  const groups = new Map<string, ISkillGap[]>()
  for (const gap of skillGaps) {
    const cat = gap.skill.category.title
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(gap)
  }
  return groups
}

const SkillGapTable: React.FC<ISkillGapTableProps> = React.memo(
  ({ skillGaps, canCreateGoal = false, onCreateGoal }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const groups = useMemo(() => groupByCategory(skillGaps), [skillGaps])

    const handleCreateGoal = useCallback(
      (skillGap: ISkillGap) => {
        onCreateGoal?.(skillGap)
      },
      [onCreateGoal]
    )

    if (skillGaps.length === 0) {
      return (
        <Box sx={styles.emptyState}>
          <Typography variant='body1'>
            {t('gap_analysis.table.no_skills', 'No skills to display.')}
          </Typography>
        </Box>
      )
    }

    return (
      <TableContainer component={Paper} sx={styles.container}>
        <Table
          size='small'
          aria-label={t('gap_analysis.table.aria_label', 'Skills gap table')}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={styles.headerCell}>
                {t('gap_analysis.table.skill_name', 'Skill')}
              </TableCell>
              <TableCell sx={styles.headerCell}>
                {t('gap_analysis.table.required_level', 'Required')}
              </TableCell>
              <TableCell sx={styles.headerCell}>
                {t('gap_analysis.table.actual_level', 'Actual')}
              </TableCell>
              <TableCell sx={styles.headerCell}>
                {t('gap_analysis.table.gap', 'Gap')}
              </TableCell>
              <TableCell sx={styles.headerCell}>
                {t('gap_analysis.table.mandatory', 'Mandatory')}
              </TableCell>
              <TableCell sx={styles.headerCell}>
                {t('gap_analysis.table.linked_goals', 'Goals')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(groups.entries()).map(([category, gaps]) => (
              <React.Fragment key={category}>
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={styles.categoryHeaderCell}
                  >
                    <Typography variant='subtitle2'>{category}</Typography>
                  </TableCell>
                </TableRow>
                {gaps.map(gap => (
                  <SkillGapRow
                    key={gap.skill.id}
                    skillGap={gap}
                    canCreateGoal={canCreateGoal}
                    onCreateGoal={handleCreateGoal}
                  />
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
)

SkillGapTable.displayName = 'SkillGapTable'

export default SkillGapTable
