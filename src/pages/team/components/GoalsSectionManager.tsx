import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TGoalDto } from '../../../dtos/GoalDto'
import { useGoalDeletionAction } from '../../../services/goalsQueryService'
import { useSuggestGoal } from '../../../services/teamQueryService'
import type { ISuggestGoalDto } from '../../../dtos/TeamMemberDto'
import { SuggestGoalModal } from './SuggestGoalModal'

interface GoalsSectionManagerProps {
  employeeId: string
  goals: TGoalDto[]
  isLoading?: boolean
}

const getStyles = () => ({
  container: { mt: 2 },
  goalPaper: { p: 2, mb: 1 },
  goalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap' as const,
  },
  taskList: { pl: 2, mt: 1 },
  actions: { ml: 'auto', display: 'flex', gap: 0.5 },
  addButton: { mt: 1 },
})

const STATUS_COLOR_MAP: Record<
  string,
  'default' | 'primary' | 'success' | 'warning' | 'info'
> = {
  suggested: 'info',
  not_started: 'default',
  open: 'default',
  in_progress: 'primary',
  completed: 'success',
}

/**
 * Manager view of a direct report's goals.
 * Supports suggesting goals, approving/rejecting deletion requests,
 * and accepting/rejecting suggested goals.
 */
export const GoalsSectionManager: React.FC<GoalsSectionManagerProps> = memo(
  ({ employeeId, goals, isLoading = false }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])
    const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null)
    const [suggestModalOpen, setSuggestModalOpen] = useState(false)

    const deletionAction = useGoalDeletionAction(employeeId)
    const suggestGoalMutation = useSuggestGoal(employeeId)

    const toggleExpanded = useCallback((goalId: string) => {
      setExpandedGoalId(prev => (prev === goalId ? null : goalId))
    }, [])

    const handleApproveDelete = useCallback(
      (goalId: string) => {
        deletionAction.mutate({ goalId, action: 'approve' })
      },
      [deletionAction]
    )

    const handleRejectDelete = useCallback(
      (goalId: string) => {
        deletionAction.mutate({ goalId, action: 'reject' })
      },
      [deletionAction]
    )

    const handleSuggestSubmit = useCallback(
      (dto: ISuggestGoalDto) => {
        suggestGoalMutation.mutate(dto, {
          onSuccess: () => setSuggestModalOpen(false),
        })
      },
      [suggestGoalMutation]
    )

    if (isLoading) {
      return (
        <Box display='flex' justifyContent='center' py={4}>
          <CircularProgress />
        </Box>
      )
    }

    return (
      <Box sx={styles.container}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>
            {t('team_dashboard.goals_section.title', 'Goals')}
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant='outlined'
            size='small'
            sx={styles.addButton}
            onClick={() => setSuggestModalOpen(true)}
          >
            {t('team_dashboard.goals_section.suggest_goal', 'Suggest Goal')}
          </Button>
        </Stack>

        {goals.length === 0 ? (
          <Typography color='text.secondary'>
            {t('team_dashboard.goals_section.empty', 'No goals yet.')}
          </Typography>
        ) : (
          goals.map(goal => (
            <Paper key={goal.id} variant='outlined' sx={styles.goalPaper}>
              <Box sx={styles.goalHeader}>
                <Chip
                  label={t(`pages.goals.status.${goal.status}`, goal.status)}
                  color={STATUS_COLOR_MAP[goal.status] ?? 'default'}
                  size='small'
                />
                {goal.has_pending_deletion_request && (
                  <Chip
                    label={t(
                      'team_dashboard.goals_section.deletion_requested',
                      'Deletion Requested'
                    )}
                    color='warning'
                    size='small'
                  />
                )}
                <Typography variant='subtitle2' sx={{ flexGrow: 1 }}>
                  {goal.name ?? goal.title}
                </Typography>

                <Box sx={styles.actions}>
                  {/* Deletion request actions */}
                  {goal.has_pending_deletion_request && (
                    <>
                      <Tooltip
                        title={t(
                          'team_dashboard.goals_section.approve_deletion',
                          'Approve deletion'
                        )}
                      >
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleApproveDelete(goal.id)}
                          disabled={deletionAction.isPending}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={t(
                          'team_dashboard.goals_section.reject_deletion',
                          'Reject deletion'
                        )}
                      >
                        <IconButton
                          size='small'
                          onClick={() => handleRejectDelete(goal.id)}
                          disabled={deletionAction.isPending}
                        >
                          <ThumbDownIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}

                  {/* Task expand toggle */}
                  {(goal.slim_tasks?.length ?? 0) > 0 && (
                    <IconButton
                      size='small'
                      onClick={() => toggleExpanded(goal.id)}
                    >
                      {expandedGoalId === goal.id ? (
                        <ExpandLessIcon fontSize='small' />
                      ) : (
                        <ExpandMoreIcon fontSize='small' />
                      )}
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Description */}
              {goal.description && (
                <Typography variant='body2' color='text.secondary' mt={0.5}>
                  {goal.description}
                </Typography>
              )}

              {/* Suggested by */}
              {goal.suggested_by_name && (
                <Typography
                  variant='caption'
                  color='text.secondary'
                  display='block'
                  mt={0.5}
                >
                  {t(
                    'team_dashboard.goals_section.suggested_by',
                    'Suggested by'
                  )}{' '}
                  {goal.suggested_by_name}
                </Typography>
              )}

              {/* Tasks collapse */}
              <Collapse in={expandedGoalId === goal.id}>
                <Divider sx={{ my: 1 }} />
                <List dense sx={styles.taskList}>
                  {goal.slim_tasks?.map(task => (
                    <ListItem key={task.id} disableGutters>
                      <CheckCircleIcon
                        fontSize='small'
                        color={task.is_completed ? 'success' : 'disabled'}
                        sx={{ mr: 1 }}
                      />
                      <ListItemText
                        primary={task.name}
                        primaryTypographyProps={{
                          variant: 'body2',
                          ...(task.is_completed && {
                            sx: {
                              textDecoration: 'line-through',
                              color: 'text.secondary',
                            },
                          }),
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Paper>
          ))
        )}

        <SuggestGoalModal
          open={suggestModalOpen}
          onClose={() => setSuggestModalOpen(false)}
          onSubmit={handleSuggestSubmit}
          isPending={suggestGoalMutation.isPending}
        />
      </Box>
    )
  }
)

GoalsSectionManager.displayName = 'GoalsSectionManager'
