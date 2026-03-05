import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FlagIcon from '@mui/icons-material/Flag'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { TGoalDto } from '../../../dtos/GoalDto'
import { useDateFormat } from '../../../hooks'

interface GoalCardProps {
  goal: TGoalDto
}

/**
 * Goal Card Component
 * Displays goal summary in card format
 * Memoized for performance optimization
 * Feature 0001 - Phase 3 & 5B
 */
export const GoalCard: React.FC<GoalCardProps> = memo(({ goal }) => {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleCardClick = useCallback(() => {
    navigate(`/goals/${goal.id}`)
  }, [navigate, goal.id])

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleEdit = useCallback(() => {
    handleMenuClose()
    navigate(`/goals/${goal.id}/edit`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, goal.id])

  // Calculate task completion
  const completedTasks = goal.tasks
    ? goal.tasks.filter(t => t.isCompleted).length
    : 0
  const totalTasks = goal.tasks ? goal.tasks.length : 0

  // Status colors
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

  // Priority label
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

  const priorityInfo = getPriorityLabel(goal.priority)

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea
        onClick={handleCardClick}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          {/* Header with status and menu */}
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='start'
            mb={1}
          >
            <Stack direction='row' spacing={1} flexWrap='wrap' gap={0.5}>
              <Chip
                label={t(`pages.goals.status.${goal.status}`, goal.status)}
                color={getStatusColor(goal.status)}
                size='small'
              />
              {priorityInfo && (
                <Chip
                  icon={<FlagIcon />}
                  label={priorityInfo.label}
                  color={priorityInfo.color}
                  size='small'
                />
              )}
              {goal.isCompleted && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label={t('pages.goals.completed', 'Completed')}
                  color='success'
                  size='small'
                />
              )}
            </Stack>

            <IconButton size='small' onClick={handleMenuOpen} sx={{ ml: 1 }}>
              <MoreVertIcon />
            </IconButton>
          </Stack>

          {/* Goal Title */}
          <Typography
            variant='h6'
            component='h3'
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '3em',
            }}
          >
            {goal.title}
          </Typography>

          {/* Description */}
          {goal.description && (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 2,
              }}
            >
              {goal.description}
            </Typography>
          )}

          {/* Progress */}
          <Box mb={1}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              mb={0.5}
            >
              <Typography variant='caption' color='text.secondary'>
                {t('pages.goals.progress', 'Progress')}
              </Typography>
              <Typography variant='caption' fontWeight='medium'>
                {goal.progressPercent.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant='determinate'
              value={goal.progressPercent}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>

          {/* Tasks count */}
          {totalTasks > 0 && (
            <Typography variant='caption' color='text.secondary'>
              {t('pages.goals.tasksCompleted', {
                completed: completedTasks,
                total: totalTasks,
                defaultValue: `${completedTasks} / ${totalTasks} tasks completed`,
              })}
            </Typography>
          )}

          {/* Deadline */}
          {goal.deadline && (
            <Box mt={1}>
              <Typography
                variant='caption'
                color={
                  new Date(goal.deadline) < new Date() && !goal.isCompleted
                    ? 'error.main'
                    : 'text.secondary'
                }
                fontWeight={
                  new Date(goal.deadline) < new Date() && !goal.isCompleted
                    ? 'bold'
                    : 'normal'
                }
              >
                {new Date(goal.deadline) < new Date() && !goal.isCompleted
                  ? t('pages.goals.overdue', 'Overdue')
                  : t('pages.goals.deadline', 'Deadline')}
                : {formatDate(goal.deadline, 'MEDIUM')}
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={e => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>{t('common.edit', 'Edit')}</MenuItem>
        <MenuItem onClick={() => navigate(`/goals/${goal.id}`)}>
          {t('common.view', 'View Details')}
        </MenuItem>
      </Menu>
    </Card>
  )
})
