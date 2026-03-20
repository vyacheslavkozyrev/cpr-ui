import {
  Box,
  Button,
  Chip,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ISkillGap } from '@/models/GapAnalysis'

interface ISkillGapRowProps {
  skillGap: ISkillGap
  /** Show "Create Goal" button only for own view or People Manager viewing a direct report. */
  canCreateGoal?: boolean
  onCreateGoal?: (skillGap: ISkillGap) => void
}

const getStyles = () => ({
  gapRow: {
    backgroundColor: 'error.light',
    '& td': { borderBottom: 'none' },
  } as const,
  metRow: {} as const,
  linkedGoalsList: { pl: 0, mt: 0.5, mb: 0 } as const,
  linkedGoalItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    listStyle: 'none',
  } as const,
  createGoalBtn: { mt: 0.5, p: 0, textTransform: 'none' } as const,
  actionsCell: { verticalAlign: 'top' } as const,
  topCell: { verticalAlign: 'top' } as const,
})

const SkillGapRow: React.FC<ISkillGapRowProps> = React.memo(
  ({ skillGap, canCreateGoal = false, onCreateGoal }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const hasGap = skillGap.gap > 0
    const gapLabel = hasGap
      ? `+${skillGap.gap}`
      : t('gap_analysis.gap_met', 'Met')

    const handleCreateGoal = useCallback(() => {
      onCreateGoal?.(skillGap)
    }, [onCreateGoal, skillGap])

    const actualLevelLabel =
      skillGap.assessmentSource === 'default'
        ? `${skillGap.actualLevel.title} (${t('gap_analysis.default_label', 'default')})`
        : skillGap.actualLevel.title

    const actualLevelTooltip =
      skillGap.assessmentSource === 'default'
        ? t(
            'gap_analysis.default_tooltip',
            "No manager-approved assessment found. Using your position's minimum skill level."
          )
        : ''

    return (
      <TableRow sx={hasGap ? styles.gapRow : styles.metRow}>
        {/* Skill name + category */}
        <TableCell sx={styles.topCell}>
          <Typography variant='body2' fontWeight='medium'>
            {skillGap.skill.title}
          </Typography>
          <Chip
            label={skillGap.skill.category.title}
            size='small'
            variant='outlined'
            sx={{ mt: 0.5 }}
          />
        </TableCell>

        {/* Required level */}
        <TableCell sx={styles.topCell}>
          <Chip
            label={skillGap.requiredLevel.title}
            size='small'
            color='primary'
            variant='outlined'
          />
        </TableCell>

        {/* Actual level */}
        <TableCell sx={styles.topCell}>
          {skillGap.assessmentSource === 'default' ? (
            <Tooltip title={actualLevelTooltip}>
              <Chip
                label={actualLevelLabel}
                size='small'
                color='default'
                variant='outlined'
              />
            </Tooltip>
          ) : (
            <Chip
              label={actualLevelLabel}
              size='small'
              color='default'
              variant='outlined'
            />
          )}
        </TableCell>

        {/* Gap */}
        <TableCell sx={styles.topCell}>
          <Typography
            variant='body2'
            color={hasGap ? 'error.main' : 'success.main'}
            fontWeight='medium'
          >
            {gapLabel}
          </Typography>
        </TableCell>

        {/* Mandatory */}
        <TableCell sx={styles.topCell}>
          <Typography variant='body2'>
            {skillGap.isMandatory
              ? t('gap_analysis.mandatory_yes', 'Yes')
              : t('gap_analysis.mandatory_no', 'No')}
          </Typography>
        </TableCell>

        {/* Linked goals + create goal action */}
        <TableCell sx={styles.actionsCell}>
          {hasGap && skillGap.linkedGoals.length > 0 && (
            <Box
              component='ul'
              sx={styles.linkedGoalsList}
              aria-label={t('gap_analysis.linked_goals_label', 'Linked goals')}
            >
              {skillGap.linkedGoals.map(goal => (
                <Box key={goal.id} component='li' sx={styles.linkedGoalItem}>
                  <Typography variant='caption' color='text.secondary'>
                    {goal.title} — {Math.round(goal.progressPercentage)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          {hasGap && canCreateGoal && (
            <Button
              variant='text'
              size='small'
              onClick={handleCreateGoal}
              sx={styles.createGoalBtn}
            >
              {t('gap_analysis.create_goal_btn', 'Create Goal')}
            </Button>
          )}
        </TableCell>
      </TableRow>
    )
  }
)

SkillGapRow.displayName = 'SkillGapRow'

export default SkillGapRow
