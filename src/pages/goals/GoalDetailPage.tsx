import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDateFormat } from '../../hooks'
import { useDeleteGoal, useGoal, useUpdateGoal } from '../../services'
import { TaskList } from './components/TaskList'

/**
 * Goal Detail Page
 * Displays full goal information with tasks
 * Feature 0001 - Phase 5A
 */
export const GoalDetailPage: React.FC = () => {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const { goalId } = useParams<{ goalId: string }>()
  const navigate = useNavigate()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Fetch goal data
  const { data: goal, isLoading, isError, error } = useGoal(goalId!)
  const deleteGoalMutation = useDeleteGoal()
  const updateGoalMutation = useUpdateGoal()

  const handleEdit = () => {
    navigate(`/goals/${goalId}/edit`)
  }

  const handleToggleComplete = async () => {
    if (!goalId || !goal) return

    try {
      const newStatus: 'completed' | 'open' = goal.isCompleted
        ? 'open'
        : 'completed'
      await updateGoalMutation.mutateAsync({
        goalId,
        goalData: {
          status: newStatus,
        },
      })
    } catch {
      // Error is handled by mutation
    }
  }

  const handleDelete = async () => {
    if (!goalId) return

    try {
      await deleteGoalMutation.mutateAsync(goalId)
      navigate('/goals', { replace: true })
    } catch {
      // Error is handled by mutation
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in_progress':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getPriorityLabel = (priority?: number) => {
    if (!priority) return null
    if (priority >= 75)
      return {
        label: t('pages.goals.priority.high', 'High'),
        color: 'error' as const,
      }
    if (priority >= 50)
      return {
        label: t('pages.goals.priority.medium', 'Medium'),
        color: 'warning' as const,
      }
    return {
      label: t('pages.goals.priority.low', 'Low'),
      color: 'info' as const,
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='400px'
        >
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  // Error state
  if (isError || !goal) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>
          {t('pages.goalDetail.errorLoading', 'Failed to load goal')}:{' '}
          {error?.message}
        </Alert>
        <Button
          component={Link}
          to='/goals'
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          {t('pages.goalDetail.backToGoals', 'Back to Goals')}
        </Button>
      </Container>
    )
  }

  const priorityInfo = getPriorityLabel(goal.priority)
  const completedTasks = goal.tasks
    ? goal.tasks.filter(t => t.isCompleted).length
    : 0
  const totalTasks = goal.tasks ? goal.tasks.length : 0

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to='/goals' color='inherit'>
          {t('pages.goals.title', 'Goals')}
        </MuiLink>
        <Typography color='text.primary'>{goal.title}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='start'
          mb={2}
        >
          <Box flexGrow={1}>
            <Typography variant='h4' component='h1' gutterBottom>
              {goal.title}
            </Typography>

            {/* Status chips */}
            <Stack direction='row' spacing={1} flexWrap='wrap' gap={0.5}>
              <Chip
                label={t(`pages.goals.status.${goal.status}`, goal.status)}
                color={getStatusColor(goal.status)}
                size='medium'
              />
              {priorityInfo && (
                <Chip
                  label={priorityInfo.label}
                  color={priorityInfo.color}
                  size='medium'
                />
              )}
              {goal.isCompleted && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label={t('pages.goals.completed', 'Completed')}
                  color='success'
                  size='medium'
                />
              )}
              {goal.visibility && (
                <Chip
                  label={t(
                    `goals.visibility.${goal.visibility}`,
                    goal.visibility
                  )}
                  variant='outlined'
                  size='medium'
                />
              )}
            </Stack>
          </Box>

          {/* Action buttons */}
          <Stack direction='row' spacing={1}>
            <Button
              variant={goal.isCompleted ? 'outlined' : 'contained'}
              startIcon={<CheckCircleIcon />}
              onClick={handleToggleComplete}
              disabled={updateGoalMutation.isPending}
            >
              {updateGoalMutation.isPending
                ? t('common.saving', 'Saving...')
                : goal.isCompleted
                  ? t('pages.goals.markIncomplete', 'Reopen')
                  : t('pages.goals.markComplete', 'Complete')}
            </Button>
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              {t('common.edit', 'Edit')}
            </Button>
            <IconButton color='error' onClick={() => setDeleteDialogOpen(true)}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Description */}
        {goal.description && (
          <Typography variant='body1' color='text.secondary' paragraph>
            {goal.description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Meta Information */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ flexWrap: 'wrap' }}
        >
          <Box sx={{ minWidth: 200, flex: 1 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
            >
              {t('pages.goals.progress', 'Progress')}
            </Typography>
            <Box mt={1}>
              <LinearProgress
                variant='determinate'
                value={goal.progressPercent}
                sx={{ height: 8, borderRadius: 1, mb: 0.5 }}
              />
              <Typography variant='h6'>
                {goal.progressPercent.toFixed(0)}%
              </Typography>
            </Box>
          </Box>

          <Box sx={{ minWidth: 200, flex: 1 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
            >
              {t('pages.goals.tasks', 'Tasks')}
            </Typography>
            <Typography variant='h6' mt={1}>
              {completedTasks} / {totalTasks}
            </Typography>
          </Box>

          {goal.deadline && (
            <Box sx={{ minWidth: 200, flex: 1 }}>
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
              >
                {t('pages.goals.deadline', 'Deadline')}
              </Typography>
              <Typography
                variant='h6'
                mt={1}
                color={
                  new Date(goal.deadline) < new Date() && !goal.isCompleted
                    ? 'error.main'
                    : 'inherit'
                }
              >
                {formatDate(goal.deadline, 'LONG')}
                {new Date(goal.deadline) < new Date() &&
                  !goal.isCompleted &&
                  ` (${t('pages.goals.overdue', 'Overdue')})`}
              </Typography>
            </Box>
          )}

          <Box sx={{ minWidth: 200, flex: 1 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
            >
              {t('pages.goals.createdAt', 'Created')}
            </Typography>
            <Typography variant='h6' mt={1}>
              {formatDate(goal.createdAt, 'LONG')}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Tasks Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant='h5' gutterBottom>
          {t('pages.goalDetail.tasks', 'Tasks')}
        </Typography>
        <TaskList goalId={goal.id} tasks={goal.tasks || []} />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          {t('pages.goalDetail.deleteConfirmTitle', 'Delete Goal?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'pages.goalDetail.deleteConfirmMessage',
              'Are you sure you want to delete this goal? This action cannot be undone.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            color='error'
            variant='contained'
            disabled={deleteGoalMutation.isPending}
          >
            {deleteGoalMutation.isPending
              ? t('common.deleting', 'Deleting...')
              : t('common.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
